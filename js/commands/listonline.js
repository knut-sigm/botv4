export const name = "listonline";
export const description = "Liste tous les membres supposés en ligne dans le groupe avec style Knut XMD";

export async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;

    // Vérifie que c'est un groupe
    if (!jid.endsWith("@g.us")) {
      return await sock.sendMessage(
        jid,
        { text: "> ⚠️ KNUT XMD : Cette commande fonctionne uniquement dans un groupe." },
        { quoted: msg }
      );
    }

    // Récupération des participants
    const groupMetadata = await sock.groupMetadata(jid);
    const participants = groupMetadata.participants || [];

    if (participants.length === 0) {
      return await sock.sendMessage(
        jid,
        { text: "> ⚠️ KNUT XMD : Aucun membre trouvé dans le groupe." },
        { quoted: msg }
      );
    }

    // Liste des images disponibles (reprise de tagall)
    const images = [
      "https://files.catbox.moe/xal4j4.jpg",
      "https://files.catbox.moe/7nmtvs.jpg",
      "https://files.catbox.moe/r1bpla.jpg",
      "https://files.catbox.moe/h5hx1j.jpg",
      "https://files.catbox.moe/gb9aqj.jpg",
      "https://files.catbox.moe/muxh9t.jpg",
      "https://files.catbox.moe/nbo1v3.jpg",
      "https://files.catbox.moe/dauqwy.jpg",
      "https://files.catbox.moe/u4d1yv.jpg",
      "https://files.catbox.moe/jdrkep.jpg",
      "https://files.catbox.moe/iz9ckj.jpg",
      "https://files.catbox.moe/94m0al.jpg",
      "https://files.catbox.moe/50y28c.jpg",
      "https://files.catbox.moe/cyifzm.jpg",
      "https://files.catbox.moe/5azi07.jpg",
      "https://files.catbox.moe/09z83q.jpg",
      "https://files.catbox.moe/d2jsot.jpg",
      "https://files.catbox.moe/lb3dh8.jpg",
      "https://files.catbox.moe/p4fs8p.jpg",
      "https://files.catbox.moe/553icm.jpg",
      "https://files.catbox.moe/hlt1z8.jpg",
      "https://files.catbox.moe/c730gt.jpg"
    ];

    // Choix aléatoire d'une image
    const randomImage = images[Math.floor(Math.random() * images.length)];

    // Mentions décorées
    const mentions = participants.map(p => p.id);
    const decoratedMentions = participants
      .map(p => `> ⚫@${p.id.split("@")[0]}`)
      .join("\n");

    // Texte principal
    const text = `> ╔════════════════════╗
        ⚫ KNUT-XMD ⚫
> ╚════════════════════╝

🟢 Membres en ligne supposés (${participants.length}) :

${decoratedMentions}

> Dev by Knut`;

    // Envoi du message
    await sock.sendMessage(
      jid,
      {
        image: { url: randomImage },
        caption: text,
        mentions
      },
      { quoted: msg }
    );

  } catch (err) {
    console.error("_⚫KNUT MDX☠️:_ ❌ Erreur listonline :", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "> ⚠️ KNUT XMD : Impossible de lister les membres en ligne." },
      { quoted: msg }
    );
  }
};