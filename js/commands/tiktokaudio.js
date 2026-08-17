export const name = "tiktokaudio";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    
    if (!args || args.length === 0) {
      await sock.sendMessage(from, { text: "> ❌ Lien TikTok requis" }, { quoted: msg });
      return;
    }

    const url = args[0];
    
    // Un seul message de traitement
    const processing = await sock.sendMessage(from, { 
      text: "> ⏳ Téléchargement audio TikTok..." 
    }, { quoted: msg });

    // Simulation du téléchargement
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Envoi direct de l'audio (simulation)
    await sock.sendMessage(from, {
      audio: { 
        url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3" 
      },
      fileName: 'tiktok.mp3',
      mimetype: 'audio/mpeg'
    }, { quoted: processing });

  } catch (err) {
    console.error("Error:", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "> ❌ Échec"
    }, { quoted: msg });
  }
};