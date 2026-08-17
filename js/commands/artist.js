export const name = "artist";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    if (!args.length) {
      await sock.sendMessage(from, { 
        text: "> 🎤 Knut XMD : Usage: !artist <nom>\nEx: !artist Ed Sheeran" 
      }, { quoted: msg });
      return;
    }
    
    const artist = args.join(" ");
    
    // API Last.fm (gratuit)
    const API_KEY = "TON_API_KEY"; // last.fm/api
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.artist) {
      await sock.sendMessage(from, { text: "> ❌ Knut XMD : Artiste non trouvé." }, { quoted: msg });
      return;
    }
    
    const artistData = data.artist;
    
    const reply = `> 🎤 Knut XMD : ${artistData.name}
━━━━━━━━━━━━━━━━━━
👥 Listeners: ${parseInt(artistData.stats.listeners).toLocaleString()}
🎵 Plays: ${parseInt(artistData.stats.playcount).toLocaleString()}
🏷️ Tags: ${artistData.tags.tag?.slice(0, 3).map(t => t.name).join(", ") || "N/A"}
📝 Bio: ${artistData.bio.summary?.substring(0, 200) || "N/A"}...
🔗 ${artistData.url}`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur artist :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service artistes indisponible." }, { quoted: msg });
  }
}