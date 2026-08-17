import axios from "axios";

export const name = "infosport";

export async function execute(sock, msg, args, from) {
  try {
    // === ENVOI D'UN MESSAGE DE CHARGEMENT ===
    const loadingMsg = await sock.sendMessage(from, { 
      text: "⏳ Chargement des actualités sportives..." 
    }, { quoted: msg });

    // === APPEL À L'API GIFTEDTECH ===
    const apiUrl = "https://api.giftedtech.co.ke/api/football/news?apikey=gifted";
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    // === VÉRIFICATION DE LA RÉPONSE ===
    if (!data.success || !data.result || !data.result.items || data.result.items.length === 0) {
      await sock.sendMessage(from, { 
        text: "❌ Aucune actualité sportive disponible pour le moment." 
      }, { quoted: msg });
      return;
    }

    const articles = data.result.items;
    const totalArticles = data.result.pager?.totalCount || articles.length;
    const pageActuelle = data.result.pager?.page || 1;

    // === ENTÊTE ===
    let messageText = `📰 *INFOSPORT - ACTUALITÉS* 📰\n\n`;
    messageText += `📅 ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    messageText += `📊 ${articles.length} actualités • Page ${pageActuelle}\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // === AFFICHER TOUS LES ARTICLES ===
    articles.forEach((article, index) => {
      // Formater la date de publication
      const datePub = new Date(parseInt(article.createdAt));
      const dateFR = datePub.toLocaleDateString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      });

      // Titre en gras
      messageText += `*${index + 1}. ${article.title}*\n`;
      
      // Résumé de l'article
      if (article.summary) {
        messageText += `📌 ${article.summary}\n`;
      }
      
      // Métadonnées
      messageText += `🕐 ${dateFR}`;
      
      // Statistiques de vues/commentaires si disponibles
      if (article.stat) {
        const stats = [];
        if (article.stat.viewCount > 0) stats.push(`👁️ ${article.stat.viewCount}`);
        if (article.stat.commentCount > 0) stats.push(`💬 ${article.stat.commentCount}`);
        if (stats.length > 0) messageText += ` • ${stats.join(' • ')}`;
      }
      
      messageText += `\n`;
      messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    // === PIED DE PAGE AVEC PAGINATION ===
    if (data.result.pager?.hasMore) {
      messageText += `\n📌 Page ${pageActuelle} • Utilise *!infosport next* pour voir plus d'articles\n`;
    }
    
    messageText += `\n> Knut XMD : Actualités sportives (${articles.length} articles)`;

    // === ENVOYER LE RÉSULTAT ===
    await sock.sendMessage(from, { 
      text: messageText 
    }, { quoted: msg });

  } catch (error) {
    console.error("Erreur commande infosport:", error);
    
    let errorMessage = "❌ Erreur lors de la récupération des actualités.\n";
    
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