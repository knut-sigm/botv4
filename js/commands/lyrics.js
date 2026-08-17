import fetch from "node-fetch";

export const name = "lyrics";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const songTitle = args.join(" ").trim();

    if (!songTitle) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD:🔍 Veuillez entrer le nom de la chanson pour obtenir les paroles !\n\nExemple : . lyrics Shape of You" 
      }, { quoted: msg });
      return;
    }

    const sentMsg = await sock.sendMessage(from, { text:"> Knut XMD: 🎵 Recherche des paroles..." }, { quoted: msg });

    const apiUrl = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(songTitle)}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const data = await res.json();
    const lyrics = data?.result?.lyrics;

    if (!lyrics) {
      await sock.sendMessage(from, {
        text: `> Knut MD:❌ aucune parole trouvée pour : "${songTitle}"`
      }, { quoted: msg });
      return;
    }

    // Limite à 4096 caractères
    const maxChars = 4096;
    const output = lyrics.length > maxChars ? lyrics.slice(0, maxChars - 3) + "..." : lyrics;

    await sock.sendMessage(from, {
      text: `
> ╔───── LYRICS ─────╗
> Knut XMD: Titre trouvé 
🎶 Chanson : ${songTitle}
> ───────────────────
${output}
> ╚─────────────────╝`
    }, { quoted: sentMsg });

  } catch (error) {
    console.error("❌ Erreur dans la commande lyrics :", error);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `> Knut XMD:❌ Une erreur est survenue lors de la récupération des paroles pour "${args.join(" ")}".`
    }, { quoted: msg });
  }
}