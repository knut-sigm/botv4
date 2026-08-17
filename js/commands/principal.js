export const name = "principal";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // Vérifie si c'est un groupe (@g.us)
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "> Knut XMD: Commande de groupe." });
    }

    // Récupère les métadonnées du groupe
    const groupMetadata = await sock.groupMetadata(from);
    const creatorId = groupMetadata.owner; // ID du créateur principal

    if (!creatorId) {
      return await sock.sendMessage(from, { text: "> Knut XMD: ❌ Createur absent ." });
    }

    // Tag du créateur
    await sock.sendMessage(from, {
      text: `> Knut XMD: Le créateur du groupe est : @${creatorId.split("@")[0]}`,
      mentions: [creatorId]
    });

  } catch (err) {
    console.error("❌ Erreur tagcreator :", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "> Knut XMD: ❌ Une erreur est survenue lors de l'exécution de la commande." });
  }
}