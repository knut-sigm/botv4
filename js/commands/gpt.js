import axios from "axios";

export const name = "gpt";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const query = args.join(" ");

    // Vérification si une question est posée
    if (!query) {
      await sock.sendMessage(from, {
        text: `> Knut XMD : *Usage incorrect...*\n\n> Exemple : .gpt combien de continents compte la Terre ?`
      }, { quoted: msg });
      return;
    }

    // Message d'attente
    const sentMsg = await sock.sendMessage(from, {
      text: "> Knut XMD : 🤖 GPT réfléchit à ta question..."
    }, { quoted: msg });

    // Appel API (celle qui fonctionne)
    const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.result) {
      throw new Error("Aucune réponse obtenue.");
    }

    // Réponse stylisée
    const reply = `> Knut XMD - GPT :\n\n📝 *Réponse:* ${data.result}`;

    await sock.sendMessage(from, { text: reply }, { quoted: sentMsg });

  } catch (err) {
    console.error("❌ Erreur commande gpt :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `> Knut XMD: ⚠️ Erreur : ${err.message}`
    }, { quoted: msg });
  }
}