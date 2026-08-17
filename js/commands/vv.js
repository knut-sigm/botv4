import { downloadContentFromMessage } from "baileys";

export const name = "vv";
export async function execute(sock, m, args) {
  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "> Knut XMD :⚠️Répondez à une photo, vidéo ou audio vue unique." },
        { quoted: m }
      );
      return;
    }

    // Extraction du vrai message (vue unique)
    const innerMsg =
      quoted.viewOnceMessageV2?.message ||
      quoted.viewOnceMessageV2Extension?.message ||
      quoted;

    // --- Image vue unique ---
    if (innerMsg.imageMessage) {
      const stream = await downloadContentFromMessage(innerMsg.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      await sock.sendMessage(
        m.key.remoteJid,
        { image: buffer, caption: "> Knut XMD :🤳🏾 Vue unique récupéré" },
        { quoted: m }
      );
      return;
    }

    // --- Vidéo vue unique ---
    if (innerMsg.videoMessage) {
      const stream = await downloadContentFromMessage(innerMsg.videoMessage, "video");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      await sock.sendMessage(
        m.key.remoteJid,
        { video: buffer, caption: "> Knut XMD : Vue unique récupéré" },
        { quoted: m }
      );
      return;
    }

    // --- Audio vue unique ---
    if (innerMsg.audioMessage) {
      const stream = await downloadContentFromMessage(innerMsg.audioMessage, "audio");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      await sock.sendMessage(
        m.key.remoteJid,
        { audio: buffer, mimetype: "audio/mp4", ptt: innerMsg.audioMessage.ptt || false },
        { quoted: m }
      );
      return;
    }

    await sock.sendMessage(
      m.key.remoteJid,
      { text: "> Knut XMD: ❌ Pas une photo, vidéo ou audio vue unique." },
      { quoted: m }
    );
  } catch (e) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur vv : " + e.message },
      { quoted: m }
    );
  }
}