export const name = "infos";
export const description = "Affiche les informations du bot et de son système.";

export async function execute(sock, msg, args, options = {}) {
  const { botNumber = "" } = options;
  const from = msg?.key?.remoteJid || (msg?.key?.participant || "");

  // === Uptime ===
  const uptime = process.uptime(); // sec
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const uptimeStr = `${h}h ${m}m ${s}s`;

  // === Mémoire & platform ===
  let usedMemMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
  let totalMemGB = "N/A";
  let platform = "N/A";
  try {
    const os = await import("os");
    totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    platform = `${os.platform()} ${os.release()}`;
  } catch (e) {
    console.warn("Impossible d'importer 'os' dynamiquement :", e?.message || e);
  }

  // === Latence ===
  const start = Date.now();
  await sock.sendMessage(from, { text: "> Knut XMD: ⏳ Vérification des performances..." }, { quoted: msg }).catch(() => {});
  const latency = Date.now() - start;

  // === Numéro du bot ===
  const botJid = botNumber || (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "Inconnu";

  // === Message formaté avec '>' devant chaque ligne ===
  const text = 
`> Knut XMD ⚡ Informations du bot
 
> 📱 Numéro     : ${botJid}
> ⏱️ Uptime     : ${uptimeStr}
> 🫩 Latence    : ${latency} ms
> 💾 Mémoire    : ${usedMemMB} MB / ${totalMemGB} GB
> 💻 Platforme  : ${platform}

> Dev by Knut`;

  await sock.sendMessage(from, { text }, { quoted: msg }).catch(err => console.error("infos sendMessage:", err));
}