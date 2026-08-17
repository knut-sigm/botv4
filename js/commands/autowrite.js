export const name = "autowrite";

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
        text: `> KNUT XMD: Autowrite: ${stats.status.autowrite ? '✅ ON' : '❌ OFF'}`
      }, { quoted: msg });
    }

    // Vérifier action valide
    if (action !== "on" && action !== "off") {
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: Usage: .autowrite on/off"
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
      global.protectionSystem.setAutoWriteStatus(true);
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ✅ Autowrite activé"
      }, { quoted: msg });
    }
    
    if (action === "off") {
      global.protectionSystem.setAutoWriteStatus(false);
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ❌ Autowrite désactivé"
      }, { quoted: msg });
    }

  } catch (err) {
    console.error("Erreur autowrite:", err);
    await sock.sendMessage(from, {
      text: `> KNUT XMD: ❌ Erreur: ${err.message}`
    }, { quoted: msg });
  }
}