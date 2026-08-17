import axios from "axios";

export const name = "gemini";

export async function execute(sock, msg, args, from) {
  try {
    const question = args.join(" ").trim();

    // === VÉRIFICATION SI UNE QUESTION EST FOURNIE ===
    if (!question) {
      return await sock.sendMessage(from, {
        text: "> 🤖 *Gemini AI* - Utilisation:\n!gemini <ta question>\n\nExemple: !gemini Quelle est la capitale du Japon ?"
      }, { quoted: msg });
    }

    // === MESSAGE DE CHARGEMENT ===
    const loadingMsg = await sock.sendMessage(from, {
      text: "⏳ Gemini réfléchit à ta question..."
    }, { quoted: msg });

    // === APPEL À L'API GEMINI ===
    const apiUrl = `https://api.giftedtech.co.ke/api/ai/gemini?apikey=gifted&q=${encodeURIComponent(question)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });

    // === VÉRIFICATION DE LA RÉPONSE ===
    if (!response.data || !response.data.success) {
      throw new Error("Réponse invalide de l'API");
    }

    // === EXTRACTION DE LA RÉPONSE ===
    const replyText = response.data.result || response.data.message || "Pas de réponse";

    // === CONSTRUCTION DU MESSAGE FINAL ===
    const finalText = `> *Gemini AI - Knut XMD*\n\n${replyText}`;

    // === ENVOI DE LA RÉPONSE ===
    await sock.sendMessage(from, { text: finalText }, { quoted: msg });

  } catch (error) {
    console.error("❌ Erreur Gemini:", error);
    
    let errorMessage = "> ⚠️ *Erreur Gemini*\n\n";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage += "⏱️ Délai d'attente dépassé (30 secondes).";
    } else if (error.response?.status === 403) {
      errorMessage += "🔒 Accès interdit à l'API. Vérifie la clé `gifted`.";
    } else if (error.response?.status === 404) {
      errorMessage += "❌ API non trouvée.";
    } else {
      errorMessage += `Détails: ${error.message}`;
    }
    
    await sock.sendMessage(from, { text: errorMessage }, { quoted: msg });
  }
}