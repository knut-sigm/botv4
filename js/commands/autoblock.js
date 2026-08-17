export const name = "autoblock";
export const description = "Automatically block/unblock a user 30 times";
export const category = "Admin";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Détection de l'utilisateur cible
  let targetUser = null;

  // 1. Mention
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }
  // 2. Message cité
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
            "• Mention: .autoblock @user\n" +
            "• Reply: .autoblock (to a message)\n" +
            "• Number: .autoblock 1234567890"
    }, { quoted: msg });
  }

  try {
    await sock.sendMessage(from, { text: `⏳ *KNUT XMD*: Starting autoblock for ${targetUser.split('@')[0]}...` }, { quoted: msg });

    // Boucle 30 fois
    for (let i = 1; i <= 30; i++) {
      await sock.updateBlockStatus(targetUser, 'block');
      await new Promise(r => setTimeout(r, 500)); // délai 0.5s
      await sock.updateBlockStatus(targetUser, 'unblock');
      await new Promise(r => setTimeout(r, 500)); // délai 0.5s
    }

    await sock.sendMessage(from, { 
      text: `✅ *KNUT XMD*: Autoblock finished for ${targetUser.split('@')[0]} (30 cycles completed)` 
    }, { quoted: msg });

  } catch (err) {
    console.error("Autoblock command error:", err);
    await sock.sendMessage(from, { 
      text: `❌ *KNUT XMD*: Failed during autoblock\nError: ${err.message || 'Unknown error'}`
    }, { quoted: msg });
  }
};