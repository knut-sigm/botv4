// commands/infosgroups.js

export const name = "infosgroups";
export const description = "Affiche les informations d'un groupe WhatsApp.";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!from.endsWith("@g.us")) {
    await sock.sendMessage(from, { text: "> Knut XMD ⚠️ Cette commande ne fonctionne que dans un groupe !" });
    return;
  }

  try {
    const metadata = await sock.groupMetadata(from);
    const groupName = metadata.subject;
    const participants = metadata.participants;
    const creationDate = metadata.creation;
    const owner = metadata.owner || null;

    // Administrateurs
    const admins = participants.filter(p => p.admin);
    const adminMentions = admins.map(a => `@${a.id.split("@")[0]} (Admin)`);

    // Nombre de membres
    const totalMembers = participants.length;

    // Membre le plus actif
    let mostActive = "Aucune donnée";
    let activeUser = null;
    const recentMsgs = sock.msgs?.[from] || [];
    if (recentMsgs.length > 0) {
      const activityCount = {};
      for (const m of recentMsgs) {
        const sender = m.key.participant || m.key.remoteJid;
        if (!activityCount[sender]) activityCount[sender] = 0;
        activityCount[sender]++;
      }
      const mostActiveId = Object.keys(activityCount).reduce((a, b) =>
        activityCount[a] > activityCount[b] ? a : b
      );
      mostActive = `@${mostActiveId.split("@")[0]} (${activityCount[mostActiveId]} msgs)`;
      activeUser = mostActiveId;
    }

    // Créateur
    let creatorText;
    if (owner) {
      const creatorInGroup = participants.find(p => p.id === owner);
      creatorText = creatorInGroup ? `@${owner.split("@")[0]}` : "> Knut XMD ⚠️ Créateur absent";
    } else {
      creatorText = "Non disponible";
    }

    // === Construction du message au style Knut MD avec '>' devant chaque ligne ===
    let infoText = 
`> Knut XMD: 🌟 Infos du groupe

> 📝 Nom du groupe       : ${groupName}
> 👑 Créateur            : ${creatorText}

> 🛡️ Administrateurs     : ${adminMentions.join(", ")}

> 👥 Membres présents    : ${totalMembers}
> 📆 Date de création    : ${new Date(creationDate * 1000).toLocaleString()}

> Dev by Knut`;

    // Mentions des admins + membre actif + créateur
    const mentions = [
      ...admins.map(a => a.id),
      ...(activeUser ? [activeUser] : []),
      ...(owner ? [owner] : [])
    ];

    await sock.sendMessage(from, { text: infoText, mentions });

  } catch (e) {
    console.error("Erreur infosgroups:", e);
    await sock.sendMessage(from, { text: "> Knut XMD: ⚠️ Impossible de récupérer les informations du groupe." });
  }
}