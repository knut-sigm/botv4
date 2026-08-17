export const name = "antidelete";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const action = args[0]?.toLowerCase();

  try {
    // Si pas d'action, afficher statut
    if (!action) {
      if (!global.protectionSystem || !global.protectionSystem.antiDelete) {
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ❌ Système anti-delete non initialisé"
        }, { quoted: msg });
      }

      const stats = global.protectionSystem.antiDelete.getStats();
      
      const statusText = `> KNUT XMD: ANTIDELETE

📊 *Statut:* ${stats.isEnabled ? '✅ ON' : '❌ OFF'}
📝 *Messages stockés:* ${stats.totalMessages}/1000
📷 *Médias sauvegardés:* ${stats.totalMedia}

*Commandes:*
• .antidelete on - Activer
• .antidelete off - Désactiver
• .antidelete stats - Voir les statistiques`;

      return await sock.sendMessage(from, {
        text: statusText
      }, { quoted: msg });
    }

    // Vérifier système initialisé
    if (!global.protectionSystem || !global.protectionSystem.antiDelete) {
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ❌ Système anti-delete non initialisé"
      }, { quoted: msg });
    }

    const antiDelete = global.protectionSystem.antiDelete;

    // Gérer les 3 actions
    switch(action) {
      case "on":
        antiDelete.setStatus(true);
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ✅ Anti-delete activé"
        }, { quoted: msg });

      case "off":
        antiDelete.setStatus(false);
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ❌ Anti-delete désactivé"
        }, { quoted: msg });

      case "stats":
        const stats = antiDelete.getStats();
        const statsText = `> KNUT XMD: STATISTIQUES ANTIDELETE

📊 *Statut:* ${stats.isEnabled ? '✅ ACTIF' : '❌ INACTIF'}
📝 *Messages stockés:* ${stats.totalMessages}
📷 *Médias sauvegardés:* ${stats.totalMedia}
🔢 *Limite:* ${stats.maxMessages} messages
🔄 *Rotations:* ${stats.totalRotations} fois`;

        return await sock.sendMessage(from, {
          text: statsText
        }, { quoted: msg });

      default:
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ❌ Commande invalide\n\nUtilise: .antidelete on/off/stats"
        }, { quoted: msg });
    }

  } catch (err) {
    console.error("Erreur antidelete:", err);
    await sock.sendMessage(from, {
      text: `> KNUT XMD: ❌ Erreur: ${err.message}`
    }, { quoted: msg });
  }
}