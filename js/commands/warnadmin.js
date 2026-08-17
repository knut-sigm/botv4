import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

export const name = "warnadmin";

export async function execute(sock, msg, args, from) {
  try {
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "Cette commande est réservée aux groupes." }, { quoted: msg });
      return;
    }

    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");

    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));

    const isOwner = owners.includes(senderNum);
    const isSudo = sudoList.includes(senderNum);
    const isAdmin = await isGroupAdmin(sock, from, sender);

    if (!isOwner && !isSudo && !isAdmin) {
      await sock.sendMessage(from, { text: "Accès refusé. Admin, owner ou sudo requis." }, { quoted: msg });
      return;
    }

    const arg = args[0]?.toLowerCase();
    const currentState = getGroupProtections(from).warnAdmin || false;

    if (!arg || !["on", "off"].includes(arg)) {
      const status = currentState ? "activé" : "désactivé";
      await sock.sendMessage(from, {
        text: `> Knut XMD: Notifications admin\n\nÉtat : ${status}\n\nUtilisation : \`!warnadmin on\` ou \`!warnadmin off\``
      }, { quoted: msg });
      return;
    }

    const newState = arg === "on";
    if (newState === currentState) {
      await sock.sendMessage(from, {
        text: `> Knut XMD: Les notifications sont déjà ${newState ? "activées" : "désactivées"}.`
      }, { quoted: msg });
      return;
    }

    setGroupProtection(from, "warnAdmin", newState);

    await sock.sendMessage(from, {
      text: `> Knut XMD: Notifications admin ${newState ? "activées" : "désactivées"} dans ce groupe.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur warnadmin:", err);
    await sock.sendMessage(from, { text: "Une erreur est survenue." }, { quoted: msg });
  }
}

async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    return metadata.participants.some(p => p.id === userJid && p.admin);
  } catch {
    return false;
  }
}