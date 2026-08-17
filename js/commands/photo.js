import { downloadContentFromMessage } from "baileys";

export const name = "photo";
export async function execute(sock, m, args) {
  try {
    // Vérifie si on répond à un sticker
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
    if (!quoted) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "> Knut XMD: Répondez au sticker à convertir en image." },
        { quoted: m }
      );
      return;
    }

    // Télécharge le sticker
    const stream = await downloadContentFromMessage(quoted, "sticker");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Renvoie le sticker comme photo
    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: buffer,
        caption: "> Knut XMD: Conversion reussie",
      },
      { quoted: m }
    );
  } catch (e) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "> Knut XMD: ❌ Erreur conversion sticker → photo : " + e.message },
      { quoted: m }
    );
  }
}