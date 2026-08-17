import { loadSudo } from "../knut-bridge.js";

export const name = "antiunknown";

export async function execute(sock, msg, args, from) {
  try {
    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");
    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));

    const isOwner = owners.includes(senderNum);
    const isSudo = sudoList.includes(senderNum);

    if (!isOwner && !isSudo) {
      await sock.sendMessage(from, { text: "Accès refusé. Seul le propriétaire ou sudo peut modifier ce réglage." }, { quoted: msg });
      return;
    }

    // Initialiser l'état global à false par défaut
    if (!global.antiUnknown) global.antiUnknown = { enabled: false };

    const arg = args[0]?.toLowerCase();
    const current = global.antiUnknown.enabled;

    if (!arg || !["on", "off"].includes(arg)) {
      const status = current ? "activé" : "désactivé";
      await sock.sendMessage(from, {
        text: `> Knut XMD: Anti-Unknown\n\nÉtat : ${status}\n\nUtilisation : \`!antiunknown on\` ou \`!antiunknown off\``
      }, { quoted: msg });
      return;
    }

    const newState = arg === "on";
    if (newState === current) {
      await sock.sendMessage(from, {
        text: `> Knut XMD: L'anti-unknown est déjà ${newState ? "activé" : "désactivé"}.`
      }, { quoted: msg });
      return;
    }

    global.antiUnknown.enabled = newState;
    await sock.sendMessage(from, {
      text: `> Knut XMD: Anti-Unknown ${newState ? "activé" : "désactivé"} globalement.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur antiunknown command:", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "Une erreur est survenue." }, { quoted: msg });
  }
}