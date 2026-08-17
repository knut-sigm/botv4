import axios from "axios"
import ytdl from "ytdl-core"

const ytdlCommand = async (sock, msg, args) => {
  const chatId = msg.key.remoteJid

  try {
    const url = args[0]
    if (!url || !ytdl.validateURL(url)) {
      return await sock.sendMessage(chatId, {
        text: "🎬 URL YouTube invalide !\nExemple : .yt https://youtu.be/dQw4w9WgXcQ",
      }, { quoted: msg })
    }

    const info = await ytdl.getInfo(url)
    const format = ytdl.chooseFormat(info.formats, { quality: "highest" })
    const videoTitle = info.videoDetails.title
    const authorName = info.videoDetails.author.name
    const duration = info.videoDetails.lengthSeconds
    const views = info.videoDetails.viewCount
    const thumb = info.videoDetails.thumbnails[0].url

    await sock.sendMessage(chatId, {
      video: { url: format.url },
      caption:
        `▶️ *${videoTitle}*\n\n` +
        `👤 *Chaîne:* ${authorName}\n` +
        `⏱ *Durée:* ${duration}s\n` +
        `📊 *Vues:* ${views}`,
      contextInfo: {
        externalAdReply: {
          title: videoTitle,
          body: authorName,
          thumbnailUrl: thumb,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: msg })
  } catch (error) {
    console.error("Erreur commande ytdl:", error)
    await sock.sendMessage(chatId, { text: "❌ Erreur lors du téléchargement de la vidéo." }, { quoted: msg })
  }
}

export default {
  name: "yt",
  description: "Télécharge et envoie une vidéo YouTube",
  execute: ytdlCommand,
}