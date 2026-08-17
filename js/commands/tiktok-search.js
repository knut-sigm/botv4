import axios from "axios";

export const name = "tiktok-search";

export async function execute(sock, msg, args, from) {
  try {
    // === RÉCUPÉRER LE TERME DE RECHERCHE ===
    const searchQuery = args.join(" ");
    
    if (!searchQuery) {
      await sock.sendMessage(from, { 
        text: "❌ Utilisation: !tiktok-search <terme de recherche>\n\nExemple: !tiktok-search messi" 
      }, { quoted: msg });
      return;
    }

    // === ENVOI D'UN MESSAGE DE CHARGEMENT ===
    const loadingMsg = await sock.sendMessage(from, { 
      text: `⏳ Recherche de vidéos TikTok pour "${searchQuery}"...` 
    }, { quoted: msg });

    // === APPEL À L'API TIKTOK SEARCH ===
    const apiUrl = `https://api.giftedtech.co.ke/api/search/tiktoksearch?apikey=gifted&query=${encodeURIComponent(searchQuery)}`;
    const response = await axios.get(apiUrl, { timeout: 15000 });

    // === VÉRIFICATION DE LA RÉPONSE ===
    if (!response.data || !response.data.status === 200) {
      throw new Error("Réponse invalide de l'API");
    }

    // === TRAITEMENT DES RÉSULTATS ===
    const results = response.data.result || [];
    
    if (!results || results.length === 0) {
      await sock.sendMessage(from, { 
        text: `❌ Aucun résultat trouvé pour "${searchQuery}".` 
      }, { quoted: msg });
      return;
    }

    // === CONSTRUCTION DU MESSAGE ===
    let messageText = `🎵 *TIKTOK SEARCH* 🎵\n\n`;
    messageText += `🔍 Recherche: *${searchQuery}*\n`;
    messageText += `📊 Résultats: ${results.length} vidéos\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Afficher les premiers résultats (limite à 10 pour éviter un message trop long)
    const maxResults = Math.min(results.length, 10);
    
    for (let i = 0; i < maxResults; i++) {
      const video = results[i];
      
      messageText += `*${i + 1}. ${video.title || 'Sans titre'}*\n`;
      
      if (video.author) {
        messageText += `👤 Par: ${video.author.nickname || video.author.unique_id || 'Inconnu'}\n`;
      }
      
      if (video.stats) {
        const stats = [];
        if (video.stats.playCount) stats.push(`▶️ ${formatNumber(video.stats.playCount)}`);
        if (video.stats.likeCount) stats.push(`❤️ ${formatNumber(video.stats.likeCount)}`);
        if (video.stats.commentCount) stats.push(`💬 ${formatNumber(video.stats.commentCount)}`);
        if (video.stats.shareCount) stats.push(`🔄 ${formatNumber(video.stats.shareCount)}`);
        
        if (stats.length > 0) {
          messageText += `📊 ${stats.join(' • ')}\n`;
        }
      }
      
      if (video.duration) {
        const duration = formatDuration(video.duration);
        messageText += `⏱️ Durée: ${duration}\n`;
      }
      
      if (video.url || video.videoUrl) {
        messageText += `🔗 Lien: ${video.url || video.videoUrl}\n`;
      }
      
      messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    }

    if (results.length > maxResults) {
      messageText += `\n📌 ... et ${results.length - maxResults} autres résultats (limite affichée: 10)\n`;
    }

    messageText += `\n> Knut XMD : Recherche TikTok`;

    // === ENVOYER LE RÉSULTAT ===
    await sock.sendMessage(from, { 
      text: messageText 
    }, { quoted: msg });

  } catch (error) {
    console.error("Erreur commande tiktok-search:", error);
    
    let errorMessage = "❌ Erreur lors de la recherche TikTok.\n";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage += "⏱️ Délai d'attente dépassé.\n";
    } else if (error.response?.status === 403) {
      errorMessage += "🔒 Accès interdit à l'API. Vérifie la clé API.\n";
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

// === FONCTIONS UTILITAIRES ===
function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

function formatDuration(seconds) {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}