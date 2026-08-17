import axios from "axios";

export const name = "deepseek";

export async function execute(sock, msg, args, from) {
  try {
    const question = args.join(" ").trim();

    // === VÉRIFICATION SI UNE QUESTION EST FOURNIE ===
    if (!question) {
      return await sock.sendMessage(from, {
        text: "> 🤖 *DeepSeek AI* - Utilisation:\n!deepseek <ta question>\n\nExemple: !deepseek Explique l'intelligence artificielle"
      }, { quoted: msg });
    }

    // === MESSAGE DE CHARGEMENT ===
    const loadingMsg = await sock.sendMessage(from, {
      text: "⏳ DeepSeek réfléchit à ta question..."
    }, { quoted: msg });

    // === APPEL À L'API DEEPSEEK (OVERCHAT) ===
    const apiUrl = `https://api.giftedtech.co.ke/api/ai/overchat?apikey=gifted&q=${encodeURIComponent(question)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });

    // === VÉRIFICATION DE LA RÉPONSE ===
    if (!response.data) {
      throw new Error("Réponse invalide de l'API");
    }

    // === EXTRACTION DE LA RÉPONSE (À ADAPTER SELON LE FORMAT RÉEL) ===
    let replyText = "";
    
    // Essayer différents formats possibles
    if (response.data.success && response.data.result) {
      replyText = response.data.result;
    } else if (response.data.response) {
      replyText = response.data.response;
    } else if (response.data.message) {
      replyText = response.data.message;
    } else if (response.data.answer) {
      replyText = response.data.answer;
    } else if (response.data.data) {
      replyText = response.data.data;
    } else if (typeof response.data === 'string') {
      replyText = response.data;
    } else {
      // Si aucun format connu, on affiche tout
      replyText = JSON.stringify(response.data, null, 2);
    }

    if (!replyText || replyText.trim() === "") {
      throw new Error("Réponse vide de l'API");
    }

    // === CONSTRUCTION DU MESSAGE FINAL ===
    const finalText = `> *DeepSeek AI - Knut XMD*\n\n${replyText}`;

    // === ENVOI DE LA RÉPONSE ===
    await sock.sendMessage(from, { text: finalText }, { quoted: msg });

  } catch (error) {
    console.error("❌ Erreur DeepSeek:", error);
    
    let errorMessage = "> ⚠️ *Erreur DeepSeek*\n\n";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage += "⏱️ Délai d'attente dépassé (30 secondes).";
    } else if (error.response?.status === 403) {
      errorMessage += "🔒 Accès interdit à l'API DeepSeek.\n";
      errorMessage += "Causes possibles:\n";
      errorMessage += "• Clé API `gifted` invalide\n";
      errorMessage += "• API restreinte\n\n";
      errorMessage += "Solutions:\n";
      errorMessage += "• Vérifie la clé API\n";
      errorMessage += "• Teste l'URL dans ton navigateur";
    } else if (error.response?.status === 404) {
      errorMessage += "❌ API DeepSeek non trouvée.";
    } else if (error.response?.status === 429) {
      errorMessage += "⏳ Trop de requêtes. Réessaie dans quelques instants.";
    } else if (error.response?.status === 500) {
      errorMessage += "🔧 Erreur serveur interne.";
    } else {
      errorMessage += `Détails: ${error.message}`;
    }
    
    await sock.sendMessage(from, { text: errorMessage }, { quoted: msg });
  }
}