export const name = "tagadmin";

export async function execute(sock, msg, args) {

  try {

    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);

    const admins = groupMetadata.participants.filter(p => p.admin);

    if (admins.length === 0) {

      return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Aucun admin trouvé dans ce groupe." });

    }

    const mentions = admins.map(a => a.id);

    const text = admins.map(a => `> 👑@${a.id.split("@")[0]}`).join("\n");

    await sock.sendMessage(msg.key.remoteJid, {

      image: { url: "https://files.catbox.moe/r1bpla.jpg" },

      caption: "> 👑 TAGADMIN👑\n\n" + text,

      mentions

    });

  } catch (err) {

    console.error("❌ Erreur tagadmin :", err);

  }

}