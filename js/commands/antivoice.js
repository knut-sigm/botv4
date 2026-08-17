import fs from "fs";
import path from "path";
import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "antivoice";

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
    const currentStatus = protections.antiVoice || false;

    // === ARGUMENT ===
    const arg = args[0]?.toLowerCase();

    if (!arg || !["on", "off", "status", "help"].includes(arg)) {
      const status = currentStatus ? "✅ activé" : "🛑 désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Voice\n\n` +
              `État actuel : ${status}\n\n` +
              `🎤 Supprime automatiquement les messages\n` +
              `vocaux envoyés par les membres non-admins.\n\n` +
              `Utilisation :\n` +
              `• antivoice on    → ✅ Activer\n` +
              `• antivoice off   → 🛑 Désactiver\n` +
              `• antivoice status → 📊 Statut\n` +
              `• antivoice help  → ℹ️ Aide`
      }, { quoted: msg });
      return;
    }

    // === HELP ===
    if (arg === "help") {
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Aide Anti-Voice\n\n` +
              `📌 *Description :*\n` +
              `Supprime automatiquement les messages vocaux\n` +
              `envoyés par les membres qui ne sont pas admins.\n\n` +
              `📋 *Commandes :*\n` +
              `• on  → ✅ Activer la protection\n` +
              `• off → 🛑 Désactiver la protection\n` +
              `• status → 📊 Voir le statut actuel`
      }, { quoted: msg });
      return;
    }

    // === STATUS ===
    if (arg === "status") {
      const statusEmoji = currentStatus ? "✅" : "🛑";
      const statusText = currentStatus ? "Activé" : "Désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Voice - Statut\n\n` +
              `État : ${statusEmoji} ${statusText}\n` +
              `Groupe : ${from.split('@')[0]}`
      }, { quoted: msg });
      return;
    }

    // === ON / OFF ===
    const newState = arg === "on";
    
    if (arg === "on" && currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'anti-voice est déjà ✅ activé." 
      }, { quoted: msg });
      return;
    }
    
    if (arg === "off" && !currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'anti-voice est déjà 🛑 désactivé." 
      }, { quoted: msg });
      return;
    }

    setGroupProtection(from, "antiVoice", newState);
    const statusEmoji = newState ? "✅" : "🛑";
    
    await sock.sendMessage(from, { 
      text: `> Knut XMD: Anti-Voice ${statusEmoji} ${newState ? "activé" : "désactivé"} dans ce groupe.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur antivoice:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}