import fs from "fs";
import path from "path";
import { loadSudo } from "../knut-bridge.js";

const AUDIO_FILE = path.resolve("./respon.mp3");

export const name = "audiorespon";

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

    const audioRespons = global.protectionSystem;
    const stats = audioRespons.getStats();
    const currentStatus = stats.status.audiorespons;

    // === ARGUMENT ===
    const arg = args[0]?.toLowerCase();

    if (!arg || !["on", "off", "test", "status"].includes(arg)) {
      const audioExists = fs.existsSync(AUDIO_FILE);
      const audioStatus = audioExists ? "✅ Fichier OK" : "❌ Fichier manquant";
      const status = currentStatus ? "✅ activé" : "🛑 désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Audio Response\n\n` +
              `État actuel : ${status}\n` +
              `Fichier : ${audioStatus}\n` +
              `Mentions : ${stats.totalMentions}\n` +
              `Audios envoyés : ${stats.totalAudiosSent}\n\n` +
              `Utilisation :\n` +
              `• audiorespon on    → ✅ Activer\n` +
              `• audiorespon off   → 🛑 Désactiver\n` +
              `• audiorespon test  → 🎵 Envoyer un test\n` +
              `• audiorespon status → 📊 Statut détaillé`
      }, { quoted: msg });
      return;
    }

    // === STATUS DÉTAILLÉ ===
    if (arg === "status") {
      const audioExists = fs.existsSync(AUDIO_FILE);
      const audioStatus = audioExists ? "✅ OK" : "❌ Manquant";
      const stats = audioRespons.getStats();
      const statusEmoji = currentStatus ? "✅" : "🛑";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Audio Response - Statut\n\n` +
              `État : ${statusEmoji} ${currentStatus ? "Activé" : "Désactivé"}\n` +
              `Fichier : ${audioStatus}\n` +
              `Mentions reçues : ${stats.totalMentions}\n` +
              `Audios envoyés : ${stats.totalAudiosSent}\n` +
              `Erreurs : ${stats.errors}\n` +
              `Owner LID : ${stats.ownerLid || "Non défini"}`
      }, { quoted: msg });
      return;
    }

    // === TEST ===
    if (arg === "test") {
      if (!fs.existsSync(AUDIO_FILE)) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ❌ Fichier \"./respon.mp3\" introuvable." 
        }, { quoted: msg });
        return;
      }

      await sock.sendMessage(from, { 
        text: "> Knut XMD : 🎵 Envoi du fichier audio de test..." 
      }, { quoted: msg });
      
      await audioRespons.sendTestAudio(from);
      return;
    }

    // === ON / OFF ===
    const newState = arg === "on";
    
    if (arg === "on" && currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'audio response est déjà ✅ activé." 
      }, { quoted: msg });
      return;
    }
    
    if (arg === "off" && !currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'audio response est déjà 🛑 désactivé." 
      }, { quoted: msg });
      return;
    }

    if (arg === "on") {
      audioRespons.setResponsStatus(true);
    } else {
      audioRespons.setResponsStatus(false);
    }

    const statusEmoji = newState ? "✅" : "🛑";
    await sock.sendMessage(from, { 
      text: `> Knut XMD: Audio Response ${statusEmoji} ${newState ? "activé" : "désactivé"}.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur audiorespon:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}