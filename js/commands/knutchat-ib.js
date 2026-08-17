// =================== commands/knutchat-ib.js ===================

export default {
  name: "knutchat-ib",
  description: "Activer/désactiver KnutChat en DM (IB)",
  cooldown: 3,
  isOwner: true, // Réservé au propriétaire

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const isDM = from.endsWith("@s.whatsapp.net");

    // État global pour KnutChat en DM
    if (!global.knutChatIB) global.knutChatIB = { enabled: true };

    if (!args[0]) {
      await sock.sendMessage(from, {
        text: `> Knut XMD :KnutChat en DM (IB)*\n\n` +
              `Statut : ${global.knutChatIB.enabled ? "Activé" : "Désactivé"}\n\n` +
              `Utilisation :\n` +
              `• \`!knutchat-ib on\` → Activer\n` +
              `• \`!knutchat-ib off\` → Désactiver\n` +
              `• \`!knutchat-ib status\` → Voir l'état`
      }, { quoted: msg });
      return;
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
      global.knutChatIB.enabled = true;
      await sock.sendMessage(from, {
        text: "> Knut XMD :KnutChat en DM (IB) activé !"
      }, { quoted: msg });
    } else if (action === "off") {
      global.knutChatIB.enabled = false;
      await sock.sendMessage(from, {
        text: "> Knut XMD :KnutChat en DM (IB) désactivé !"
      }, { quoted: msg });
    } else if (action === "status") {
      await sock.sendMessage(from, {
        text: `*Statut KnutChat en DM* : ${global.knutChatIB.enabled ? "Activé" : "Désactivé"}`
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, {
        text: "> Knut XMD :Commande inconnue. Utilise `on`, `off` ou `status`."
      }, { quoted: msg });
    }
  }
};