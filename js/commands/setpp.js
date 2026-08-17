import { downloadContentFromMessage } from "baileys";

export const name = "setpp";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  // Vérifier si on a bien répondu à un message

  const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

  if (!ctxInfo || !ctxInfo.quotedMessage?.imageMessage) {

    return await sock.sendMessage(from, {

      text: "> Knut XMD: ⚠️ Réponds à une image pour changer la photo de profil du bot."

    }, { quoted: msg });

  }

  try {

    const quoted = ctxInfo.quotedMessage.imageMessage;

    // Télécharger l'image via Baileys

    const stream = await downloadContentFromMessage(quoted, "image");

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {

      buffer = Buffer.concat([buffer, chunk]);

    }

    // Définir la photo de profil du bot

    await sock.updateProfilePicture(sock.user.id, buffer);

    await sock.sendMessage(from, {

      text: "> Knut XMD: ✅ La photo de profil du bot a été mise à jour avec succès !"

    }, { quoted: msg });

  } catch (err) {

    console.error("❌ Erreur setpp :", err);

    await sock.sendMessage(from, {

      text: "> Knut XMD: ❌ Impossible de changer la photo de profil."

    }, { quoted: msg });

  }

}