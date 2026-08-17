import fs from "fs";
import path from "path";
import { loadSudo } from "../knut-bridge.js";

export const name = "autostatuslike";

export async function execute(sock, msg, args, from) {
  try {
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

    // === VÉRIFIER SYSTÈME DE PROTECTION ===
    if (!global.protectionSystem) {
      await sock.sendMessage(from, { text: "> Knut XMD : Système de protection non initialisé." }, { quoted: msg });
      return;
    }

    const autoLike = global.protectionSystem;
    const stats = autoLike.getStats();
    const currentStatus = stats.status.autostatuslike;

    // === ARGUMENT ===
    const arg = args[0]?.toLowerCase();

    if (!arg || !["on", "off", "status"].includes(arg)) {
      const status = currentStatus ? "✅ activé" : "🛑 désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto Status Like\n\n` +
              `État actuel : ${status}\n` +
              `Likes donnés : ${stats.totalStatusLikes} 💚\n\n` +
              `Utilisation :\n` +
              `• autostatuslike on    → ✅ Activer\n` +
              `• autostatuslike off   → 🛑 Désactiver\n` +
              `• autostatuslike status → 📊 Statut`
      }, { quoted: msg });
      return;
    }

    // === STATUS DÉTAILLÉ ===
    if (arg === "status") {
      const statusEmoji = currentStatus ? "✅" : "🛑";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Auto Status Like - Statut\n\n` +
              `État : ${statusEmoji} ${currentStatus ? "Activé" : "Désactivé"}\n` +
              `Likes donnés : ${stats.totalStatusLikes} 💚\n` +
              `Like automatique sur tous les statuts`
      }, { quoted: msg });
      return;
    }

    // === ON / OFF ===
    const newState = arg === "on";
    
    if (arg === "on" && currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'auto status like est déjà ✅ activé." 
      }, { quoted: msg });
      return;
    }
    
    if (arg === "off" && !currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'auto status like est déjà 🛑 désactivé." 
      }, { quoted: msg });
      return;
    }

    if (arg === "on") {
      autoLike.setAutoStatusLike(true);
    } else {
      autoLike.setAutoStatusLike(false);
    }

    const statusEmoji = newState ? "✅" : "🛑";
    await sock.sendMessage(from, { 
      text: `> Knut XMD: Auto Status Like ${statusEmoji} ${newState ? "activé" : "désactivé"}.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur autostatuslike:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}