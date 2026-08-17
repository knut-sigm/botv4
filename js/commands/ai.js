export const name = "ai";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const query = args.join(" ").trim();

  try {
    if (!query) {
      return await sock.sendMessage(from, {
        text: "> ⚠️ KNUT XMD : Fournis un message pour l'IA.\nExemple : .ai Bonjour"
      }, { quoted: msg });
    }

    await sock.sendMessage(from, {
      text: "🤖 KNUT XMD : 𝐼'𝑚 𝑐𝑟𝑎𝑧𝑦....𝑚𝑎𝑦𝑏𝑒"
    }, { quoted: msg });

    const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(query)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data || !data.message) {
      return await sock.sendMessage(from, {
        text: "> ⚠️ KNUT XMD : L'IA n'a pas répondu. Réessaie plus tard."
      }, { quoted: msg });
    }

    const replyText = `> Knut XMD: ${data.message}`;

    await sock.sendMessage(from, { text: replyText }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur AI :", err);
    await sock.sendMessage(from, {
      text: `> ⚠️ KNUT XMD : Une erreur est survenue lors de la communication avec l'IA.\nDétails : ${err.message}`
    }, { quoted: msg });
  }
}