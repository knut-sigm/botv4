import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "baileys";

// 🔥 Lecture directe depuis la racine du projet
const configPath = path.join(process.cwd(), "config.json");

let config = { users: {}, owners: [] };
try {
  config = JSON.parse(fs.readFileSync(configPath));
} catch (err) {
  console.error("Erreur lecture config.json :", err);
}

export const name = "vv2";

export async function execute(sock, m, args) {
  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return await sock.sendMessage(
        m.key.remoteJid,
        { text: "> Knut XMD :⚠️ Répondez à une photo, vidéo ou audio vue unique." },
        { quoted: m }
      );
    }

    const innerMsg =
      quoted.viewOnceMessageV2?.message ||
      quoted.viewOnceMessageV2Extension?.message ||
      quoted;

    // 🔥 Respect exact de ta structure
    if (!Array.isArray(config.owners) || config.owners.length === 0) {
      return await sock.sendMessage(
        m.key.remoteJid,
        { text: "> Knut XMD :❌ Aucun owner configuré." },
        { quoted: m }
      );
    }

    let buffer = Buffer.from([]);
    let mediaType = null;
    let caption = `> Knut XMD : Media récupéré depuis ${m.key.remoteJid}`;

    if (innerMsg.imageMessage) {
      const stream = await downloadContentFromMessage(innerMsg.imageMessage, "image");
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      mediaType = "image";
    }
    else if (innerMsg.videoMessage) {
      const stream = await downloadContentFromMessage(innerMsg.videoMessage, "video");
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      mediaType = "video";
    }
    else if (innerMsg.audioMessage) {
      const stream = await downloadContentFromMessage(innerMsg.audioMessage, "audio");
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      mediaType = "audio";
    }
    else {
      return await sock.sendMessage(
        m.key.remoteJid,
        { text: "> Knut XMD :❌ Pas un média vue unique valide." },
        { quoted: m }
      );
    }

    // 🚀 Envoi à tous les owners
    for (const ownerNumber of config.owners) {
      const ownerJid = ownerNumber.includes("@")
        ? ownerNumber
        : `${ownerNumber}@s.whatsapp.net`;

      if (mediaType === "image") {
        await sock.sendMessage(ownerJid, { image: buffer, caption });
      }
      else if (mediaType === "video") {
        await sock.sendMessage(ownerJid, { video: buffer, caption });
      }
      else if (mediaType === "audio") {
        await sock.sendMessage(ownerJid, {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: innerMsg.audioMessage?.ptt || false
        });
      }
    }

    await sock.sendMessage(
      m.key.remoteJid,
      { text: "> Knut XMD : ✅ Media envoyé aux owners." },
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
