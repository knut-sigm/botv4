export const name = "purge";

export async function execute(sock, msg, args, options = {}) {
  const from = msg?.key?.remoteJid;
  const ownerNumber = (process.env.OWNER_NUMBER || "").replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  // ───── Réservé aux groupes ─────
  if (!from || !from.endsWith("@g.us")) {
    await sock.sendMessage(from || msg.key.remoteJid, { text: "> Knut XMD : Commande de groupe" }, { quoted: msg });
    return;
  }

  try {
    const groupData = await sock.groupMetadata(from);
    const participants = groupData.participants || [];
    const botJid = (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "";
    const allMembers = participants.map(p => p.id);

    // ───── Membres à expulser : non-admin, ≠ bot, ≠ owner ─────
    const toKick = participants
      .filter(p => !p.admin)
      .map(p => p.id)
      .filter(id => id !== botJid && id !== ownerNumber);

    if (toKick.length === 0) {
      await sock.sendMessage(from, { text: "> Knut XMD : Aucun membre non-admin à expulser." }, { quoted: msg });
      return;
    }

    // ───── COMPTE À REBOURS 3s (propre, sans contour) ─────
    const cdMsg = await sock.sendMessage(from, { text: "3...☠️" });
    await new Promise(r => setTimeout(r, 1000));
    await sock.sendMessage(from, { text: "2...🥷🏾", edit: cdMsg.key });
    await new Promise(r => setTimeout(r, 1000));
    await sock.sendMessage(from, { text: "1...☢️", edit: cdMsg.key });
    await new Promise(r => setTimeout(r, 1000));
    await sock.sendMessage(from, { text: "🥷🏾☢️PURGE.☠️❌", edit: cdMsg.key });

    // ───── TEXTE DRAMATIQUE + IMAGE + HIDETAG ─────
    const purgeText = `> ╔───── PURGE ─────╗
●▬▬▬▬๑♔♔๑▬▬▬▬▬●
 『 𝑻𝑯𝑬 𝑨𝑹𝑪𝑨𝑵𝑬 𝑶𝑫𝑬𝑹 』
☯︎ 𝒔𝒊𝒍𝒆𝒏𝒄𝒆 • 𝒂𝒄𝒕𝒊𝒐𝒏 • 𝒍𝒐𝒚𝒂𝒖𝒕𝒆́
●▬▬▬▬๑♔♔๑▬▬▬▬▬●

⇨『 𝙉𝙤𝙪𝙨 𝙨𝙤𝙢𝙢𝙚𝙨 𝘼𝙧𝙘𝙖𝙣𝙚. 』
𝙉𝙤𝙪𝙨 𝙣’𝙚𝙭𝙞𝙨𝙩𝙤𝙣𝙨 𝙥𝙖𝙨 𝙥𝙤𝙪𝙧 𝙚̂𝙩𝙧𝙚 𝙫𝙪𝙨.
𝙉𝙤𝙪𝙨 𝙣’𝙖𝙫𝙤𝙣𝙨 𝙗𝙚𝙨𝙤𝙞𝙣 𝙙’𝙖𝙪𝙘𝙪𝙣𝙚 𝙖𝙥𝙥𝙧𝙤𝙗𝙖𝙩𝙞𝙤𝙣.
➣𓅔 𝙉𝙤𝙪𝙨 𝙖𝙫𝙖𝙣𝙘̧𝙤𝙣𝙨 𝙙𝙖𝙣𝙨 𝙡𝙚 𝙨𝙞𝙡𝙚𝙣𝙘𝙚, 𝙜𝙪𝙞𝙙𝙚́𝙨 𝙥𝙖𝙧 𝙡𝙖 𝙥𝙧𝙚́𝙘𝙞𝙨𝙞𝙤𝙣, 𝙡𝙖 𝙢𝙖𝙞̂𝙩𝙧𝙞𝙨𝙚 𝙚𝙩 𝙡’𝙞𝙣𝙣𝙤𝙫𝙖𝙩𝙞𝙤𝙣.
➣𓆘 𝙉𝙤𝙩𝙧𝙚 𝙛𝙤𝙧𝙘𝙚 𝙣𝙚 𝙨𝙚 𝙢𝙚𝙨𝙪𝙧𝙚 𝙣𝙞 𝙖𝙪 𝙣𝙤𝙢𝙗𝙧𝙚 𝙣𝙞 𝙖𝙪 𝙗𝙧𝙪𝙞𝙩,
𝙢𝙖𝙞𝙨 𝙖̀ 𝙡’𝙚𝙛𝙛𝙞𝙘𝙖𝙘𝙞𝙩𝙚́ 𝙙𝙚 𝙣𝙤𝙨 𝙖𝙘𝙩𝙞𝙤𝙣𝙨 𝙚𝙩 𝙖̀ 𝙡𝙖 𝙙𝙞𝙨𝙘𝙞𝙥𝙡𝙞𝙣𝙚 𝙙𝙚 𝙣𝙤𝙨 𝙢𝙚𝙢𝙗𝙧𝙚𝙨.
𝘾𝙝𝙖𝙦𝙪𝙚 𝙖𝙘𝙩𝙚 𝙚𝙨𝙩 𝙧𝙚́𝙛𝙡𝙚́𝙘𝙝𝙞. 𝘾𝙝𝙖𝙦𝙪𝙚 𝙨𝙞𝙡𝙚𝙣𝙘𝙚 𝙚𝙨𝙩 𝙨𝙩𝙧𝙖𝙩𝙚́𝙜𝙞𝙦𝙪𝙚.
𝙇𝙖 𝙛𝙚𝙧𝙢𝙚𝙩𝙚́ 𝙚𝙨𝙩 𝙣𝙤𝙩𝙧𝙚 𝙡𝙤𝙞.
➣ 𓃢 𝙇𝙚 𝙧𝙚𝙨𝙥𝙚𝙘𝙩 𝙚𝙨𝙩 𝙖𝙗𝙨𝙤𝙡𝙪.
𝙇𝙖 𝙡𝙤𝙮𝙖𝙪𝙩𝙚́ 𝙚𝙨𝙩 𝙩𝙤𝙩𝙖𝙡𝙚.
𝙇𝙖 𝙙𝙞𝙨𝙘𝙧𝙚́𝙩𝙞𝙤𝙣 𝙚𝙨𝙩 𝙞𝙣𝙫𝙞𝙤𝙡𝙖𝙗𝙡𝙚.
𝙇𝙚 𝙢𝙮𝙨𝙩𝙚̀𝙧𝙚 𝙣𝙤𝙪𝙨 𝙥𝙧𝙤𝙩𝙚̀𝙜𝙚 𝙚𝙩 𝙣𝙤𝙪𝙨 𝙙𝙞𝙨𝙩𝙞𝙣𝙜𝙪𝙚.
➣ 🀉 𝙉𝙤𝙪𝙨 𝙖𝙜𝙞𝙨𝙨𝙤𝙣𝙨 𝙙𝙞𝙛𝙛𝙚́𝙧𝙚𝙢𝙢𝙚𝙣𝙩 𝙥𝙖𝙧𝙘𝙚 𝙦𝙪𝙚 𝙡𝙚 𝙥𝙧𝙚́𝙫𝙞𝙨𝙞𝙗𝙡𝙚 𝙚𝙨𝙩 𝙫𝙪𝙡𝙣𝙚́𝙧𝙖𝙗𝙡𝙚.
𝙉𝙤𝙪𝙨 𝙣’𝙖𝙣𝙣𝙤𝙣𝙘̧𝙤𝙣𝙨 𝙧𝙞𝙚𝙣. 𝙉𝙤𝙪𝙨 𝙤𝙗𝙨𝙚𝙧𝙫𝙤𝙣𝙨, 𝙣𝙤𝙪𝙨 𝙞𝙣𝙣𝙤𝙫𝙤𝙣𝙨, 𝙣𝙤𝙪𝙨 𝙚𝙭𝙚́𝙘𝙪𝙩𝙤𝙣𝙨.
𝙋𝙪𝙞𝙨 𝙣𝙤𝙪𝙨 𝙙𝙞𝙨𝙥𝙖𝙧𝙖𝙞𝙨𝙨𝙤𝙣𝙨.
➣ ♖ 𝘾𝙚𝙪𝙭 𝙦𝙪𝙞 𝙥𝙖𝙧𝙡𝙚𝙣𝙩 𝙡𝙖𝙞𝙨𝙨𝙚𝙣𝙩 𝙙𝙚𝙨 𝙩𝙧𝙖𝙘𝙚𝙨.
𝘼𝙧𝙘𝙖𝙣𝙚 𝙡𝙖𝙞𝙨𝙨𝙚 𝙙𝙚𝙨 𝙘𝙤𝙣𝙨𝙚́𝙦𝙪𝙚𝙣𝙘𝙚𝙨.
𓊈☨𓊉 𝘿𝙚𝙫𝙞𝙨𝙚 :

〘 𝙇𝙚 𝙨𝙞𝙡𝙚𝙣𝙘𝙚 𝙖𝙜𝙞𝙩. 𝙇𝙚𝙨 𝙖𝙘𝙩𝙚𝙨 𝙙𝙤𝙢𝙞𝙣𝙚𝙣𝙩. 〙

       ╚─────────────────╝`;

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/fzpi0q.jpg" },
      caption: purgeText,
      mentions: allMembers
    });

    // ───── EXPULSION EN UNE FOIS ─────
    await sock.groupParticipantsUpdate(from, toKick, "remove");

    // ───── RAPPORT FINAL + HIDETAG ─────
    await sock.sendMessage(from, {
      text: `> Knut MD: *Purge exécutée : ${toKick.length} membre(s) expulsé(s).*\nAdmin et owner protégés`,
      mentions: allMembers
    });

  } catch (err) {
    console.error("Erreur purge :", err);
    await sock.sendMessage(from, { text: "*Erreur lors de la purge.* Vérifie mes permissions." }, { quoted: msg });
  }
}