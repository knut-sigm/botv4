export const name = "demote";

export async function execute(sock, msg, args) {

  try {

    const from = msg.key.remoteJid;

    // Récupère les JID mentionnés

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    // Récupère le JID si la commande est en réponse à un message

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;

    // On choisit : mention ou réponse

    const target = mentioned && mentioned.length > 0 ? mentioned[0] : quoted;

    if (!target) {

      return await sock.sendMessage(

        from,

        { text: "> Knut XMD:_ Mentionne ou répond au message de la personne à rétrograder." },

        { quoted: msg }

      );

    }

    // Rétrogradation

    await sock.groupParticipantsUpdate(from, [target], "demote");

    await sock.sendMessage(from, {

      text: `> Knut XMD: ❌ @${target.split("@")[0]} n'est plus admin.`,

      mentions: [target],

    });

  } catch (err) {

    console.error("❌ Erreur demote :", err);

    await sock.sendMessage(msg.key.remoteJid, { text: "> Knut XMD: ❌ Une erreur est survenue." }, { quoted: msg });

  }

}