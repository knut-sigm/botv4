export const name = "kickall";

export async function execute(sock, msg, args) {
  const groupJid = msg.key.remoteJid;

  try {
    // Message de démarrage
    await sock.sendMessage(groupJid, { text: "> Knut XMD :Démarrage de l'expulsion de tous les membres non-admin..." });

    let attempts = 0;
    const maxAttempts = 200; // Sécurité anti-boucle infinie

    while (attempts < maxAttempts) {
      const groupMetadata = await sock.groupMetadata(groupJid);
      const participants = groupMetadata.participants;

      const nonAdmins = participants.filter(p => !p.admin);

      if (nonAdmins.length === 0) {
        await sock.sendMessage(groupJid, { text: "> Knut XMD :Tous les membres non-admin ont été expulsés avec succès." });
        return;
      }

      const memberToRemove = nonAdmins[0].id;

      try {
        await sock.groupParticipantsUpdate(groupJid, [memberToRemove], "remove");
      } catch (err) {
        console.warn(`Échec expulsion de ${memberToRemove}:`, err.message);
      }

      // Délai de 1 seconde entre chaque expulsion
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    // Si on atteint la limite
    await sock.sendMessage(groupJid, { text: "> Knut XMD :Limite de tentatives atteinte. Arrêt du processus." });

  } catch (err) {
    console.error("Erreur critique dans kickall :", err);
    await sock.sendMessage(groupJid, { text: "> Knut XMD :Une erreur est survenue lors de l'exécution." });
  }
}