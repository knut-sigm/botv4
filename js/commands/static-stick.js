export const name = "static-stick";
export const description = "Generate text sticker (static)";
export const category = "Sticker";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  if (!args || args.length === 0) {
    return await sock.sendMessage(from, { 
      text: "🖼️ *KNUT XMD TTP*\n\n" +
            "Usage: .ttp <text>\n" +
            "Example: .ttp Hello World\n\n" +
            "Creates a text sticker (static image)"
    }, { quoted: msg });
  }

  const text = encodeURIComponent(args.join(' '));
  
  // Vérification de la longueur
  if (text.length > 50) {
    return await sock.sendMessage(from, { 
      text: "❌ *KNUT XMD*: Text too long\n" +
            "Maximum 50 characters for best results"
    }, { quoted: msg });
  }

  try {
    const sentMsg = await sock.sendMessage(from, { 
      text: "✨ *KNUT XMD* - Creating text sticker..." 
    }, { quoted: msg });

    // APIs disponibles pour TTP (texte vers image)
    const apiUrls = [
      `https://api.erdwpe.com/api/maker/texttopng?text=${text}`,
      `https://api.neoxr.eu/api/ttp?text=${text}`,
      `https://api.lolhuman.xyz/api/ttp?apikey=YOUR_API_KEY&text=${text}`
    ];

    // Utiliser la première API (sans clé)
    const imageUrl = `https://api.erdwpe.com/api/maker/texttopng?text=${text}`;
    
    // Envoyer l'image comme sticker
    await sock.sendMessage(from, {
      sticker: { url: imageUrl },
      mimetype: 'image/png'
    }, { quoted: sentMsg });

  } catch (err) {
    console.error("TTP Error:", err);
    
    // Essayer une API de secours
    try {
      const fallbackUrl = `https://api.neoxr.eu/api/ttp?text=${text}`;
      await sock.sendMessage(from, {
        sticker: { url: fallbackUrl },
        mimetype: 'image/png'
      }, { quoted: msg });
    } catch (fallbackErr) {
      await sock.sendMessage(from, { 
        text: "❌ *KNUT XMD*: Failed to generate text sticker\n" +
              "Try again with shorter text"
      }, { quoted: msg });
    }
  }
}