export const name = "owner";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

const text = `> ╔════════════════════╗
       ⚫ KNUT XMD ⚫
> ╚════════════════════╝

> DEV BY KNUT

> ╔════ CONTACT ════╗
> ➤ Knut     : +237 673 941 535
> ➤ OMA      : +237 692 422 754
> ➤ Telegram : https://t.me/Devknut
> ╚═════════════════╝

> ╔═ CANAUX OFFICIELS═╗
> ➤ WhatsApp : https://chat.whatsapp.com/0029VbBezz33LdQaHgOdm22n
> ➤ Telegram : https://t.me/knutMDX
> ╚════════════════╝

> ╔═ REJOINS LA CONFRÉRIE ══╗
> ➤ Suivez toutes les mises à jour et nouveautés
> ➤ Accès aux bots, scripts et projets exclusifs
> ╚══════════════════════╝`;

    // Envoi de l'image en entête
    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/86pqoz.jpg" },
      caption: text,
      gifPlayback: true
    }, { quoted: msg });

    // Envoi de l’audio
    await sock.sendMessage(from, {
      audio: { url: "https://files.catbox.moe/fa0fiv.mp4" },
      mimetype: "audio/mpeg"
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur commande owner :", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "> Knut XMD:⚠️ Impossible d’afficher les informations du propriétaire." },
      { quoted: msg }
    );
  }
};