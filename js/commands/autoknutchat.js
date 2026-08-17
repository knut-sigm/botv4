import fs from "fs";
import path from "path";
import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "autoknutchat";

export async function execute(sock, msg, args, from) {
  try {
    // === GROUPE UNIQUEMENT ===
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "> Knut XMD : Cette commande est réservée aux groupes." }, { quoted: msg });
      return;
    }

    // === RÉCUPÉRER L'EXPÉDITEUR ===
    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");

    // === VÉRIFICATION DES DROITS (OWNER ET SUDO UNIQUEMENT) ===
    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));

    const isOwner = owners.includes(senderNum);
    const isSudo = sudoList.includes(senderNum);

    if (!isOwner && !isSudo) {
      await sock.sendMessage(from, { text: "> Knut XMD : Accès refusé. Owner ou sudo requis." }, { quoted: msg });
      return;
    }

    // === RÉCUPÉRER LES PROTECTIONS DU GROUPE ===
    const protections = getGroupProtections(from);
    const currentStatus = protections.autoKnutChat || false;

    // === ARGUMENT ===
    const arg = args[0]?.toLowerCase();

    if (!arg || !["on", "off", "status", "help"].includes(arg)) {
      const status = currentStatus ? "✅ activé" : "🛑 désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto-KnutChat\n\n` +
              `État actuel : ${status}\n\n` +
              `💬 Répond automatiquement aux messages\n` +
              `avec l'IA Gemini (texte uniquement).\n\n` +
              `⏱️ *Cooldown :* 5 secondes par utilisateur\n\n` +
              `Utilisation :\n` +
              `• autoknutchat on    → ✅ Activer\n` +
              `• autoknutchat off   → 🛑 Désactiver\n` +
              `• autoknutchat status → 📊 Statut\n` +
              `• autoknutchat help  → ℹ️ Aide`
      }, { quoted: msg });
      return;
    }

    // === HELP ===
    if (arg === "help") {
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Aide Auto-KnutChat\n\n` +
              `📌 *Description :*\n` +
              `Répond automatiquement aux messages des membres\n` +
              `en utilisant l'IA Gemini (texte).\n\n` +
              `🤖 *IA utilisée :* Gemini\n` +
              `⏱️ *Cooldown :* 5 secondes par utilisateur\n` +
              `🚫 *Ignoré :* Messages avec préfixes (! . / etc)\n\n` +
              `📋 *Commandes :*\n` +
              `• on  → ✅ Activer\n` +
              `• off → 🛑 Désactiver\n` +
              `• status → 📊 Voir le statut`
      }, { quoted: msg });
      return;
    }

    // === STATUS ===
    if (arg === "status") {
      const statusEmoji = currentStatus ? "✅" : "🛑";
      const statusText = currentStatus ? "Activé" : "Désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto-KnutChat - Statut\n\n` +
              `État : ${statusEmoji} ${statusText}\n` +
              `Groupe : ${from.split('@')[0]}\n` +
              `IA : Gemini\n` +
              `Cooldown : 5 secondes`
      }, { quoted: msg });
      return;
    }

    // === ON / OFF ===
    const newState = arg === "on";
    
    if (arg === "on" && currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'auto-knutchat est déjà ✅ activé." 
      }, { quoted: msg });
      return;
    }
    
    if (arg === "off" && !currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'auto-knutchat est déjà 🛑 désactivé." 
      }, { quoted: msg });
      return;
    }

    setGroupProtection(from, "autoKnutChat", newState);
    const statusEmoji = newState ? "✅" : "🛑";
    
    await sock.sendMessage(from, { 
      text: `> Knut XMD: Auto-KnutChat ${statusEmoji} ${newState ? "activé" : "désactivé"} dans ce groupe.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur autoknutchat:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}