import axios from "axios";

export const name = "xbet";

export async function execute(sock, msg, args, from) {
  try {
    // === ENVOI D'UN MESSAGE DE CHARGEMENT ===
    const loadingMsg = await sock.sendMessage(from, { 
      text: "⏳ Chargement des prédictions football..." 
    }, { quoted: msg });

    // === APPEL À L'API GIFTEDTECH ===
    const apiUrl = "https://api.giftedtech.co.ke/api/football/predictions?apikey=gifted";
    const { data } = await axios.get(apiUrl);

    // === VÉRIFICATION DE LA RÉPONSE ===
    if (!data.success || !data.result || data.result.length === 0) {
      await sock.sendMessage(from, { 
        text: "❌ Aucune prédiction disponible pour le moment." 
      }, { quoted: msg });
      return;
    }

    // === CONSTRUCTION DU MESSAGE DE PRÉDICTIONS ===
    let messageText = `⚽ *PRÉDICTIONS FOOTBALL* ⚽\n\n`;
    messageText += `📅 Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
    messageText += `🔮 ${data.result.length} matchs disponibles\n`;
    messageText += `━━━━━━━━━━━━━━━━━━\n\n`;

    // Parcourir les 5 premiers matchs maximum
    const matchesToShow = data.result.slice(0, 5);
    
    matchesToShow.forEach((match, index) => {
      const ft = match.predictions.fulltime;
      const btts = match.predictions.bothTeamToScore;
      const over25 = match.predictions.over_2_5;
      
      // Déterminer le favori
      let favorite = "Équilibré";
      if (ft.home > ft.away && ft.home > ft.draw) favorite = "Domicile";
      else if (ft.away > ft.home && ft.away > ft.draw) favorite = "Extérieur";
      
      messageText += `*${index + 1}. ${match.match}*\n`;
      messageText += `🏆 ${match.league}\n`;
      messageText += `⏰ ${match.time}\n\n`;
      messageText += `📊 *Pronostics:*\n`;
      messageText += `🏠 Domicile: ${ft.home}%\n`;
      messageText += `🤝 Nul: ${ft.draw}%\n`;
      messageText += `✈️ Extérieur: ${ft.away}%\n`;
      messageText += `🎯 Favori: ${favorite}\n\n`;
      messageText += `⚽ *Stats supplémentaires:*\n`;
      messageText += `• Les deux équipes marquent: ${btts.yes}%\n`;
      messageText += `• Plus de 2.5 buts: ${over25.yes}%\n`;
      messageText += `━━━━━━━━━━━━━━━━━━\n\n`;
    });

    messageText += `> Knut XMD : Prédictions`;

    // === SUPPRIMER LE MESSAGE DE CHARGEMENT ET ENVOYER LE RÉSULTAT ===
    await sock.sendMessage(from, { 
      text: messageText 
    }, { quoted: msg });

  } catch (error) {
    console.error("Erreur commande xbet:", error);
    
    let errorMessage = "❌ Erreur lors de la récupération des prédictions.";
    
    if (error.response) {
      errorMessage += `\nCode: ${error.response.status}`;
    } else if (error.request) {
      errorMessage += "\nLe serveur ne répond pas.";
    } else {
      errorMessage += `\n${error.message}`;
    }
    
    await sock.sendMessage(from, { 
      text: errorMessage 
    }, { quoted: msg });
  }
}