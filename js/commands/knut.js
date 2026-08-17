export const name = "knut";
export const aliases = ["gpt", "ai", "bot"];
export const category = "ai";
export const description = "Discute avec l'IA Knut";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const text = args.join(' ');

    // Vérification si une question est fournie
    if (!text) {
      await sock.sendMessage(
        from,
        { text: "> Knut XMD: ❓ Veuillez poser une question.\n> Exemple: .knut Comment vas-tu?" },
        { quoted: msg }
      );
      return;
    }

    // Réaction pendant le chargement
    await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

    // Appel à l'API Hercai
    const response = await fetch(
      `https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(text)}`
    );
    const data = await response.json();

    // Vérification de la réponse
    if (!data.reply) {
      throw new Error("Pas de réponse de l'API");
    }

    // Réponse avec le nom Knut
    const reply = `> Knut XMD: 🤖 ${data.reply}`;

    await sock.sendMessage(from, { text: reply }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur knut :", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "> ⚠️ Knut XMD: Impossible de contacter l'IA." },
      { quoted: msg }
    );
  }
}