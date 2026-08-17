import { downloadContentFromMessage } from "baileys";

export const name = "setppg";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  // Vérifie que la commande est lancée dans un groupe

  if (!from.endsWith("@g.us")) {

    return await sock.sendMessage(from, {

      text: "> Knut XMD: ⚠️ Cette commande doit être utilisée dans un groupe."

    }, { quoted: msg });

  }

  // Vérifie si on a bien répondu à une image

  const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

  if (!ctxInfo || !ctxInfo.quotedMessage?.imageMessage) {

    return await sock.sendMessage(from, {

      text: "> Knut XMD: ⚠️ Réponds à une image pour changer la photo de profil du groupe."

    }, { quoted: msg });

  }

  try {

    const quoted = ctxInfo.quotedMessage.imageMessage;

    // Télécharger l'image

    const stream = await downloadContentFromMessage(quoted, "image");

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {

      buffer = Buffer.concat([buffer, chunk]);

    }

    // Mettre à jour la photo de profil du groupe

    await sock.updateProfilePicture(from, buffer);

    await sock.sendMessage(from, {

      text: "> Knut XMD: ✅ La photo de profil du groupe a été mise à jour avec succès !"

    }, { quoted: msg });

  } catch (err) {

    console.error("❌ Erreur setppgc :", err);

    await sock.sendMessage(from, {

      text: "> Knut XMD: ❌ Impossible de changer la photo de profil du groupe."

    }, { quoted: msg });

  }

}