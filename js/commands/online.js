export const name = 'online';
export const aliases = ['statusbot', 'botstatus'];
export const description = 'Affiche l’état de santé local de Knut XMD.';

export async function execute(sock, msg, args, from) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const memory = Math.round(process.memoryUsage().rss / 1024 / 1024);
  const label = sock?.user?.id ? 'connecté' : 'initialisation';
  return sock.sendMessage(from, {
    text: `🟢 *Knut XMD v4 — état opérationnel*\n\n• Connexion : ${label}\n• Uptime : ${hours}h ${minutes}min\n• Mémoire RSS : ${memory} Mo\n• Architecture : résiliente / multi-secours`
  }, { quoted: msg });
}
