export const name = "anime-stick";
export const description = "Generate animated text sticker";
export const category = "Sticker";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  if (!args || args.length === 0) {
    return await sock.sendMessage(from, { 
      text: "🎭 *KNUT XMD ATTP*\n\n" +
            "Usage: .attp <text>\n" +
            "Example: .attp Hello World\n\n" +
            "Generates animated sticker from text"
    }, { quoted: msg });
  }

  const text = encodeURIComponent(args.join(' '));
  
  // Vérification de la longueur du texte
  if (text.length > 100) {
    return await sock.sendMessage(from, { 
      text: "❌ *KNUT XMD*: Text too long\n" +
            "Maximum 100 characters"
    }, { quoted: msg });
  }

  try {
    const sentMsg = await sock.sendMessage(from, { 
      text: "⚡ *KNUT XMD* - Creating animated sticker..." 
    }, { quoted: msg });

    // URL de l'API ATTP (plusieurs options disponibles)
    const apiUrls = [
      `https://api.lolhuman.xyz/api/attp?apikey=YOUR_API_KEY&text=${text}`,
      `https://api.neoxr.eu/api/attp?text=${text}`,
      `https://api.erdwpe.com/api/maker/attp?text=${text}`
    ];

    // Utiliser la première API (sans clé API)
    const stickerUrl = `https://api.erdwpe.com/api/maker/attp?text=${text}`;
    
    // Envoyer le sticker
    await sock.sendMessage(from, {
      sticker: { url: stickerUrl },
      mimetype: 'image/webp'
    }, { quoted: sentMsg });

  } catch (err) {
    console.error("ATTP Error:", err);
    
    // Essayer une API de secours
    try {
      const fallbackUrl = `https://api.neoxr.eu/api/attp?text=${text}`;
      await sock.sendMessage(from, {
        sticker: { url: fallbackUrl },
        mimetype: 'image/webp'
      }, { quoted: msg });
    } catch (fallbackErr) {
      await sock.sendMessage(from, { 
        text: "❌ *KNUT XMD*: Failed to generate sticker\n" +
              "API might be temporarily unavailable"
      }, { quoted: msg });
    }
  }
}