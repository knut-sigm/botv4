import fs from "fs";
import path from "path";
import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "goodbye";

export async function execute(sock, msg, args, from) {
  try {
    // === GROUPE UNIQUEMENT ===
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "> Knut XMD: Cette commande est réservée aux groupes." }, { quoted: msg });
      return;
    }

    // === RÉCUPÉRER L'EXPÉDITEUR ===
    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");

    // === VÉRIFICATION DES DROITS ===
    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));
    const isOwner = owners.includes(senderNum);
    const isSudo = sudoList.includes(senderNum);
    const isAdmin = await isGroupAdmin(sock, from, sender);

    if (!isOwner && !isSudo && !isAdmin) {
      await sock.sendMessage(from, { text: "Accès refusé. Admin, owner ou sudo requis." }, { quoted: msg });
      return;
    }

    // === ARGUMENT ===
    const arg = args[0]?.toLowerCase();

    if (!arg || !["on", "off"].includes(arg)) {
      const current = getGroupProtections(from).goodbye ? "activé" : "désactivé";
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Goodbye Message\n\nÉtat : ${current}\n\nUtilisation : \`!goodbye on\` ou \`!goodbye off\``
      }, { quoted: msg });
      return;
    }

    // === MISE À JOUR ===
    const newState = arg === "on";
    setGroupProtection(from, "goodbye", newState);

    await sock.sendMessage(from, { 
      text: `> Knut XMD: Goodbye Message ${newState ? "activé" : "désactivé"} dans ce groupe.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur goodbye:", err);
    await sock.sendMessage(from, { text: "Une erreur est survenue." }, { quoted: msg });
  }
}

// === Utilitaire isGroupAdmin ===
async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    return metadata.participants.some(p => p.id === userJid && p.admin);
  } catch {
    return false;
  }
}