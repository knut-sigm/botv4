import axios from "axios";
import fs from "fs";
import gTTS from "node-gtts";
import path from "path";

export const name = "knutts";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const query = args.join(" ");

    // Vérification si une question est posée
    if (!query) {
      await sock.sendMessage(from, {
        text: "> Knut XMD : *Usage incorrect...*\n> Exemple : .knut combien de continents compte la Terre ?"
      }, { quoted: msg });
      return;
    }

    // Message d’attente
    const sentMsg = await sock.sendMessage(from, {
      text: "> Knut XMD : Préparation de la réponse vocale..."
    }, { quoted: msg });

    // Appel API
    const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.result) {
      throw new Error("Aucune réponse obtenue.");
    }

    // ======= TTS (voix française féminine) =======
    const tts = gTTS("fr"); 
    const tempDir = "./bots/knutxmd/temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const audioPath = path.join(tempDir, `knut_voice_${Date.now()}.mp3`);

    tts.save(audioPath, data.result, async () => {
      try {
        await sock.sendMessage(from, {
          audio: fs.readFileSync(audioPath),
          mimetype: "audio/mpeg",
          ptt: false
        }, { quoted: sentMsg });
      } finally {
        fs.existsSync(audioPath) && fs.unlinkSync(audioPath);
      }
    });

  } catch (err) {
    console.error("❌ Erreur commande knut :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `> Knut XMD: ⚠️ Erreur : ${err.message}`
    }, { quoted: msg });
  }
}