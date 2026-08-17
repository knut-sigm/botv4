// =================== COMMANDE AUTO-KNUT-CHAT ===================
// Fichier : commandes/autoknutchat.js

import fs from "fs";
import path from "path";
import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "knutchat";
export const aliases = ["akc", "autoknut", "autoai"];

export async function execute(sock, msg, args, from) {
  try {
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "❌ Cette commande est réservée aux groupes." }, { quoted: msg });
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
      await sock.sendMessage(from, { text: "❌ Accès refusé. Admin, owner ou sudo requis." }, { quoted: msg });
      return;
    }

    const arg = args[0]?.toLowerCase();
    if (!arg || !["on", "off", "état", "status"].includes(arg)) {
      const current = getGroupProtections(from).autoKnutChat ? "🟢 Activé" : "🔴 Désactivé";
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto-Knut-Chat\n\n📊 État : ${current}\n\nUtilisation : \`!autoknutchat on\` ou \`!autoknutchat off\`\n💡 Alias: !akc, !autoknut, !autoai`
      }, { quoted: msg });
      return;
    }

    if (arg === "on" || arg === "off") {
      const newState = arg === "on";
      setGroupProtection(from, "autoKnutChat", newState);

      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto-Knut-Chat ${newState ? "🟢 activé" : "🔴 désactivé"} dans ce groupe.\n\n${newState ? "Knut répondra automatiquement à tous les messages (sauf aux admins)." : "Knut ne répondra plus automatiquement."}`
      }, { quoted: msg });
    } else if (arg === "état" || arg === "status") {
      const current = getGroupProtections(from).autoKnutChat ? "🟢 Activé" : "🔴 Désactivé";
      const configInfo = `• Cooldown : 5 secondes\n• Longueur min : 3 caractères\n• Ignore les commandes\n• Ignore les admins\n• API : David Cyril Tech`;
      
      await sock.sendMessage(from, {
        text: `> Knut XMD - Auto-Knut-Chat\n\n📊 État : ${current}\n\n⚙️ Configuration :\n${configInfo}\n\n📝 Usage : !autoknutchat on/off`
      }, { quoted: msg });
    }

  } catch (err) {
    console.error("❌ Erreur autoknutchat:", err);
    await sock.sendMessage(from, { text: "❌ Une erreur est survenue." }, { quoted: msg });
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