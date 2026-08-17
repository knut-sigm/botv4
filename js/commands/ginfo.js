export const name = 'ginfo';
export const aliases = ['groupinfo', 'group-info'];
export const description = 'Affiche les informations essentielles du groupe.';

export async function execute(sock, msg, args, from) {
  if (!from?.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Cette commande fonctionne uniquement dans un groupe.' }, { quoted: msg });
  try {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants?.filter((p) => p.admin).length || 0;
    const description = String(metadata.desc || 'Aucune description').slice(0, 600);
    const owner = metadata.owner || 'inconnu';
    const text = [
      `ℹ️ *Informations du groupe*`,
      `• Nom : ${metadata.subject || 'Sans nom'}`,
      `• Membres : ${metadata.participants?.length || 0}`,
      `• Administrateurs : ${admins}`,
      `• Créateur : ${owner}`,
      `• Description : ${description}`
    ].join('\n');
    return sock.sendMessage(from, { text }, { quoted: msg });
  } catch {
    return sock.sendMessage(from, { text: '⚠️ Impossible de récupérer les informations du groupe pour le moment.' }, { quoted: msg });
  }
}
