export default {
  name: 'join',
  alias: ['joingroup', 'addgroup'],
  category: 'Group',

  async execute(sock, m) {
    const from = m.chat;

    // 🔍 Texte après la commande
    const body = m.body || '';
    const text = body.split(/\s+/).slice(1).join(' ').trim();

    if (!text) {
      return await sock.sendMessage(
        from,
        { text: '> Knut XMD : Utilisation → .join <lien WhatsApp>' },
        { quoted: m }
      );
    }

    // 🔗 Extraction du code
    const match = text.match(
      /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})|^([0-9A-Za-z]{20,24})$/
    );

    const inviteCode = match?.[1] || match?.[2];

    if (!inviteCode) {
      return await sock.sendMessage(
        from,
        { text: '> Knut XMD : Lien WhatsApp invalide.' },
        { quoted: m }
      );
    }

    try {
      await sock.groupAcceptInvite(inviteCode);

      await sock.sendMessage(
        from,
        { text: '> Knut XMD : Groupe rejoint.' },
        { quoted: m }
      );

      console.log(`[JOIN] OK → ${inviteCode}`);
    } catch (err) {
      console.error('[JOIN ERROR]', err);

      let reason = 'Impossible de rejoindre le groupe.';
      if (err.message?.includes('invite')) reason = 'Lien invalide ou expiré.';
      else if (err.message?.includes('ban')) reason = 'Bot banni de ce groupe.';
      else if (err.message?.includes('full')) reason = 'Groupe plein.';
      else if (err.message?.includes('permission')) reason = 'Accès refusé.';

      await sock.sendMessage(
        from,
        { text: `> Knut XMD : ${reason}` },
        { quoted: m }
      );
    }
  }
};