import axios from "axios";

export const name = "wasted";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    // Identifier l'utilisateur ciblé
    let userToWaste = null;

    // Mention
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentioned?.length > 0) userToWaste = mentioned[0];

    // Réponse
    const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!userToWaste && participant) userToWaste = participant;

    if (!userToWaste) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD:⚠️ Veuillez mentionner quelqu’un ou répondre à son message pour utiliser la commande Wasted !" 
      }, { quoted: msg });
      return;
    }

    // Obtenir la photo de profil
    let profilePic;
    try {
      profilePic = await sock.profilePictureUrl(userToWaste, "image");
    } catch {
      profilePic = "https://i.imgur.com/2wzGhpF.jpeg"; // image par défaut
    }

    // Générer l'image Wasted
    const apiUrl = `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Envoyer l'image Wasted
    await sock.sendMessage(from, {
      image: Buffer.from(response.data),
      caption: `⚰️ *Wasted* : ${userToWaste.split("@")[0]} 💀\n\nRepose en paix…`
    }, { quoted: msg });

    // Supprimer la personne si c’est un groupe
    if (isGroup) {
      try {
        await sock.groupParticipantsUpdate(from, [userToWaste], "remove");
        await sock.sendMessage(from, { text: `🚨 ${userToWaste.split("@")[0]} a été expulsé du groupe !` });
      } catch (kickError) {
        console.error("❌ Impossible de kicker l'utilisateur :", kickError);
        await sock.sendMessage(from, { text: "> Knut XMD:⚠️ Impossible d'expulser l'utilisateur. Vérifiez que j'ai les droits admin !" });
      }
    }

  } catch (err) {
    console.error("❌ Erreur Wasted :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "> Knut XMD:❌ Impossible de créer l'image Wasted. Réessayez plus tard."
    }, { quoted: msg });
  }
}