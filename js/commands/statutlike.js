export const name = "statutlike";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const action = args[0]?.toLowerCase();

  try {
    // Si pas d'argument → afficher le statut actuel
    if (!action) {
      if (!global.protectionSystem || typeof global.protectionSystem.getStats !== "function") {
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ❌ Système de protection non initialisé"
        }, { quoted: msg });
      }

      const stats = global.protectionSystem.getStats();
      const isActive = stats.status?.autostatuslike ?? false;

      const statusText = `> KNUT XMD: AUTO LIKE STATUTS

📊 *Statut:* ${isActive ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ'}
💚 *Likes automatiques envoyés:* ${stats.totalStatusLikes || 0}

*Commandes disponibles :*
• .statutlike on    → Activer le like auto sur les statuts
• .statutlike off   → Désactiver le like auto
• .statutlike       → Voir cet état`;

      return await sock.sendMessage(from, { text: statusText }, { quoted: msg });
    }

    // Vérifier que le système existe
    if (!global.protectionSystem) {
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ❌ Système de protection non initialisé"
      }, { quoted: msg });
    }

    switch (action) {
      case "on":
        global.protectionSystem.setAutoStatusLike(true);
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ✅ Auto like sur les statuts **activé** 💚"
        }, { quoted: msg });

      case "off":
        global.protectionSystem.setAutoStatusLike(false);
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ❌ Auto like sur les statuts **désactivé**"
        }, { quoted: msg });

      default:
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ❌ Commande invalide\n\nUtilisation : `.statutlike on / off`"
        }, { quoted: msg });
    }

  } catch (err) {
    console.error("Erreur dans la commande statutlike :", err);
    await sock.sendMessage(from, {
      text: `> KNUT XMD: ❌ Erreur lors de l'exécution : ${err.message || "inconnue"}`
    }, { quoted: msg });
  }
}