import axios from "axios";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export const name = "down-url";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifier que l'utilisateur a bien entré une URL
  const url = args[0];
  if (!url) {
    return await sock.sendMessage(from, {
      text: "> Knut XMD: ⚠️ *Utilisation:* `!down-url <lien>`\n\nExemple:\n> !down-url https://example.com/video.mp4"
    }, { quoted: msg });
  }

  try {
    await sock.sendMessage(from, {
      text: "> Knut XMD:⏳ 𝐼'𝑚 𝑐𝑟𝑎𝑧𝑦....𝑚𝑎𝑦𝑏𝑒"
    }, { quoted: msg });

    // Téléchargement du contenu avec axios
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    // Déterminer le type MIME
    const contentType = response.headers["content-type"] || mime.lookup(url) || "application/octet-stream";
    const extension = mime.extension(contentType) || "bin";

    // Nom temporaire
    const fileName = `download_${Date.now()}.${extension}`;
    const filePath = path.join("./bots/knutxmd/temp/", fileName);

    // Sauvegarde temporaire
    fs.writeFileSync(filePath, buffer);

    // Déterminer le type de média à envoyer
    let messageOptions = {};
    if (contentType.startsWith("image/")) {
      messageOptions = { image: fs.readFileSync(filePath), caption: `📸 *Fichier image téléchargé depuis :*\n${url}` };
    } else if (contentType.startsWith("video/")) {
      messageOptions = { video: fs.readFileSync(filePath), caption: `🎥 *Vidéo téléchargée depuis :*\n${url}` };
    } else if (contentType.startsWith("audio/")) {
      messageOptions = { audio: fs.readFileSync(filePath), mimetype: contentType, ptt: false };
    } else {
      messageOptions = { document: fs.readFileSync(filePath), mimetype: contentType, fileName };
    }

    // Envoi du média
    await sock.sendMessage(from, messageOptions, { quoted: msg });

    // Supprimer le fichier temporaire après envoi
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("❌ Erreur down-url :", err);
    await sock.sendMessage(from, {
      text: "> Knut XMD:❌ *Erreur lors du téléchargement.*\nVérifie que le lien est valide et accessible publiquement."
    }, { quoted: msg });
  }
}
