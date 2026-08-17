import { getGroupProtections } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

export const name = "protectionstate";

export async function execute(sock, msg, args, from) {
  try {
    // Vérifie que c'est dans un groupe
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : Cette commande est réservée aux groupes uniquement." 
      }, { quoted: msg });
      return;
    }

    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");

    // Récupération des owners et sudo
    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));

    const isOwner = owners.includes(senderNum);
    const isSudo = sudoList.includes(senderNum);
    const isAdmin = await isGroupAdmin(sock, from, sender);

    // Permission : admin, owner ou sudo requis
    if (!isOwner && !isSudo && !isAdmin) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : Accès refusé.\nSeuls les admins, owners ou sudo peuvent voir l'état des protections." 
      }, { quoted: msg });
      return;
    }

    // Récupération des protections du groupe
    const protections = getGroupProtections(from);

    // Liste des protections à afficher (ajoute ou retire selon tes besoins)
    const protectionList = [
      { key: "antiMessage",   label: "🚫 Anti-Message (texte)",        emoji: protections.antiMessage ? "✅" : "❌" },
      { key: "antiLink",      label: "🔗 Anti-Link",                  emoji: protections.antiLink ? "✅" : "❌" },
      { key: "antiBot",       label: "🤖 Anti-Bot",                   emoji: protections.antiBot ? "✅" : "❌" },
      { key: "antiSticker",   label: "🖼️ Anti-Sticker",              emoji: protections.antiSticker ? "✅" : "❌" },
      { key: "antiVoice",     label: "🎤 Anti-Vocal",                 emoji: protections.antiVoice ? "✅" : "❌" },
      { key: "antiVideo",     label: "🎥 Anti-Vidéo",                 emoji: protections.antiVideo ? "✅" : "❌" },
      { key: "antiSpam",      label: "📛 Anti-Spam",                  emoji: protections.antiSpam ? "✅" : "❌" },
      { key: "autoReact",     label: "🤩 Auto-Réaction",              emoji: protections.autoReact ? "✅" : "❌" },
      { key: "autoVV",        label: "👁️‍🗨️ Auto-VV (Vue Unique)",     emoji: protections.autoVV ? "✅" : "❌" },
      { key: "antipromote1",  label: "🔥 Anti-Promote",               emoji: protections.antipromote1 ? "✅" : "❌" },
      { key: "welcome",       label: "🎉 Welcome Message",            emoji: protections.welcome ? "✅" : "❌" },
      { key: "goodbye",       label: "❌ Goodbye Message",             emoji: protections.goodbye ? "✅" : "❌" },
      { key: "autoKnutChat",  label: "💬 Auto-Chat (Texte)",          emoji: protections.autoKnutChat ? "✅" : "❌" },
      { key: "knuta",         label: "🎙️ KnutA (IA Vocale Auto)",    emoji: protections.knuta ? "✅" : "❌" }
    ];

    // Construction du message
    const groupMetadata = await sock.groupMetadata(from);
    const groupName = groupMetadata.subject || "Groupe inconnu";

    let statusText = `> *ÉTAT DES PROTECTIONS*\n`;
    statusText += `> 📍 Groupe : *${groupName}*\n\n`;

    protectionList.forEach(prot => {
      statusText += `\( {prot.emoji} \){prot.label}\n`;
    });

    statusText += `\n> 🔧 Utilise les commandes comme \`!antilink on/off\`, \`!knuta on/off\`, etc. pour modifier.`;

    await sock.sendMessage(from, { text: statusText }, { quoted: msg });

  } catch (err) {
    console.error("Erreur commande protectionstate :", err);
    await sock.sendMessage(from, { 
      text: "> Knut XMD : ⚠️ Une erreur est survenue lors de la récupération des protections." 
    }, { quoted: msg });
  }
}

// Fonction pour vérifier si l'utilisateur est admin
async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    return metadata.participants.some(p => p.id === userJid && p.admin);
  } catch {
    return false;
  }
}