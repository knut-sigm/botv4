export const name = "film";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    if (!args.length) {
      await sock.sendMessage(from, { 
        text: "> 🎬 Knut XMD : Usage: !film <titre> [année]\nEx: !film Inception 2010" 
      }, { quoted: msg });
      return;
    }
    
    const search = args.join(" ");
    
    // API OMDb (gratuit 1000 req/jour)
    const API_KEY = "TON_API_KEY"; // omdbapi.com
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(search)}&apikey=${API_KEY}&plot=short`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.Response === "False") {
      await sock.sendMessage(from, { text: "> ❌ Knut XMD : Film non trouvé." }, { quoted: msg });
      return;
    }
    
    const reply = `> 🎬 Knut XMD : ${data.Title}
━━━━━━━━━━━━━━━━━━
📅 Année: ${data.Year}
🎭 Genre: ${data.Genre}
⏱ Durée: ${data.Runtime}
🎬 Réalisateur: ${data.Director}
👥 Acteurs: ${data.Actors.split(',').slice(0,3).join(',')}
📊 Note: ${data.imdbRating}/10 (${data.imdbVotes} votes)
🎖️ Awards: ${data.Awards}
📝 Synopsis: ${data.Plot.substring(0, 200)}...
🔗 IMDB: https://www.imdb.com/title/${data.imdbID}`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur film :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service films indisponible." }, { quoted: msg });
  }
}