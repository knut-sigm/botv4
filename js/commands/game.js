export const name = "game";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    if (!args.length) {
      await sock.sendMessage(from, { 
        text: "> 🎮 Knut XMD : Usage: !game <nom>\nEx: !game Minecraft" 
      }, { quoted: msg });
      return;
    }
    
    const search = args.join(" ");
    
    // API RAWG (gratuit 20k req/mois)
    const API_KEY = "TON_API_KEY"; // rawg.io/apidocs
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(search)}&page_size=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      await sock.sendMessage(from, { text: "> ❌ Knut XMD : Jeu non trouvé." }, { quoted: msg });
      return;
    }
    
    const game = data.results[0];
    
    const reply = `> 🎮 Knut XMD : ${game.name}
━━━━━━━━━━━━━━━━━━
📅 Sortie: ${game.released || "N/A"}
⭐ Note: ${game.rating}/5
🎮 Plateformes: ${game.platforms?.map(p => p.platform.name).slice(0, 3).join(", ") || "N/A"}
🏷️ Genres: ${game.genres?.map(g => g.name).slice(0, 3).join(", ") || "N/A"}
🔗 ${game.website || "Pas de site"}`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur game :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service jeux indisponible." }, { quoted: msg });
  }
}