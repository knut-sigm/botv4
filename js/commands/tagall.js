export const name = "tagall";

export async function execute(sock, msg, args) {
  try {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const participants = groupMetadata.participants || [];
    const mentions = participants.map(p => p.id);

    // Décoration des mentions avec style Knut MDX
    const decoratedMentions = participants
      .map(p => `> ⚫@${p.id.split("@")[0]}`)
      .join("\n");

    // Liste des images disponibles
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

    // Texte principal avec style menu
    const text = `> ╔════════════════════╗
        ⚫ KNUT-XMD⚫
> ╚════════════════════╝

${decoratedMentions}

> Dev by Knut`;

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: randomImage },
      caption: text,
      mentions
    }, { quoted: msg });

  } catch (err) {
    console.error("_⚫KNUT MDX☠️:_ ❌ Erreur tagall :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "> ⚠️ KNUT XMD : Impossible de taguer tous les membres."
    }, { quoted: msg });
  }
};