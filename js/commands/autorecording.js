export const name = "autorecording";

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
        text: `> KNUT XMD: Autorecording: ${stats.status.autorecording ? '✅ ON' : '❌ OFF'}`
      }, { quoted: msg });
    }

    // Vérifier action valide
    if (action !== "on" && action !== "off") {
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: Usage: .autorecording on/off"
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
      global.protectionSystem.setAutoRecordingStatus(true);
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ✅ Autorecording activé"
      }, { quoted: msg });
    }
    
    if (action === "off") {
      global.protectionSystem.setAutoRecordingStatus(false);
      return await sock.sendMessage(from, {
        text: "> KNUT XMD: ❌ Autorecording désactivé"
      }, { quoted: msg });
    }

  } catch (err) {
    console.error("Erreur autorecording:", err);
    await sock.sendMessage(from, {
      text: `> KNUT XMD: ❌ Erreur: ${err.message}`
    }, { quoted: msg });
  }
}