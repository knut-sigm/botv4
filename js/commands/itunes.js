export const name = "itunes";
export const description = "Search music on iTunes";

export async function execute(sock, m, args) {
  try {
    const jid = m.key.remoteJid;

    if (!args.length) {
      return sock.sendMessage(
        jid,
        { text: "> Knut XMD ⚠️ Usage: .itunes artist name" },
        { quoted: m }
      );
    }

    const query = args.join(" ");
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return sock.sendMessage(
        jid,
        { text: "> Knut XMD ❌ No results found." },
        { quoted: m }
      );
    }

    let msg = `🎧 *iTunes Search Results*\n\n`;

    data.results.forEach((song, i) => {
      msg +=
`${i + 1}. 🎵 ${song.trackName}
👤 ${song.artistName}
💽 ${song.collectionName}
⏱️ ${(song.trackTimeMillis / 60000).toFixed(2)} min
🔗 ${song.trackViewUrl}

`;
    });

    await sock.sendMessage(
      jid,
      { text: msg.trim() },
      { quoted: m }
    );

  } catch (e) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `❌ Knut XMD iTunes Error: ${e.message}` },
      { quoted: m }
    );
  }
}