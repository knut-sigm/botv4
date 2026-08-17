import { igdl } from "ruhend-scraper";

// Stockage des messages déjà traités pour éviter les doublons
const processedMessages = new Set();

export const name = "instagram";
export const description = "Télécharge des posts, reels ou vidéos Instagram";
export const category = "📥 Téléchargement";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    // Éviter de traiter le même message plusieurs fois
    if (processedMessages.has(msg.key.id)) return;
    processedMessages.add(msg.key.id);
    setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000); // 5 min

    const text = args.join(" ").trim() || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || "";

    if (!text) {
      await sock.sendMessage(from, { 
        text: `> Knut XMD : ⚠️ Veuillez fournir un lien Instagram
> Exemple : .instagram https://www.instagram.com/p/XXXX`
      }, { quoted: msg });
      return;
    }

    const instaPatterns = [
      /https?:\/\/(?:www\.)?instagram\.com\//,
      /https?:\/\/(?:www\.)?instagr\.am\//
    ];

    if (!instaPatterns.some(p => p.test(text))) {
      await sock.sendMessage(from, { text: "> Knut XMD: ❌ Lien Instagram invalide." }, { quoted: msg });
      return;
    }

    await sock.sendMessage(from, { react: { text: "🔄", key: msg.key } });

    const downloadData = await igdl(text);
    if (!downloadData?.data?.length) {
      await sock.sendMessage(from, { text: "> Knut XMD:❌ Aucun média trouvé ou le post est privé." }, { quoted: msg });
      return;
    }

    // Déduplication simple des URLs
    const uniqueMedia = [];
    const seenUrls = new Set();
    for (const media of downloadData.data) {
      if (media.url && !seenUrls.has(media.url)) {
        seenUrls.add(media.url);
        uniqueMedia.push(media);
      }
    }

    const mediaToDownload = uniqueMedia.slice(0, 20);
    if (!mediaToDownload.length) {
      await sock.sendMessage(from, { text: "> Knut XMD:❌ Aucun média valide trouvé à télécharger." }, { quoted: msg });
      return;
    }

    // Téléchargement et envoi
    for (let i = 0; i < mediaToDownload.length; i++) {
      const media = mediaToDownload[i];
      const url = media.url;
      const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(url) || media.type === "video";

      try {
        if (isVideo) {
          await sock.sendMessage(from, {
            video: { url },
            mimetype: "video/mp4",
            caption: "> Knut XMD: ✅ Téléchargement réussi."
          }, { quoted: msg });
        } else {
          await sock.sendMessage(from, {
            image: { url },
            caption: "> Knut XMD: ✅ Téléchargement réussi."
          }, { quoted: msg });
        }

        if (i < mediaToDownload.length - 1) await new Promise(r => setTimeout(r, 1000));

      } catch (mediaError) {
        console.error(`Erreur téléchargement média ${i + 1}:`, mediaError);
      }
    }

  } catch (error) {
    console.error("❌ Erreur Instagram:", error);
    await sock.sendMessage(from, { 
      text: "> Knut XMD: ⚠️ Erreur\n> Impossible de traiter le lien Instagram. Réessayez plus tard."
    }, { quoted: msg });
  }
}