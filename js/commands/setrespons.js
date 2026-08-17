import { downloadContentFromMessage } from "baileys";
import fs from "fs";
import { join } from "path";

export const name = "setrespons";

export async function execute(sock, m, args) {
  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
    if (!quoted.audioMessage) {
      await sock.sendMessage(m.key.remoteJid, 
        { text: "❌ Réponds à un audio" }, 
        { quoted: m }
      );
      return;
    }

    await sock.sendMessage(m.key.remoteJid, 
      { text: "🔄 Traitement..." }, 
      { quoted: m }
    );

    const stream = await downloadContentFromMessage(quoted.audioMessage, "audio");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    if (buffer.length === 0) throw new Error("Audio vide");

    const outputPath = join(process.cwd(), "knutxmd/respon.mp3");
    fs.writeFileSync(outputPath, buffer);
    const stats = fs.statSync(outputPath);

    await sock.sendMessage(m.key.remoteJid, 
      { text: `✅ Audio défini (${Math.round(stats.size/1024)} KB)` }, 
      { quoted: m }
    );

  } catch (e) {
    console.error("setrespons error:", e);
    await sock.sendMessage(m.key.remoteJid, 
      { text: `❌ Erreur: ${e.message}` }, 
      { quoted: m }
    );
  }
}