export const name = "tag";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  // Vérifie si c'est un groupe

  if (!from.endsWith("@g.us")) {

    return await sock.sendMessage(from, { text: "> Knut XMD :❌ Commande réservée aux groupes seulement." }, { quoted: msg });

  }

  try {

    const groupMetadata = await sock.groupMetadata(from);

    const participants = groupMetadata.participants;

    let message;

    // 🔹 Si on répond à un message

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (quotedMsg) {

      message =

        quotedMsg.conversation ||

        quotedMsg.extendedTextMessage?.text ||

        quotedMsg.imageMessage?.caption ||

        quotedMsg.videoMessage?.caption ||

        "> 𝐼'𝑚 𝑐𝑟𝑎𝑧𝑦....𝑚𝑎𝑦𝑏𝑒";

    }

    // 🔹 Si on fournit des arguments

    else if (args.length) {

      message = args.join(" ");

    }

    // 🔹 Si rien du tout

    else {

      message = "> 𝐼'𝑚 𝑐𝑟𝑎𝑧𝑦....𝑚𝑎𝑦𝑏𝑒";

    }

    await sock.sendMessage(

      from,

      {

        text: message,

        mentions: participants.map(p => p.id)

      },

      { quoted: msg }

    );

  } catch (e) {

    console.error("❌ Erreur commande tag :", e);

    await sock.sendMessage(from, { text: "> Knut XMD :⚠️ Erreur lors de l'envoi du tag." }, { quoted: msg });

  }

}