import fs from "fs";
import path from "path";
import { loadSudo } from "../knut-bridge.js";

export const name = "protection2";

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

    const ps = global.protectionSystem;
    const mainStats = ps.getStats();
    const groupesStats = ps.antiDeleteGroupes?.getStats() || { totalMessages: 0, totalMedia: 0, isEnabled: false, mode: 'simple' };
    const ibStats = ps.antiDeleteIB?.getStats() || { totalContacts: 0, totalMessages: 0, totalMedia: 0, isEnabled: false, botNumber: 'Non défini' };

    const audioStatus = mainStats.status.audiorespons ? "✅" : "🛑";
    const writeStatus = mainStats.status.autowrite ? "✅" : "🛑";
    const recordStatus = mainStats.status.autorecording ? "✅" : "🛑";
    const likeStatus = mainStats.status.autostatuslike ? "✅" : "🛑";
    const groupesStatus = groupesStats.isEnabled ? "✅" : "🛑";
    const ibStatus = ibStats.isEnabled ? "✅" : "🛑";

    const modeText = groupesStats.mode === "simple" ? "📢 Groupe" : "👤 Owner IB";

    const message = 
      `> Knut XMD: *ÉTAT PROTECTIONS 2*\n\n` +
      `🎵 Audio Response    : ${audioStatus}\n` +
      `   Mentions : ${mainStats.totalMentions}\n` +
      `   Audios : ${mainStats.totalAudiosSent}\n\n` +
      `⌨️ Auto Write        : ${writeStatus}\n` +
      `   Simulations : ${mainStats.totalSimulations}\n\n` +
      `🎙️ Auto Recording    : ${recordStatus}\n\n` +
      `💚 Auto Status Like  : ${likeStatus}\n` +
      `   Likes : ${mainStats.totalStatusLikes}\n\n` +
      `👥 Anti-Delete Groups : ${groupesStatus}\n` +
      `   Mode : ${modeText}\n` +
      `   Messages : ${groupesStats.totalMessages}\n` +
      `   Médias : ${groupesStats.totalMedia}\n\n` +
      `💬 Anti-Delete IB    : ${ibStatus}\n` +
      `   Contacts : ${ibStats.totalContacts}\n` +
      `   Messages : ${ibStats.totalMessages}\n` +
      `   Médias : ${ibStats.totalMedia}\n` +
      `   Bot IB : ${ibStats.botNumber}\n\n` +
      `> Commandes disponibles :\n` +
      `• audiorespon\n` +
      `• autowrite\n` +
      `• autorecording\n` +
      `• autostatuslike\n` +
      `• antidelete-groups\n` +
      `• antidelete-ib\n` +
      `• protection2`;

    await sock.sendMessage(from, { text: message }, { quoted: msg });

  } catch (err) {
    console.error("Erreur protection2:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}