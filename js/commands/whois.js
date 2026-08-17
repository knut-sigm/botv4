export const name = "whois";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  try {

    // Déterminer la cible : mention, réponse ou numéro fourni

    let targetJid;

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {

      targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];

    } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

      targetJid = msg.message.extendedTextMessage.contextInfo.participant;

    } else if (args.length) {

      targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    } else {

      targetJid = msg.key.participant || from;

    }

    // Récupérer les infos du contact

    const contact = await sock.onWhatsApp(targetJid);

    const profileUrl = await sock.profilePictureUrl(targetJid, "image").catch(() => null);

    // Numéro enregistré sur WhatsApp

    const userNumber = contact[0]?.jid?.split("@")[0] || targetJid.split("@")[0];

    // Numéro complet pour mention

    const number = targetJid.split("@")[0];

    // Texte KNUT MDX V2

    let whoisText = `> Knut XMD :
> 👤 Numéro enregistré : +${userNumber}
> 📱 Numéro JID : +${number}

> by Knut
`;

    // Si pas de photo de profil

    if (!profileUrl) {

      whoisText += "\n🐺🫩 Aucune photo de profil détectée.";

      await sock.sendMessage(from, { text: `\n${whoisText}` }, { quoted: msg });

      return;

    }

    // Sinon, envoyer la photo + légende

    await sock.sendMessage(from, {

      image: { url: profileUrl },

      caption: `\n${whoisText}`

    }, { quoted: msg });

  } catch (err) {

    console.error("> Knut MD : ❌ Erreur whois :", err);

    await sock.sendMessage(from, { text: "> Knut MD : Erreur whois." }, { quoted: msg });

  }

}