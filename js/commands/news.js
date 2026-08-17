import axios from "axios";

export const name = "news";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const apiKey = "dcd720a6f1914e2d9dba9790c188c08c"; // ta clé NewsAPI

    // Récupération des actualités principales
    const { data } = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=fr&apiKey=${apiKey}`
    );

    const articles = data.articles?.slice(0, 5) || [];
    if (articles.length === 0) throw new Error("Aucune actualité disponible.");

    // Message formaté avec cadre
    let message = `> Knut XMD: 
    ╔════ 📰 ACTUALITÉS DU JOUR ════╗\n`;
    articles.forEach((a, i) => {
      message += `> ➤ *${i + 1}. ${a.title || "Sans titre"}*\n`;
      if (a.description) message += `>    ${a.description}\n`;
      if (a.url) message += `>    🔗 ${a.url}\n`;
      message += `>\n`;
    });
    message += `> ╚════════════════════════════╝`;

    // Envoi du message
    await sock.sendMessage(from, { text: message }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur News:", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        text: "> ⚠️ KNUT XMD: Impossible de récupérer les actualités pour le moment.",
      },
      { quoted: msg }
    );
  }
}