export const name = 'invite';
export const aliases = ['link'];
export const description = 'Génère le lien d’invitation uniquement pour un administrateur.';

const numberOf = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
const isOwner = (jid) => {
  const n = numberOf(jid);
  return Boolean(global.owners?.some((owner) => numberOf(owner) === n));
};

export async function execute(sock, msg, args, from) {
  if (!from?.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Cette commande fonctionne uniquement dans un groupe.' }, { quoted: msg });
  const sender = msg.key?.participant || msg.key?.remoteJid;
  try {
    const metadata = await sock.groupMetadata(from);
    const participant = metadata.participants?.find((p) => p.id === sender || numberOf(p.id) === numberOf(sender));
    if (!isOwner(sender) && !participant?.admin) return sock.sendMessage(from, { text: '❌ Réservé aux administrateurs du groupe.' }, { quoted: msg });
    const code = await sock.groupInviteCode(from);
    return sock.sendMessage(from, { text: `🔗 *Lien d’invitation*\nhttps://chat.whatsapp.com/${code}` }, { quoted: msg });
  } catch {
    return sock.sendMessage(from, { text: '⚠️ Le lien ne peut pas être généré. Vérifie que Knut est administrateur.' }, { quoted: msg });
  }
}
