export const name = "ping";
import fs from "fs";
import path from "path";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    let thumbBuffer;
    try {
      thumbBuffer = fs.readFileSync(path.resolve("./knut.jpg"));
    } catch (err) {
      console.error("❌ knut.jpg not found:", err.message);
      thumbBuffer = null;
    }

    // Début test de latence
    const start = Date.now();
    const sentMsg = await sock.sendMessage(from, { text: "> 𝐼'𝑚 𝑐𝑟𝑎𝑧𝑦....𝑚𝑎𝑦𝑏𝑒..." }, { quoted: msg });
    const latency = Date.now() - start;

    // Réponse stylisée
    const reply = `> Knut XMD: 🫩 Latence : ${latency} ms`;

    await sock.sendMessage(from, {
      text: `> ${reply}`,
      contextInfo: {
        externalAdReply: {
          title: "⚫ KNUT-XMD-V4",
          body: "Rejoignez nous ici !!!",
          mediaType: 1,
          thumbnail: thumbBuffer,
          renderLargerThumbnail: false,
          mediaUrl: "./knut.jpg",
          sourceUrl: "./knut.jpg",
          thumbnailUrl: "https://whatsapp.com/channel/0029Vb75xwOADTOBVjSgJV0k"
        }
      }
    }, { quoted: sentMsg });

  } catch (err) {
    console.error("❌ Erreur ping :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "> ⚠️ KNUT XMD: Impossible de calculer la vitesse."
    }, { quoted: msg });
  }
}
