
export const name = "prefix";

/**
 * Commande pour basculer ou afficher le mode préfixe du bot.
 * @param {import('baileys').WASocket} sock
 * @param {import('baileys').WAMessage} msg
 * @param {string[]} args
 */
export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const currentMode = global.isPrefixMode ?? true; // Récupère l'état actuel (par défaut: true)

  // 1. Gérer l'affichage du statut actuel
  if (args.length === 0) {
    const statusText = currentMode 
      ? `> Knut XMD: ✅ Le bot est actuellement en mode sans préfixe.\n\nUsage: ${global.PREFIXE_COMMANDE}menu`
      : `❌ Le bot est actuellement en Mode sans préfix.\n\nUsage: menu`;
    
    await sock.sendMessage(from, { 
        text: `> Knut XMD: ⚙️ Statut du Mode Préfixe:\n\n${statusText}\n\nPour changer, utilisez : ${global.isPrefixMode ? global.PREFIXE_COMMANDE : ''}prefix on|off` 
    }, { quoted: msg });
    return;
  }

  // 2. Tenter de changer le statut
  const arg = args[0].toLowerCase();
  let newState;

  if (arg === "true" || arg === "on") {
    newState = true;
  } else if (arg === "false" || arg === "off") {
    newState = false;
  } else {
    await sock.sendMessage(from, { 
        text: `> Knut XMD: ⚠️ Argument invalide. Utilisez "on" ou "off".\n\n> Exemple : ${global.isPrefixMode ? global.PREFIXE_COMMANDE : ''}prefix on/off` 
    }, { quoted: msg });
    return;
  }

  if (newState === currentMode) {
      await sock.sendMessage(from, { 
          text: `> Knut XMD ℹ️ Le mode est déjà réglé sur ${newState ? 'AVEC PRÉFIXE' : 'SANS PRÉFIXE'}.` 
      }, { quoted: msg });
      return;
  }

  try {
    // 3. Basculer et sauvegarder l'état (nécessite l'accès à saveModePrefix)
    
    // Si vous n'avez pas exporté saveModePrefix, vous devrez la coller ici 
    // ou la rendre globale dans index.js.
    // Dans le cas de votre index.js précédent, nous allons supposer que vous avez
    // rendu 'saveModePrefix' accessible ou que vous utilisez le code que j'ai
    // intégré dans le gestionnaire de messages de l'index.js
    
    if (typeof global.saveModePrefix !== "function") {
         await sock.sendMessage(from, { text: "> ❌ Configuration interne manquante : la fonction saveModePrefix est introuvable." }, { quoted: msg });
         return;
    }
    
    global.saveModePrefix(newState); // Appel de la fonction de sauvegarde
    global.isPrefixMode = newState; // Mise à jour de l'état global

    const confirmationText = `> Knut XMD ✅: Mode de commande mis à jour !\n\n> Le bot obéit maintenant ${newState ? 'AVEC PRÉFIXE' : 'SANS PRÉFIXE'}.`;
    await sock.sendMessage(from, { text: confirmationText }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur lors du changement de mode préfixe :", err);
    await sock.sendMessage(from, { text: "> ❌ Échec de la mise à jour du mode préfixe. Vérifiez les logs." }, { quoted: msg });
  }
}