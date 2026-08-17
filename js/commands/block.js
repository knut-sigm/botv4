export const name = "block";
export const description = "Block a WhatsApp user";
export const category = "Admin";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  // Détection de l'utilisateur cible
  let targetUser = null;
  
  // 1. Mention dans le message
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }
  // 2. Message cité (réponse)
  else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    targetUser = msg.message.extendedTextMessage.contextInfo.participant;
  }
  // 3. Numéro fourni en argument
  else if (args[0]) {
    const num = args[0].replace(/[^0-9]/g, '');
    if (num.length >= 10) {
      targetUser = num + '@s.whatsapp.net';
    }
  }

  if (!targetUser) {
    return await sock.sendMessage(from, { 
      text: "❌ *KNUT XMD*: No user specified\n\n" +
            "Usage:\n" +
            "• Mention: .block @user\n" +
            "• Reply: .block (to a message)\n" +
            "• Number: .block 1234567890" 
    }, { quoted: msg });
  }

  try {
    // Blocage de l'utilisateur
    await sock.updateBlockStatus(targetUser, 'block');
    
    await sock.sendMessage(from, { 
      text: `✅ *KNUT XMD*: User blocked successfully\n` +
            `User: ${targetUser.split('@')[0]}`
    }, { quoted: msg });

  } catch (err) {
    console.error("Block command error:", err);
    await sock.sendMessage(from, { 
      text: `❌ *KNUT XMD*: Failed to block user\n` +
            `Error: ${err.message || 'Unknown error'}`
    }, { quoted: msg });
  }
}