export const name = "audiorespons";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const action = args[0]?.toLowerCase();

  try {
    // Si pas d'action, afficher statut
    if (!action) {
      if (!global.protectionSystem) {
        return await sock.sendMessage(from, {
          text: "> KNUT XMD: ❌ Système non initialisé"
        }, { quoted: msg });
      }

      const stats = global.protectionSystem.getStats();
      return await sock.sendMessage(from, {
        text: `> KNUT XMD: Audiorespons: ${stats.status.audiorespons ? '✅ ON' : '❌ OFF'}`
      }, { quoted: msg });
    }

    // Vérifier action valide
    if (action !== "on" && action !== "off") {
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: Usage: .audiorespons on/off"
      }, { quoted: msg });
    }

    // Vérifier système
    if (!global.protectionSystem) {
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ❌ Système non chargé"
      }, { quoted: msg });
    }

    // Activer ou désactiver
    if (action === "on") {
      global.protectionSystem.setResponsStatus(true);
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ✅ Audiorespons activé"
      }, { quoted: msg });
    }
    
    if (action === "off") {
      global.protectionSystem.setResponsStatus(false);
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ❌ Audiorespons désactivé"
      }, { quoted: msg });
    }

  } catch (err) {
    console.error("Erreur audiorespons:", err);
    await sock.sendMessage(from, {
      text: `> KNUT XMD: ❌ Erreur: ${err.message}`
    }, { quoted: msg });
  }
}