import fs from "fs";
import path from "path";
import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "antisticker";

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
    if (!arg || !["on", "off"].includes(arg)) {
      const current = getGroupProtections(from).antiSticker ? "activé" : "désactivé";
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Sticker\n\nÉtat : ${current}\n\nUtilisation : \`!antisticker on\` ou \`!antisticker off\``
      }, { quoted: msg });
      return;
    }

    const newState = arg === "on";
    setGroupProtection(from, "antiSticker", newState);

    await sock.sendMessage(from, { 
      text: `> Knut XMD: Anti-Sticker ${newState ? "activé" : "désactivé"} dans ce groupe.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur antisticker:", err);
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