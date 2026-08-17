import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Configuration
const BOT_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const QUESTIONS_FILE = path.join(BOT_ROOT, 'json', 'kofane.json');
const PLAYERS_FILE = path.join(BOT_ROOT, 'json', 'kgame.json');
const COOLDOWN = 5000; // 5 secondes entre deux !kofane

// Cache
const cooldowns = new Map();
let questions = [];
let players = [];

// Charger les données
async function loadData() {
  try {
    // Charger les questions
    const questionsData = await fs.readFile(QUESTIONS_FILE, 'utf-8');
    questions = JSON.parse(questionsData);
    
    // Charger les joueurs (ou créer le fichier s'il n'existe pas)
    try {
      const playersData = await fs.readFile(PLAYERS_FILE, 'utf-8');
      players = JSON.parse(playersData);
    } catch {
      players = [];
      await savePlayers();
    }
    
    console.log(`✅ Kofane: ${questions.length} questions, ${players.length} joueurs`);
  } catch (error) {
    console.error('❌ Erreur chargement données:', error);
    questions = [];
    players = [];
  }
}

// Sauvegarder les joueurs
async function savePlayers() {
  await fs.writeFile(PLAYERS_FILE, JSON.stringify(players, null, 2), 'utf-8');
}

// Obtenir une question aléatoire
function getRandomQuestion() {
  if (questions.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// Obtenir un joueur aléatoire
function getRandomPlayer() {
  if (players.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex];
}

// Vérifier le cooldown
function checkCooldown(jid) {
  const lastTime = cooldowns.get(jid);
  if (!lastTime) return true;
  
  const now = Date.now();
  const diff = now - lastTime;
  return diff > COOLDOWN;
}

// Formater le JID
function formatJid(input) {
  if (input.includes('@s.whatsapp.net')) return input;
  if (input.includes('@')) return input;
  return `${input.replace(/\D/g, '')}@s.whatsapp.net`;
}

// ============ COMMANDE PRINCIPALE ============
export const name = "kofane";
export const aliases = ["k", "truth"];

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  
  // Vérifier si on est dans un groupe
  if (!isGroup) {
    return await sock.sendMessage(from, {
      text: "❌ Cette commande fonctionne uniquement dans les groupes !"
    }, { quoted: msg });
  }
  
  // Sous-commandes
  const subCommand = args[0]?.toLowerCase();
  
  // !kofane add - Ajouter un joueur
  if (subCommand === 'add' || subCommand === 'ajouter') {
    return await handleAddPlayer(sock, msg, args);
  }
  
  // !kofane del - Supprimer un joueur
  if (subCommand === 'del' || subCommand === 'remove' || subCommand === 'supprimer') {
    return await handleRemovePlayer(sock, msg, args);
  }
  
  // !kofane liste - Lister les joueurs
  if (subCommand === 'liste' || subCommand === 'list' || subCommand === 'players') {
    return await handleListPlayers(sock, msg);
  }
  
  // !kofane reset - Réinitialiser la liste
  if (subCommand === 'reset' || subCommand === 'clear') {
    return await handleResetPlayers(sock, msg);
  }
  
  // !kofane help - Aide
  if (subCommand === 'help' || subCommand === 'aide') {
    return await handleHelp(sock, msg);
  }
  
  // !kofane (commande principale)
  return await handleMainGame(sock, msg, from);
}

// ============ HANDLERS ============

async function handleMainGame(sock, msg, groupJid) {
  // Vérifier le cooldown
  if (!checkCooldown(groupJid)) {
    const remaining = COOLDOWN - (Date.now() - cooldowns.get(groupJid));
    return await sock.sendMessage(groupJid, {
      text: `⏳ Attends ${Math.ceil(remaining/1000)} secondes avant de rejouer !`
    }, { quoted: msg });
  }
  
  // Charger les données si nécessaire
  if (questions.length === 0) {
    await loadData();
  }
  
  // Vérifier s'il y a des joueurs
  if (players.length === 0) {
    return await sock.sendMessage(groupJid, {
      text: "❌ Aucun joueur dans la liste !\n\n" +
            "Ajoute des joueurs avec:\n" +
            "• `!kofane add @mention`\n" +
            "• `!kofane add` (en réponse à un message)"
    }, { quoted: msg });
  }
  
  // Vérifier s'il y a des questions
  const question = getRandomQuestion();
  if (!question) {
    return await sock.sendMessage(groupJid, {
      text: "❌ Aucune question disponible !\nVérifiez le fichier kofane.json"
    }, { quoted: msg });
  }
  
  // Choisir un joueur aléatoire
  const player = getRandomPlayer();
  if (!player) {
    return await sock.sendMessage(groupJid, {
      text: "❌ Erreur: aucun joueur disponible !"
    }, { quoted: msg });
  }
  
  // Mettre à jour le cooldown
  cooldowns.set(groupJid, Date.now());
  
  // Générer des emojis aléatoires
  const emojis = ["🔥", "🎲", "😈", "😏", "🫦", "💋", "👁️", "👅"];
  const randomEmojis = [];
  for (let i = 0; i < 3; i++) {
    randomEmojis.push(emojis[Math.floor(Math.random() * emojis.length)]);
  }
  const emojiString = randomEmojis.join(" ");
  
  // Créer le message
  const message = 
    `${emojiString}\n\n` +
    `> 🎲 *QUESTION KOFANE* 🎲\n\n` +
    `@${player.split('@')[0]} répond à cette vérité :\n\n` +
    `"${question.question}"\n\n` +
    `_Sois honnête... on veut tous savoir ! 🫣_\n\n` +
    `📊 Joueurs dans le jeu : ${players.length}`;
  
  // Envoyer avec mention
  await sock.sendMessage(groupJid, {
    text: message,
    mentions: [player]
  }, { quoted: msg });
}

async function handleAddPlayer(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  // Charger les joueurs si nécessaire
  if (players.length === 0) {
    await loadData();
  }
  
  let targetJid = null;
  
  // Cas 1: Mention dans la commande
  if (args[1] && args[1].startsWith('@')) {
    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mention && mention.length > 0) {
      targetJid = mention[0];
    }
  }
  // Cas 2: Réponse à un message
  else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    targetJid = msg.message.extendedTextMessage.contextInfo.participant;
  }
  // Cas 3: JID directement dans les arguments
  else if (args[1]) {
    targetJid = formatJid(args[1]);
  }
  
  if (!targetJid) {
    return await sock.sendMessage(from, {
      text: "❌ Usage :\n" +
            "• `!kofane add @mention`\n" +
            "• `!kofane add` (en réponse à un message)\n" +
            "• `!kofane add 1234567890`"
    }, { quoted: msg });
  }
  
  // Vérifier si le joueur est déjà dans la liste
  if (players.includes(targetJid)) {
    return await sock.sendMessage(from, {
      text: `⚠️ @${targetJid.split('@')[0]} est déjà dans la liste des joueurs !`
    }, { quoted: msg });
  }
  
  // Ajouter le joueur
  players.push(targetJid);
  await savePlayers();
  
  await sock.sendMessage(from, {
    text: `✅ @${targetJid.split('@')[0]} a été ajouté à la liste des joueurs !\n` +
          `🎮 Joueurs total : ${players.length}`,
    mentions: [targetJid]
  }, { quoted: msg });
}

async function handleRemovePlayer(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  // Charger les joueurs si nécessaire
  if (players.length === 0) {
    await loadData();
  }
  
  let targetJid = null;
  
  // Cas 1: Mention dans la commande
  if (args[1] && args[1].startsWith('@')) {
    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mention && mention.length > 0) {
      targetJid = mention[0];
    }
  }
  // Cas 2: Réponse à un message
  else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    targetJid = msg.message.extendedTextMessage.contextInfo.participant;
  }
  // Cas 3: JID directement dans les arguments
  else if (args[1]) {
    targetJid = formatJid(args[1]);
  }
  
  if (!targetJid) {
    return await sock.sendMessage(from, {
      text: "❌ Usage :\n" +
            "• `!kofane del @mention`\n" +
            "• `!kofane del` (en réponse à un message)\n" +
            "• `!kofane del 1234567890`"
    }, { quoted: msg });
  }
  
  // Vérifier si le joueur est dans la liste
  const index = players.indexOf(targetJid);
  if (index === -1) {
    return await sock.sendMessage(from, {
      text: `❌ @${targetJid.split('@')[0]} n'est pas dans la liste des joueurs !`
    }, { quoted: msg });
  }
  
  // Supprimer le joueur
  players.splice(index, 1);
  await savePlayers();
  
  await sock.sendMessage(from, {
    text: `🗑️ @${targetJid.split('@')[0]} a été supprimé de la liste des joueurs !\n` +
          `🎮 Joueurs restants : ${players.length}`,
    mentions: [targetJid]
  }, { quoted: msg });
}

async function handleListPlayers(sock, msg) {
  const from = msg.key.remoteJid;
  
  // Charger les joueurs si nécessaire
  if (players.length === 0) {
    await loadData();
  }
  
  if (players.length === 0) {
    return await sock.sendMessage(from, {
      text: "📋 *LISTE DES JOUEURS*\n\n" +
            "Aucun joueur dans la liste !\n\n" +
            "Ajoutez des joueurs avec:\n" +
            "• `!kofane add @mention`\n" +
            "• `!kofane add` (en réponse)"
    }, { quoted: msg });
  }
  
  let listText = "📋 *LISTE DES JOUEURS KOFANE*\n\n";
  
  players.forEach((player, index) => {
    const number = player.split('@')[0];
    listText += `${index + 1}. @${number}\n`;
  });
  
  listText += `\n🎮 Total : ${players.length} joueur(s)`;
  
  await sock.sendMessage(from, {
    text: listText,
    mentions: players
  }, { quoted: msg });
}

async function handleResetPlayers(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || from;
  
  // Vérifier si c'est un admin (simplifié)
  // Vous pouvez ajouter votre propre logique de vérification admin
  const isAdmin = true; // À remplacer par votre logique admin
  
  if (!isAdmin) {
    return await sock.sendMessage(from, {
      text: "❌ Cette commande est réservée aux administrateurs !"
    }, { quoted: msg });
  }
  
  // Réinitialiser la liste
  players = [];
  await savePlayers();
  
  await sock.sendMessage(from, {
    text: "🔄 *Liste des joueurs réinitialisée !*\n\n" +
          "Tous les joueurs ont été supprimés de la liste.\n" +
          "Utilisez `!kofane add` pour ajouter de nouveaux joueurs."
  }, { quoted: msg });
}

async function handleHelp(sock, msg) {
  const helpText = 
    "🎮 *AIDE - COMMANDES KOFANE*\n\n" +
    "🎲 *Commandes disponibles:*\n\n" +
    "• `!kofane` - Pose une question aléatoire à un joueur\n" +
    "• `!kofane add @mention` - Ajoute un joueur\n" +
    "• `!kofane del @mention` - Supprime un joueur\n" +
    "• `!kofane liste` - Liste tous les joueurs\n" +
    "• `!kofane reset` - Réinitialise la liste (admin)\n" +
    "• `!kofane help` - Affiche cette aide\n\n" +
    "📌 *Comment ajouter des joueurs:*\n" +
    "1. `!kofane add @mention` (mentionnez la personne)\n" +
    "2. `!kofane add` (en réponse à un message)\n" +
    "3. `!kofane add 1234567890` (avec le numéro)\n\n" +
    "🎯 *Le jeu utilise uniquement les joueurs ajoutés !*";
  
  await sock.sendMessage(msg.key.remoteJid, {
    text: helpText
  }, { quoted: msg });
}

// Charger les données au démarrage
await loadData();
console.log("✅ Commande Kofane chargée !");