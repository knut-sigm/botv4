import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "baileys";

export const name = "save";
export async function execute(sock, m, args) {
  try {
    const selfJid = sock.user.id; // ton propre JID
    const msg = m.message?.extendedTextMessage
      ? m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      : m.message;

    if (!msg) {
      await sock.sendMessage(m.key.remoteJid, { text: "> Knut XMD : Répondez à un média ou texte pour le sauvegarder" }, { quoted: m });
      return;
    }

    const type = Object.keys(msg)[0];

    // === Texte ===
    if (type === "conversation" || type === "extendedTextMessage") {
      const text =
        msg.conversation || msg.extendedTextMessage?.text || "⚡ Message vide";
      await sock.sendMessage(selfJid, { text: `> Knut XMD: 💾 Sauvegarde:\n\n${text}` });
      await sock.sendMessage(m.key.remoteJid, { text: "> Knut XMD : Texte sauvegardé" }, { quoted: m });
      return;
    }

    // === Médias ===
    const buffer = await downloadMediaMessage(
      { message: msg },
      "buffer",
      {},
      { logger: console }
    );

    let fileName = Date.now().toString();
    let sendContent = {};

    if (type === "imageMessage") {
      fileName += ".jpg";
      sendContent = { image: buffer, caption: "> Knut XMD : Image sauvegardé" };
    } else if (type === "videoMessage") {
      fileName += ".mp4";
      sendContent = { video: buffer, caption: "> Knut XMD : video sauvegardé" };
    } else if (type === "audioMessage") {
      fileName += ".mp3";
      sendContent = { audio: buffer, mimetype: "audio/mpeg", fileName };
    } else if (type === "documentMessage") {
      const ext = msg.documentMessage.fileName || "doc";
      fileName += `_${ext}`;
      sendContent = { document: buffer, fileName };
    } else if (type === "stickerMessage") {
      fileName += ".webp";
      sendContent = { sticker: buffer };
    } else {
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Type non supporté." }, { quoted: m });
      return;
    }

    // Envoi dans ton privé
    await sock.sendMessage(selfJid, sendContent);
    await sock.sendMessage(m.key.remoteJid, { text: "> Knut XMD: ✅ Média sauvegardé" }, { quoted: m });
  } catch (e) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur save : " + e.message }, { quoted: m });
  }
}