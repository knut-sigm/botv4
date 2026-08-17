import axios from "axios";
import fs from "fs";
import path from "path";

export const name = "livescore";

export async function execute(sock, msg, args, from) {
  try {

    let thumbBuffer;
    try {
      thumbBuffer = fs.readFileSync(path.resolve("./knut.jpg"));
    } catch (err) {
      console.error("❌ knut.jpg not found:", err.message);
      thumbBuffer = null;
    }

    const contextInfo = {
      externalAdReply: {
        title: "⚫ KNUT-XMD-V4",
        body: "Rejoignez nous ici !!!",
        mediaType: 1,
        thumbnail: thumbBuffer,
        renderLargerThumbnail: false,
        mediaUrl: "./knut.jpg",
        sourceUrl: "./knut.jpg",
        thumbnailUrl: "https://whatsapp.com/channel/0029Vb75xwOADTOBVjSgJV0k"
      }
    };

    // === ENVOI D'UN MESSAGE DE CHARGEMENT ===
    const loadingMsg = await sock.sendMessage(from, { 
      text: "⏳ Chargement de tous les scores..." 
    }, { quoted: msg });

    // === APPEL À L'API GIFTEDTECH ===
    const apiUrl = "https://api.giftedtech.co.ke/api/football/livescore?apikey=gifted";
    const { data } = await axios.get(apiUrl, { timeout: 20000 });

    // === VÉRIFICATION DE LA RÉPONSE ===
    if (!data.success || !data.result || !data.result.matches || data.result.matches.length === 0) {
      await sock.sendMessage(from, { 
        text: "❌ Aucun score disponible pour le moment.",
        contextInfo
      }, { quoted: msg });
      return;
    }

    const matches = data.result.matches;
    const totalMatches = data.result.totalMatches || matches.length;

    // === ENTÊTE ===
    let messageText = `⚽ *LIVESCORE - TOUS LES MATCHS* ⚽\n\n`;
    messageText += `📅 ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    messageText += `📊 Total: ${totalMatches} matchs\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // === STATISTIQUES RAPIDES ===
    const liveMatches = matches.filter(m => m.status === "Live" || (parseInt(m.minute) > 0 && parseInt(m.minute) < 120)).length;
    const finishedMatches = matches.filter(m => m.status === "Full Time").length;
    const upcomingMatches = totalMatches - liveMatches - finishedMatches;
    
    messageText += `🔴 En direct: ${liveMatches} | ✅ Terminés: ${finishedMatches} | ⏱️ À venir: ${upcomingMatches}\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // === AFFICHER TOUS LES MATCHS SANS LIMITE ===
    matches.forEach((match, index) => {
      let statusEmoji = "⏱️";
      if (match.status === "Full Time") statusEmoji = "✅";
      else if (match.status === "Live" || (parseInt(match.minute) > 0 && parseInt(match.minute) < 120)) statusEmoji = "🔴";
      
      const minute = match.minute && match.minute !== "0" ? `${match.minute}'` : "";
      
      messageText += `*${index + 1}. ${match.homeTeam} vs ${match.awayTeam}*\n`;
      messageText += `🏆 ${match.league}\n`;
      
      if (match.homeScore !== "0" || match.awayScore !== "0" || match.status === "Full Time" || statusEmoji === "🔴") {
        messageText += `📌 Score: ${match.homeScore} - ${match.awayScore}`;
        if (match.halfTimeScore && match.halfTimeScore !== "0 - 0" && match.halfTimeScore !== "0-0") {
          messageText += ` (MT: ${match.halfTimeScore})`;
        }
        messageText += `\n`;
      } else {
        messageText += `📌 Heure: ${match.time || '--:--'}\n`;
      }
      
      messageText += `${statusEmoji} ${minute || match.status || 'À venir'}\n`;
      messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    // === PIED DE PAGE ===
    messageText += `\n📊 *RÉSUMÉ*\n`;
    messageText += `🔴 ${liveMatches} en direct | ✅ ${finishedMatches} terminés | ⏱️ ${upcomingMatches} à venir\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `> Knut XMD : Livescore complet (${totalMatches} matchs)`;

    // === ENVOYER LE RÉSULTAT ===
    await sock.sendMessage(from, { 
      text: messageText,
      contextInfo
    }, { quoted: msg });

  } catch (error) {
    console.error("Erreur commande livescore:", error);
    
    let errorMessage = "❌ Erreur lors de la récupération des scores.\n";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage += "⏱️ Délai d'attente dépassé (20 secondes).\n";
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
      text: errorMessage,
      contextInfo
    }, { quoted: msg });
  }
}