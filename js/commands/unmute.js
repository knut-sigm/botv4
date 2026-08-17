export const name = "unmute";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  // Vérifier si c'est un groupe

  if (!from.endsWith("@g.us")) {

    await sock.sendMessage(from, { text: "> Knut XMD : Commande utilisée pour les groupes." }, { quoted: msg });

    return;

  }

  try {

    // Mettre le groupe en mode "ouvert" (tout le monde peut envoyer)

    await sock.groupSettingUpdate(from, "not_announcement"); // "not_announcement" = tout le monde peut envoyer

    await sock.sendMessage(from, { text: "> Knut XMD : Groupe ouvert !" }, { quoted: msg });

  } catch (err) {

    console.error("Erreur lors de l'ouverture du groupe :", err);

    await sock.sendMessage(from, { text: "> Knut XMD : Impossible d'ouvrir le groupe. Assurez-vous que vous êtes admin." }, { quoted: msg });

  }

}