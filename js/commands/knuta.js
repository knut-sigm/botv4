import fs from "fs";
import path from "path";
import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "knuta";

export async function execute(sock, msg, args, from) {
  try {
    // Vérifie que c'est dans un groupe
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : Cette commande est réservée aux groupes uniquement." 
      }, { quoted: msg });
      return;
    }

    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");

    // Récupération des owners et sudo
    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));

    const isOwner = owners.includes(senderNum);
    const isSudo = sudoList.includes(senderNum);
    const isAdmin = await isGroupAdmin(sock, from, sender);

    // Vérification des permissions
    if (!isOwner && !isSudo && !isAdmin) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : Accès refusé.\nSeuls les admins, owners ou sudo peuvent utiliser cette commande." 
      }, { quoted: msg });
      return;
    }

    const arg = args[0]?.toLowerCase();

    // Affichage de l'état actuel si pas d'argument ou argument invalide
    if (!arg || !["on", "off"].includes(arg)) {
      const current = getGroupProtections(from).knuta ? "activé" : "désactivé";
      await sock.sendMessage(from, { 
        text: `> Knut XMD : 🎙️ Mode KnutA (IA Vocale Auto)\n\nÉtat actuel : *${current}*\n\nUtilisation :\n\`!knuta on\` → Activer les réponses vocales automatiques\n\`!knuta off\` → Désactiver`
      }, { quoted: msg });
      return;
    }

    // Activation / Désactivation
    const newState = arg === "on";
    setGroupProtection(from, "knuta", newState);

    await sock.sendMessage(from, { 
      text: `> Knut XMD : 🎙️ KnutA (IA Vocale) a été *\( {newState ? "activé" : "désactivé"}* dans ce groupe.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur commande knuta :", err);
    await sock.sendMessage(from, { 
      text: "> Knut XMD : ⚠️ Une erreur est survenue lors du traitement de la commande." 
    }, { quoted: msg });
  }
}

// Fonction pour vérifier si l'utilisateur est admin du groupe
async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    return metadata.participants.some(p => p.id === userJid && p.admin);
  } catch {
    return false;
  }
}