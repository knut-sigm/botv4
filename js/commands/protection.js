import fs from "fs";
import path from "path";
import { getGroupProtections } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

const GROUP_FILE = path.resolve("./json/group.json");

export const name = "protection";

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
    const p = getGroupProtections(from);

    const message = 
      `> Knut XMD: *ÉTAT DES PROTECTIONS GROUPE*\n\n` +
      `📝 Anti-Message    : ${p.antiMessage ? "✅" : "🛑"}\n` +
      `🔗 Anti-Link       : ${p.antiLink ? "✅" : "🛑"}\n` +
      `🤖 Anti-Bot        : ${p.antiBot ? "✅" : "🛑"}\n` +
      `🖼️ Anti-Sticker    : ${p.antiSticker ? "✅" : "🛑"}\n` +
      `🎤 Anti-Voice      : ${p.antiVoice ? "✅" : "🛑"}\n` +
      `🎥 Anti-Video      : ${p.antiVideo ? "✅" : "🛑"}\n` +
      `😼 Anti-Spam       : ${p.antiSpam ? "✅" : "🛑"}\n` +
      `🔥 Anti-Promote1   : ${p.antipromote1 ? "✅" : "🛑"}\n` +
      `✨ Auto-React      : ${p.autoReact ? "✅" : "🛑"}\n` +
      `👁️ Auto-VV         : ${p.autoVV ? "✅" : "🛑"}\n` +
      `🎉 Welcome         : ${p.welcome ? "✅" : "🛑"}\n` +
      `❌ Goodbye         : ${p.goodbye ? "✅" : "🛑"}\n` +
      `💬 Auto-KnutChat   : ${p.autoKnutChat ? "✅" : "🛑"}\n` +
      `🔊 Knuta (IA)      : ${p.knuta ? "✅" : "🛑"}\n\n` +
      `> Groupe : ${from.split('@')[0]}\n` +
      `> Commandes disponibles : antimessage, antilink, antibot, antisticker, antivoice, antivideo, antispam, antipromote1, autoreact, autovv, welcome, goodbye, autoknutchat, knuta`;

    await sock.sendMessage(from, { text: message }, { quoted: msg });

  } catch (err) {
    console.error("Erreur protection:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}