// =================== COMMANDE AUTO-VV2 ===================
// Fichier : commandes/autovv2.js

import fs from "fs";
import path from "path";
import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "autovv";
export const aliases = ["avv2", "autoviewonce2", "vv2"];

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { 
        text: "❌ Cette commande est réservée aux groupes." 
      }, { quoted: msg });
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
      await sock.sendMessage(from, { 
        text: "❌ Accès refusé. Admin, owner ou sudo requis." 
      }, { quoted: msg });
      return;
    }

    const arg = args[0]?.toLowerCase();
    
    if (!arg || !["on", "off", "config", "status", "help"].includes(arg)) {
      const groupProtections = getGroupProtections(from);
      const current = groupProtections?.autoVV2 ? "🟢 Activé" : "🔴 Désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto-VV 2.0

📊 État : ${current}

📝 Utilisation :
• .autovv2 on - Active la récupération améliorée des vues uniques
• .autovv2 off - Désactive la récupération
• .autovv2 config - Affiche la configuration
• .autovv2 status - Affiche l'état détaillé

💡 Alias : .avv2, .autoviewonce2, .vv2

🚀 Version 2.0 : Supporte images, vidéos, audios, stickers, documents`
      }, { quoted: msg });
      return;
    }

    if (arg === "on") {
      setGroupProtection(from, "autoVV2", true);
      
      const config = global.config?.autoVV2 || {};
      const supportedTypes = config.supportedTypes?.join(", ") || "tous";
      const ignoreAdmins = config.ignoreAdmins ? "Oui" : "Non";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto-VV 2.0 🟢 ACTIVÉ

✅ Knut récupérera automatiquement les messages en vue unique avec la version 2.0.

🚀 NOUVEAUTÉS :
• Support étendu : Images, Vidéos, Audios, Stickers, Documents
• Mentions de l'expéditeur
• Réactions automatiques
• Meilleure gestion d'erreurs

⚙️ Configuration actuelle :
• Types supportés : ${supportedTypes}
• Ignore les admins : ${ignoreAdmins}
• Taille max : ${(config.maxFileSize / (1024*1024)).toFixed(0)} MB

💡 Utilise .autovv2 off pour désactiver`
      }, { quoted: msg });
      
    } else if (arg === "off") {
      setGroupProtection(from, "autoVV2", false);
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto-VV 2.0 🔴 DÉSACTIVÉ

❌ Knut ne récupérera plus les messages en vue unique (version 2.0).

📌 Les messages en vue unique resteront privés comme prévu par l'expéditeur.`
      }, { quoted: msg });
      
    } else if (arg === "config" || arg === "status") {
      const groupProtections = getGroupProtections(from);
      const current = groupProtections?.autoVV2 ? "🟢 Activé" : "🔴 Désactivé";
      const config = global.config?.autoVV2 || {};
      
      const configInfo = `• État : ${current}
• Types supportés : ${config.supportedTypes?.join(", ") || "tous"}
• Ignore les admins : ${config.ignoreAdmins ? "Oui" : "Non"}
• Taille max : ${(config.maxFileSize / (1024*1024)).toFixed(0)} MB
• Envoi réaction : ${config.sendReaction ? "Oui" : "Non"}
• Mode privé (DM) : ${global.autoVVIB?.enabled !== false ? "🟢 Activé" : "🔴 Désactivé"}`;

      await sock.sendMessage(from, {
        text: `> Knut XMD - Auto-VV 2.0

📊 ÉTAT ET CONFIGURATION

${configInfo}

📝 Commandes :
• .autovv2 on - Active dans ce groupe
• .autovv2 off - Désactive dans ce groupe
• .autovv2 config - Cette info

💡 Alias : .avv2, .autoviewonce2, .vv2`
      }, { quoted: msg });
      
    } else if (arg === "help") {
      await sock.sendMessage(from, {
        text: `> Knut XMD - Aide Auto-VV 2.0

🤖 QU'EST-CE QUE C'EST ?
Auto-VV 2.0 est une version améliorée qui récupère automatiquement les messages envoyés en "vue unique" et les rend visibles à tous.

🛡️ FONCTIONNALITÉS :
• Récupère les images, vidéos, audios, stickers et documents
• Mentionne l'expéditeur original
• Ajoute une réaction au message
• Gestion d'erreurs améliorée

⚙️ CONFIGURATION :
• Par défaut : Ignore les admins du groupe
• Taille max : 100MB par fichier
• Fonctionne aussi en messages privés (DM)

⚠️ REMARQUE :
Cette fonction respecte la vie privée et peut être désactivée à tout moment.`
      }, { quoted: msg });
    }

  } catch (err) {
    console.error("❌ Erreur commande autovv2:", err);
    await sock.sendMessage(from, { 
      text: `❌ Erreur : ${err.message || "Erreur inconnue"}` 
    }, { quoted: msg });
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