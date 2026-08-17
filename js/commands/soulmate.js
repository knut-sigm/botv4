export const name = "soulmate";
export const description = "Find your soulmate in the group";
export const category = "Fun";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  // Vérifier si c'est un groupe
  if (!from.endsWith('@g.us')) {
    return await sock.sendMessage(from, { 
      text: "❌ *KNUT XMD*: This command only works in groups"
    }, { quoted: msg });
  }

  try {
    // Obtenir les membres du groupe
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants.map(p => p.id);
    
    if (participants.length < 2) {
      return await sock.sendMessage(from, { 
        text: "❌ *KNUT XMD*: Need at least 2 members in the group"
      }, { quoted: msg });
    }

    // Filtrer pour ne pas se choisir soi-même
    const otherParticipants = participants.filter(id => id !== sender);
    
    if (otherParticipants.length === 0) {
      return await sock.sendMessage(from, { 
        text: "❌ *KNUT XMD*: You're alone in this group 😢"
      }, { quoted: msg });
    }

    // Choisir un "soulmate" aléatoire
    const soulmate = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
    
    // Créer le message avec mentions
    const message = `👫 *KNUT XMD - Soulmate Match* 👫\n\n` +
                    `@${sender.split('@')[0]} 💘 @${soulmate.split('@')[0]}\n\n` +
                    `A match made in heaven! ✨`;
    
    // Mentions pour les deux utilisateurs
    const mentions = [sender, soulmate];
    
    await sock.sendMessage(from, { 
      text: message,
      mentions: mentions
    }, { quoted: msg });

  } catch (err) {
    console.error("Mysoulmate Error:", err);
    await sock.sendMessage(from, { 
      text: "❌ *KNUT XMD*: Error finding soulmate\n" +
            "Please try again later"
    }, { quoted: msg });
  }
}