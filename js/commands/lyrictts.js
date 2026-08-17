import fetch from "node-fetch";

export const name = "lyrictts";
export const description = "Convert song lyrics to voice (TTS)";

export async function execute(sock, m, args) {
  try {
    const jid = m.key.remoteJid;

    if (!args.length || !args.join(" ").includes("|")) {
      return sock.sendMessage(
        jid,
        { text: "> Knut XMD ⚠️ Usage: .lyrictts artist | song" },
        { quoted: m }
      );
    }

    const [artist, title] = args.join(" ").split("|").map(v => v.trim());

    // ===== LYRICS API =====
    const lyricsURL = `https://lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const lyricsRes = await fetch(lyricsURL);
    const lyricsData = await lyricsRes.json();

    if (!lyricsData.lyrics) {
      return sock.sendMessage(
        jid,
        { text: "> Knut XMD ❌ Lyrics not found." },
        { quoted: m }
      );
    }

    // Limite TTS (sécurité)
    const text = lyricsData.lyrics
      .replace(/\n+/g, ". ")
      .slice(0, 1800);

    // ===== GOOGLE TTS =====
    const ttsURL =
      "https://translate.google.com/translate_tts" +
      `?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`;

    const audioRes = await fetch(ttsURL);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    // ===== SEND VOICE =====
    await sock.sendMessage(
      jid,
      {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        ptt: true
      },
      { quoted: m }
    );

  } catch (err) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `❌ Knut XMD TTS Error: ${err.message}` },
      { quoted: m }
    );
  }
}