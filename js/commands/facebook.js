import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const name = "facebook";
export const alias = ["fb"];

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const url = args.join(" ").trim();

    if (!url) {
      return sock.sendMessage(
        from,
        {
          text: "> 📥 KNUT XMD: Donne un lien Facebook valide.\nExemple : .fb https://facebook.com/..."
        },
        { quoted: msg }
      );
    }

    const validDomains = ["facebook.com", "fb.watch", "m.facebook.com"];
    const isValid = validDomains.some(d => url.includes(d));

    if (!isValid) {
      return sock.sendMessage(
        from,
        { text: "> ❌ KNUT XMD: Lien Facebook invalide." },
        { quoted: msg }
      );
    }

    await sock.sendMessage(
      from,
      { text: "> ⏳ KNUT XMD télécharge la vidéo..." },
      { quoted: msg }
    );

    // 🔄 Résolution redirection
    let finalUrl = url;
    try {
      const redirect = await axios.get(url, {
        maxRedirects: 5,
        timeout: 15000
      });
      finalUrl = redirect?.request?.res?.responseUrl || url;
    } catch {
      finalUrl = url;
    }

    // 🌐 API
    const api = `https://api.princetechn.com/api/download/facebook?apikey=prince&url=${encodeURIComponent(finalUrl)}`;
    const res = await axios.get(api, { timeout: 30000 });

    if (!res.data?.success || !res.data?.result) {
      return sock.sendMessage(
        from,
        { text: "> ❌ KNUT XMD: Impossible d'analyser la vidéo." },
        { quoted: msg }
      );
    }

    const data = res.data.result;
    const videoUrl = data.hd_video || data.sd_video;

    if (!videoUrl) {
      return sock.sendMessage(
        from,
        { text: "> ❌ KNUT XMD: Aucun flux vidéo disponible." },
        { quoted: msg }
      );
    }

    // 📁 Temp folder
    const tempDir = "./bots/knutxmd/temp";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `fb_${Date.now()}.mp4`);

    // 📥 Download stream
    const videoRes = await axios.get(videoUrl, {
      responseType: "stream",
      timeout: 60000
    });

    const writer = fs.createWriteStream(filePath);
    videoRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const sizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

    // 📤 Envoi vidéo
    await sock.sendMessage(
      from,
      {
        video: { url: filePath },
        mimetype: "video/mp4",
        caption: `> ✅ KNUT XMD\n> 📹 Qualité: ${videoUrl === data.hd_video ? "HD" : "SD"}\n> 📦 Taille: ${sizeMB} MB`
      },
      { quoted: msg }
    );

    // 🗑️ Nettoyage
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error("FACEBOOK ERROR:", error);

    await sock.sendMessage(
      from,
      { text: "> ⚠️ KNUT XMD: Erreur pendant le téléchargement." },
      { quoted: msg }
    );
  }
}