import { loadSudo } from "../knut-bridge.js";

export const name = "anticall";

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

    // Initialiser l'état global si besoin
    if (!global.antiCall) global.antiCall = { enabled: true };

    const arg = args[0]?.toLowerCase();
    const current = global.antiCall.enabled;

    if (!arg || !["on", "off"].includes(arg)) {
      const status = current ? "activé" : "désactivé";
      await sock.sendMessage(from, {
        text: `> Knut XMD: Anti-Call\n\nÉtat : ${status}\n\nUtilisation : \`!anticall on\` ou \`!anticall off\``
      }, { quoted: msg });
      return;
    }

    const newState = arg === "on";
    if (newState === current) {
      await sock.sendMessage(from, {
        text: `> Knut XMD: L'anti-call est déjà ${newState ? "activé" : "désactivé"}.`
      }, { quoted: msg });
      return;
    }

    global.antiCall.enabled = newState;
    await sock.sendMessage(from, {
      text: `> Knut XMD: Anti-Call ${newState ? "activé" : "désactivé"} globalement.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur anticall command:", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "Une erreur est survenue." }, { quoted: msg });
  }
}