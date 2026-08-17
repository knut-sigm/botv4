export const name = "animequote";
export const description = "Get a random anime quote";

export async function execute(sock, m, args) {
  try {
    const jid = m.key.remoteJid;

    let url = "https://animechan.vercel.app/api/random";

    // Si utilisateur a entré un anime spécifique
    if (args.length) {
      const anime = args.join(" ");
      url = `https://animechan.vercel.app/api/random/anime?title=${encodeURIComponent(anime)}`;
    }

    let res = await fetch(url);

    // Si 404 (anime pas trouvé), fallback vers citation aléatoire
    if (res.status === 404) {
      res = await fetch("https://animechan.vercel.app/api/random");
    }

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Réponse non JSON reçue (probable HTML de page d'erreur)");
    }

    if (!data || !data.quote) {
      return await sock.sendMessage(
        jid,
        { text: "> Knut XMD ❌ Impossible de récupérer la citation." },
        { quoted: m }
      );
    }

    await sock.sendMessage(
      jid,
      {
        text: `📜 Knut XMD Anime Quote:\n\n"${data.quote}"\n— ${data.character} (${data.anime})`
      },
      { quoted: m }
    );

  } catch (err) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `❌ Knut XMD AnimeQuote Error: ${err.message}` },
      { quoted: m }
    );
  }
}