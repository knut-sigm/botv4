export const name = "unblock";
export const description = "Unblock a WhatsApp user";
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
            "• Mention: .unblock @user\n" +
            "• Reply: .unblock (to a message)\n" +
            "• Number: .unblock 1234567890" 
    }, { quoted: msg });
  }

  try {
    // Déblocage de l'utilisateur
    await sock.updateBlockStatus(targetUser, 'unblock');
    
    await sock.sendMessage(from, { 
      text: `✅ *KNUT XMD*: User unblocked successfully\n` +
            `User: ${targetUser.split('@')[0]}`
    }, { quoted: msg });

  } catch (err) {
    console.error("Unblock command error:", err);
    await sock.sendMessage(from, { 
      text: `❌ *KNUT XMD*: Failed to unblock user\n` +
            `Error: ${err.message || 'Unknown error'}`
    }, { quoted: msg });
  }
}