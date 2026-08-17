export const name = "delete";

export async function execute(sock, msg, args) {
  try {
    if (!msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "> Knut XMD : Réponds au message à supprimer." }, { quoted: msg });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      delete: {
        remoteJid: msg.key.remoteJid,
        fromMe: false,
        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
        participant: msg.message.extendedTextMessage.contextInfo.participant
      }
    });

  } catch (err) {
    console.error(" Erreur delete :", err);
  }
}