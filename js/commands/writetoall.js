// commands/writetoall.js

export const name = "writetoall";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  // Vérifier si c'est bien une commande avec message

  if (!args || args.length === 0) {

    await sock.sendMessage(from, { text: "> Knut MD :Usage : .writetoall <message>" });

    return;

  }

  const textToSend = args.join(" "); // message à envoyer

  try {

    // Vérifier si c'est un groupe

    if (!from.endsWith("@g.us")) {

      await sock.sendMessage(from, { text: "Cette commande doit être utilisée dans un groupe !" });

      return;

    }

    // Récupérer les participants du groupe

    const groupMetadata = await sock.groupMetadata(from);

    const participants = groupMetadata.participants.map(p => p.id);

    // Envoyer le message à chaque participant

    for (const participant of participants) {

      // Ignorer les bots (optionnel)

      if (participant.includes("bot")) continue;

      await sock.sendMessage(participant, { text: textToSend });

    }

    await sock.sendMessage(from, { text: `> Knut MD : Message envoyé à tous les membres du groupe( ${participants.length} membres.)` });

  } catch (e) {

    console.error("Erreur writetoall:", e);

    await sock.sendMessage(from, { text: "❌ Une erreur est survenue lors de l'envoi du message." });

  }

};