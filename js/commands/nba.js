import axios from "axios";

export const name = "nba";

export async function execute(sock, msg, args, from) {
  try {
    // === ENVOI D'UN MESSAGE DE CHARGEMENT ===
    const loadingMsg = await sock.sendMessage(from, { 
      text: "⏳ Chargement des scores NBA..." 
    }, { quoted: msg });

    // === APPEL À L'API GIFTEDTECH ===
    const apiUrl = "https://api.giftedtech.co.ke/api/football/basketball-live?apikey=gifted";
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    // === VÉRIFICATION DE LA RÉPONSE ===
    if (!data.success || !data.result || !data.result.matches || data.result.matches.length === 0) {
      await sock.sendMessage(from, { 
        text: "❌ Aucun score NBA disponible pour le moment." 
      }, { quoted: msg });
      return;
    }

    const matches = data.result.matches;
    const totalMatches = data.result.totalMatches || matches.length;

    // === ENTÊTE ===
    let messageText = `🏀 *NBA - SCORES EN DIRECT* 🏀\n\n`;
    messageText += `📅 ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    messageText += `📊 Total: ${totalMatches} matchs\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // === STATISTIQUES RAPIDES ===
    const liveMatches = matches.filter(m => m.status === "Live" || m.status === "In Progress").length;
    const finishedMatches = matches.filter(m => m.status === "Full Time" || m.status === "Finished").length;
    const upcomingMatches = totalMatches - liveMatches - finishedMatches;
    
    messageText += `🔴 En direct: ${liveMatches} | ✅ Terminés: ${finishedMatches} | ⏱️ À venir: ${upcomingMatches}\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // === AFFICHER TOUS LES MATCHS SANS LIMITE ===
    matches.forEach((match, index) => {
      // Déterminer l'emoji du statut
      let statusEmoji = "⏱️";
      if (match.status === "Full Time" || match.status === "Finished") statusEmoji = "✅";
      else if (match.status === "Live" || match.status === "In Progress") statusEmoji = "🔴";
      
      // Formater la date/heure
      const matchDate = new Date(match.startTime);
      const heureFR = matchDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Construire le bloc du match
      messageText += `*${index + 1}. ${match.homeTeam} vs ${match.awayTeam}*\n`;
      messageText += `🏀 NBA\n`;
      
      // Afficher le score
      if (match.homeScore !== "0" || match.awayScore !== "0" || match.status === "Full Time") {
        messageText += `📌 Score: ${match.homeScore} - ${match.awayScore}\n`;
      } else {
        messageText += `📌 Heure: ${heureFR}\n`;
      }
      
      // Afficher le statut
      messageText += `${statusEmoji} ${match.status === "Full Time" ? "Terminé" : match.status || 'À venir'}\n`;
      messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    // === PIED DE PAGE ===
    messageText += `\n📊 *RÉSUMÉ NBA*\n`;
    messageText += `🔴 ${liveMatches} en direct | ✅ ${finishedMatches} terminés | ⏱️ ${upcomingMatches} à venir\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `> Knut XMD : Scores NBA complets (${totalMatches} matchs)`;

    // === ENVOYER LE RÉSULTAT ===
    await sock.sendMessage(from, { 
      text: messageText 
    }, { quoted: msg });

  } catch (error) {
    console.error("Erreur commande nba:", error);
    
    let errorMessage = "❌ Erreur lors de la récupération des scores NBA.\n";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage += "⏱️ Délai d'attente dépassé.\n";
    } else if (error.response) {
      errorMessage += `Code: ${error.response.status}\n`;
    } else if (error.request) {
      errorMessage += "Le serveur ne répond pas.\n";
    } else {
      errorMessage += `${error.message}\n`;
    }
    
    errorMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    errorMessage += `> Knut XMD : Réessaie plus tard`;
    
    await sock.sendMessage(from, { 
      text: errorMessage 
    }, { quoted: msg });
  }
}