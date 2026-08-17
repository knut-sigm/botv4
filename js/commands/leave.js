export const name = 'leave';
export const aliases = ['exit', 'left'];
export const description = 'Fait quitter Knut d’un groupe, uniquement sur autorisation owner.';

const numberOf = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
const isOwner = (jid) => {
  const n = numberOf(jid);
  return Boolean(global.owners?.some((owner) => numberOf(owner) === n));
};

export async function execute(sock, msg, args, from) {
  if (!from?.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Cette commande fonctionne uniquement dans un groupe.' }, { quoted: msg });
  const sender = msg.key?.participant || msg.key?.remoteJid;
  if (!isOwner(sender)) return sock.sendMessage(from, { text: '❌ Action réservée au propriétaire de Knut Deploy.' }, { quoted: msg });
  try {
    await sock.sendMessage(from, { text: '👋 Knut XMD quitte ce groupe sur ordre du propriétaire.' }, { quoted: msg });
    await sock.groupLeave(from);
  } catch {
    return sock.sendMessage(from, { text: '⚠️ Impossible de quitter le groupe pour le moment.' }, { quoted: msg });
  }
}
