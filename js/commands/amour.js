export const name = "amour";
export const description = "Demande à un membre ce qu'il a déjà fait par amour";
export const usage = "[@mention ou numéro]";

// Stockage en mémoire pour suivre l'ordre des mentions
const groupCycles = new Map();

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    
    // Vérifier que c'est un groupe
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: "❌ Cette commande fonctionne uniquement dans les groupes."
      }, { quoted: msg });
    }

    // Obtenir les informations du groupe
    const groupMetadata = await sock.groupMetadata(from);
    let participants = groupMetadata.participants;
    
    // Filtrer les bots et soi-même
    participants = participants.filter(p => 
      !p.id.includes('status') && 
      p.id !== sock.user.id
    );
    
    if (participants.length === 0) {
      return await sock.sendMessage(from, {
        text: "❌ Aucun membre éligible dans le groupe."
      }, { quoted: msg });
    }
    
    // Initialiser ou récupérer le cycle du groupe
    if (!groupCycles.has(from)) {
      // Mélanger aléatoirement les participants pour le cycle
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      groupCycles.set(from, {
        members: shuffled,
        currentIndex: 0,
        originalOrder: shuffled.map(p => p.id)
      });
    }
    
    const cycle = groupCycles.get(from);
    let targetParticipant;
    
    // CAS 1: Mention spécifique dans le message
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      const mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      targetParticipant = participants.find(p => p.id === mentionedJid);
      
      if (!targetParticipant) {
        return await sock.sendMessage(from, {
          text: "❌ Membre mentionné non trouvé dans le groupe."
        }, { quoted: msg });
      }
      
      // Ne pas avancer l'index pour une mention manuelle
    }
    // CAS 2: Recherche par argument
    else if (args.length > 0) {
      const searchTerm = args.join(" ").toLowerCase();
      targetParticipant = participants.find(p => 
        p.id.replace(/@s\.whatsapp\.net/, '').includes(searchTerm) ||
        p.pushName?.toLowerCase().includes(searchTerm)
      );
      
      if (!targetParticipant) {
        return await sock.sendMessage(from, {
          text: `❌ Aucun membre trouvé correspondant à "${args.join(" ")}"`
        }, { quoted: msg });
      }
      
      // Ne pas avancer l'index pour une recherche manuelle
    }
    // CAS 3: Mode automatique (cycle)
    else {
      // Si on a atteint la fin du cycle, réinitialiser automatiquement
      if (cycle.currentIndex >= cycle.members.length) {
        // Réinitialiser avec un nouveau mélange
        const newShuffle = [...participants].sort(() => Math.random() - 0.5);
        cycle.members = newShuffle;
        cycle.currentIndex = 0;
        cycle.originalOrder = newShuffle.map(p => p.id);
      }
      
      targetParticipant = cycle.members[cycle.currentIndex];
      cycle.currentIndex++;
    }
    
    // Message avec mention et emojis hot/love
    const userName = targetParticipant.pushName || targetParticipant.id.split('@')[0];
    const memberNumber = participants.findIndex(p => p.id === targetParticipant.id) + 1;
    
    // Sélection aléatoire d'emojis hot/love pour la question
    const hotEmojis = [
      "🥵", "😈", "💦", "🔥", "👅", "💋", "🍆", "🍑", 
      "💘", "❤️‍🔥", "🥴", "😏", "🫦", "👄", "💄", "💓",
      "🫀", "🧨", "⚡️", "🌟", "✨", "🎇", "💕", "💝"
    ];
    
    const selectedEmojis = [];
    for (let i = 0; i < 3; i++) {
      const randomEmoji = hotEmojis[Math.floor(Math.random() * hotEmojis.length)];
      if (!selectedEmojis.includes(randomEmoji)) {
        selectedEmojis.push(randomEmoji);
      }
    }
    
    const emojiString = selectedEmojis.join(" ");
    
    const message = 
      `> 🫦🔥 *QUESTION CHAUDE DE L'AMOUR* 🔥🫦\n\n` +
      `${emojiString}\n` +
      `@${targetParticipant.id.split('@')[0]} Par amour tu as déjà fait quoi ? ${emojiString}\n\n` +
      `_Sois honnête... on veut tous savoir! 🫣_\n\n` +
      `📊 **Membre n°${memberNumber}/${participants.length}**\n` +
      `🔄 **Progression du cycle :** ${cycle.currentIndex}/${cycle.members.length}`;
    
    await sock.sendMessage(from, {
      text: message,
      mentions: [targetParticipant.id]
    }, { quoted: msg });
    
    // Notification si le cycle est terminé après cette mention
    if (cycle.currentIndex >= cycle.members.length && !args.length && 
        !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      setTimeout(async () => {
        await sock.sendMessage(from, {
          text: "🔄 *CYCLE TERMINÉ !* 🔄\n\n" +
                "🎊 Tous les membres ont reçu leur question chaude !\n" +
                "💖 La prochaine commande `!amour` lancera un nouveau cycle passionné !"
        });
      }, 2000);
    }
    
  } catch (err) {
    console.error("❌ Erreur commande amour :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "> ⚠️ Erreur: La passion était trop forte, commande échouée!"
    }, { quoted: msg });
  }
}