import chalk from "chalk";
import axios from "axios";
import { downloadContentFromMessage } from "baileys";
import { getGroupProtections } from "./groupManager.js";
import gTTS from "node-gtts";
import fs from "fs";
import path from "path";
import { getCachedGroupMetadata, BoundedTtlSet } from "./core-cache.js";

// =================== CONFIGURATION GÉNÉRALE ===================
export const CONFIG = {
  blockedLinks: ["chat.whatsapp.com", "bit.ly", "t.me", "tinyurl.com", "ouo.io", "shorte.st"],
  autoLikeInterval: 60_000,
  spam: { limit: 5, timeWindow: 3000, maxWarnings: 3 },
  cooldowns: { protectionToggle: 30000, commandUsage: 5000 }
};

// =================== 22 IMAGES ALÉATOIRES WELCOME & GOODBYE ===================
const WELCOME_IMAGES = [
  "https://files.catbox.moe/xal4j4.jpg","https://files.catbox.moe/7nmtvs.jpg","https://files.catbox.moe/r1bpla.jpg",
  "https://files.catbox.moe/h5hx1j.jpg","https://files.catbox.moe/gb9aqj.jpg","https://files.catbox.moe/muxh9t.jpg",
  "https://files.catbox.moe/nbo1v3.jpg","https://files.catbox.moe/dauqwy.jpg","https://files.catbox.moe/u4d1yv.jpg",
  "https://files.catbox.moe/jdrkep.jpg","https://files.catbox.moe/iz9ckj.jpg","https://files.catbox.moe/94m0al.jpg",
  "https://files.catbox.moe/50y28c.jpg","https://files.catbox.moe/cyifzm.jpg","https://files.catbox.moe/5azi07.jpg",
  "https://files.catbox.moe/09z83q.jpg","https://files.catbox.moe/d2jsot.jpg","https://files.catbox.moe/lb3dh8.jpg",
  "https://files.catbox.moe/p4fs8p.jpg","https://files.catbox.moe/553icm.jpg","https://files.catbox.moe/hlt1z8.jpg",
  "https://files.catbox.moe/c730gt.jpg"
];

const getRandomImage = () => WELCOME_IMAGES[Math.floor(Math.random() * WELCOME_IMAGES.length)];

// =================== RÉACTIONS ===================
const REACTIONS = {
  antiMessage: "✏️",
  antiLink: "🔗",
  antiBot: "🤖",
  antiSticker: "🖼️",
  antiVoice: "🎤",
  antiVideo: "🎥",
  welcome: "🎉",
  goodbye: "❌",
  antiPromote: "🔥",
  antiSpam: "😼"
};

const RANDOM_REACTIONS = ["🔥", "❤️", "💯", "😂", "😍", "🤩", "👀", "💥", "✨", "👌", "🙌", "😎", "💪"];

// =================== LOGGER ===================
class ProtectionLogger {
  static log(protection, action, user, group, details = {}) {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const userInfo = user ? `User: ${getBareNumber(user)}` : 'System';
    const groupInfo = group ? `Group: ${getBareNumber(group)}` : 'Unknown';
    
    console.log(chalk.blue(`[${timestamp}] [${protection.padEnd(15)}] ${action}`));
    console.log(chalk.gray(`   → ${userInfo} | ${groupInfo}`));
    if (Object.keys(details).length > 0) {
      console.log(chalk.gray(`   Details: ${JSON.stringify(details, null, 2)}`));
    }
  }
  
  static error(protection, error, context = {}) {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    console.error(chalk.red(`[${timestamp}] [${protection.padEnd(15)}] ERREUR:`), error.message || error);
    if (Object.keys(context).length > 0) {
      console.error(chalk.red(`   Contexte: ${JSON.stringify(context)}`));
    }
  }

  static warn(protection, message, context = {}) {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    console.warn(chalk.yellow(`[${timestamp}] [${protection.padEnd(15)}] AVERTISSEMENT: ${message}`));
    if (Object.keys(context).length > 0) {
      console.warn(chalk.yellow(`   → ${JSON.stringify(context)}`));
    }
  }
}

// =================== GESTIONNAIRE D'ÉTAT ===================
class ProtectionManager {
  constructor(ownerNumber) {
    this.ownerNumber = ownerNumber?.replace(/[^0-9]/g, "");
    this.userCooldowns = new Map();
    this.spamTracker = new Map();
    this.whitelist = {
      users: new Set([this.ownerNumber]),
      groups: new Set(),
      links: new Set(['trusted-domain.com'])
    };
  }

  isWhitelisted(identifier, type = 'user') {
    const clean = identifier.replace(/[^0-9]/g, "");
    if (type === 'user') return this.whitelist.users.has(clean);
    if (type === 'group') return this.whitelist.groups.has(clean);
    return false;
  }

  getMessageContent(msg) {
    return msg.message?.conversation || 
           msg.message?.extendedTextMessage?.text || 
           msg.message?.imageMessage?.caption ||
           msg.message?.videoMessage?.caption ||
           msg.message?.documentMessage?.caption ||
           '';
  }
}

let protectionManager;

// =================== UTILITAIRES ===================
function getBareNumber(input) {
  if (!input) return "inconnu";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}

async function isBotAdmin(sock, groupId) {
  try {
    const metadata = await getCachedGroupMetadata(sock, groupId);
    const botJid = sock.user?.id;
    if (!botJid) return false;
    return metadata.participants.some(p => p.id === botJid && p.admin);
  } catch (error) {
    ProtectionLogger.error('BOT_ADMIN_CHECK', error, { groupId });
    return false;
  }
}

async function shouldSkipProtection(sock, msg) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return true;

  const sender = msg.key.participant || from;
  if (protectionManager.isWhitelisted(sender, 'user')) return true;

  try {
    const groupMetadata = await getCachedGroupMetadata(sock, from);
    const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
    const isOwner = getBareNumber(sender) === protectionManager.ownerNumber;
    return isAdmin || isOwner || msg.key.fromMe;
  } catch {
    return false;
  }
}

// =================== AUTO-VV 2.0 ===================
export function autoVV(sock) {
  const processedMessages = new BoundedTtlSet({ max: 4096, ttlMs: 60_000 });
  
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const isDM = !isGroup && from.endsWith("@s.whatsapp.net");
      
      if (msg.key.fromMe) continue;

      const messageId = msg.key.id;
      if (processedMessages.has(messageId)) continue;
      processedMessages.add(messageId);

      const viewOnceMessage = 
        msg.message?.viewOnceMessage?.message ||
        msg.message?.viewOnceMessageV2?.message ||
        msg.message?.viewOnceMessageV2Extension?.message;

      if (!viewOnceMessage) continue;

      let shouldProcess = false;
      if (isGroup) {
        const groupProtections = getGroupProtections(from);
        if (groupProtections?.autoVV) shouldProcess = true;
      } else if (isDM) {
        shouldProcess = global.autoVVIB?.enabled !== false;
      }
      
      if (!shouldProcess) continue;

      const sender = msg.key.participant || from;
      if (protectionManager.isWhitelisted(sender, 'user')) continue;
      if (getBareNumber(sender) === protectionManager.ownerNumber) continue;

      if (global.config?.autoVV?.ignoreAdmins) {
        try {
          const metadata = await sock.groupMetadata(from);
          const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
          if (isAdmin) continue;
        } catch {}
      }

      ProtectionLogger.log('AUTO-VV', 'Vue unique détectée → récupération', sender, from);

      try {
        const innerMsg = viewOnceMessage.viewOnceMessageV2?.message ||
                         viewOnceMessage.viewOnceMessageV2Extension?.message ||
                         viewOnceMessage;

        let buffer = Buffer.from([]);
        let mediaType = null;
        let options = {};

        if (innerMsg.imageMessage) {
          mediaType = "image";
          const stream = await downloadContentFromMessage(innerMsg.imageMessage, "image");
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          options = { caption: "> Knut XMD : 🔥 Vue unique récupérée", mimetype: innerMsg.imageMessage.mimetype || "image/jpeg" };
        } else if (innerMsg.videoMessage) {
          mediaType = "video";
          const stream = await downloadContentFromMessage(innerMsg.videoMessage, "video");
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          options = { caption: "> Knut XMD : 🎥 Vue unique récupérée", mimetype: innerMsg.videoMessage.mimetype || "video/mp4", gifPlayback: innerMsg.videoMessage.gifPlayback || false };
        } else if (innerMsg.audioMessage) {
          mediaType = "audio";
          const stream = await downloadContentFromMessage(innerMsg.audioMessage, "audio");
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          options = { mimetype: innerMsg.audioMessage.mimetype || "audio/ogg; codecs=opus", ptt: innerMsg.audioMessage.ptt || false };
        } else if (innerMsg.stickerMessage) {
          mediaType = "sticker";
          const stream = await downloadContentFromMessage(innerMsg.stickerMessage, "sticker");
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          options = {};
        } else if (innerMsg.documentMessage) {
          mediaType = "document";
          const stream = await downloadContentFromMessage(innerMsg.documentMessage, "document");
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          options = { fileName: innerMsg.documentMessage.fileName || "document", mimetype: innerMsg.documentMessage.mimetype || "application/octet-stream" };
        } else {
          await sock.sendMessage(from, { text: `> Knut XMD : 🔍 Vue unique détectée\nType non supporté` });
          continue;
        }

        if (buffer.length > 0) {
          const caption = options.caption 
            ? `${options.caption}\n\n👤 De : @${getBareNumber(sender)}`
            : `👤 De : @${getBareNumber(sender)}`;

          await sock.sendMessage(from, { [mediaType]: buffer, ...options, caption }, { quoted: msg });
          
          if (global.config?.autoVV?.sendReaction !== false) {
            await sock.sendMessage(from, { react: { text: "👁️‍🗨️", key: msg.key } }).catch(() => {});
          }
          
          ProtectionLogger.log('AUTO-VV', `Média ${mediaType} récupéré`, sender, from, { size: buffer.length });
        }

      } catch (error) {
        ProtectionLogger.error('AUTO-VV', error, { from, sender: getBareNumber(sender) });
      }
    }
  });
}

if (!global.config) global.config = {};
if (!global.config.autoVV) global.config.autoVV = { ignoreAdmins: false, sendReaction: true };

// =================== ANTI-PROMOTE1 ===================
export function antipromote1(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    const { id: groupId, action, participants, actor } = update;

    if (action !== "promote") return;

    const groupProtections = getGroupProtections(groupId);
    if (!groupProtections?.antipromote1) return;

    const botIsAdmin = await isBotAdmin(sock, groupId);
    if (!botIsAdmin) {
      ProtectionLogger.warn('ANTIPROMOTE1', 'Bot non admin → impossible de démoter', null, groupId);
      return;
    }

    try {
      const metadata = await getCachedGroupMetadata(sock, groupId);
      const groupName = metadata.subject || "Groupe inconnu";
      const time = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Algiers" });

      const promotedUser = participants[0];
      const promoter = actor;

      if (!promotedUser || !promoter) return;

      const promotedNum = getBareNumber(promotedUser);
      const promoterNum = getBareNumber(promoter);

      if (protectionManager.isWhitelisted(promotedUser, 'user') || protectionManager.isWhitelisted(promoter, 'user')) return;
      if (promoter === sock.user?.id) return;

      const toDemote = [];
      if (promotedUser) toDemote.push(promotedUser);
      if (promoter && promoter !== promotedUser) toDemote.push(promoter);

      if (toDemote.length > 0) {
        await sock.groupParticipantsUpdate(groupId, toDemote, "demote");

        const alertText = `
🚫 *ANTI-PROMOTE ACTIVÉ* 🚫

👤 Tentative de promotion : @${promotedNum}
🔥 Par : @${promoterNum}
📛 Action bloquée !

➡️ Les deux ont été rétrogradés automatiquement.

📍 Groupe : ${groupName}
🕐 ${time}`;

        await sock.sendMessage(groupId, { text: alertText, mentions: [promotedUser, promoter].filter(Boolean) });

        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        if (admins.length > 0) {
          await sock.sendMessage(groupId, { text: "‎".repeat(200), mentions: admins }).catch(() => {});
        }

        ProtectionLogger.log('ANTIPROMOTE1', `Promotion bloquée → démotion de @${promotedNum} et @${promoterNum}`, promoter, groupId);

        const ownerNumber = protectionManager.ownerNumber || global.owners?.[0];
        if (ownerNumber) {
          const ownerJid = ownerNumber + "@s.whatsapp.net";
          await sock.sendMessage(ownerJid, {
            text: `🔴 *ANTI-PROMOTE DÉCLENCHÉ*\n\n👤 @${promotedNum}\n👮 Par : @${promoterNum}\n📍 ${groupName}\n🕐 ${time}\n\n➡️ Démotés automatiquement.`,
            mentions: [promotedUser, promoter].filter(Boolean)
          }).catch(() => {});
        }
      }
    } catch (error) {
      ProtectionLogger.error('ANTIPROMOTE1', error, { groupId });
    }
  });
}

// =================== ANTI-MESSAGE ===================
export function antiMessage(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.antiMessage) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const sender = msg.key.participant || from;
      const text = protectionManager.getMessageContent(msg);
      if (!text.trim()) continue;

      try {
        await sock.sendMessage(from, { delete: msg.key });
        await sock.sendMessage(from, { text: `> Knut XMD: Message texte supprimé ! @${getBareNumber(sender)}`, mentions: [sender] });
        await sock.sendMessage(from, { react: { text: REACTIONS.antiMessage, key: msg.key } });
        ProtectionLogger.log('ANTI-MESSAGE', 'Message texte supprimé', sender, from);
      } catch (error) {
        ProtectionLogger.error('ANTI-MESSAGE', error);
      }
    }
  });
}

// =================== ANTI-LINK ===================
export function antiLink(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.antiLink) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const sender = msg.key.participant || from;
      const text = protectionManager.getMessageContent(msg);
      if (!text) continue;

      const hasBlockedLink = CONFIG.blockedLinks.some(link => text.toLowerCase().includes(link));

      if (!hasBlockedLink) continue;

      try {
        await sock.sendMessage(from, { delete: msg.key });
        await sock.sendMessage(from, { text: `> Knut XMD: Lien interdit détecté et supprimé ! @${getBareNumber(sender)}`, mentions: [sender] });
        await sock.sendMessage(from, { react: { text: REACTIONS.antiLink, key: msg.key } });
        ProtectionLogger.log('ANTI-LINK', 'Lien bloqué supprimé', sender, from, { snippet: text.slice(0, 50) });
      } catch (error) {
        ProtectionLogger.error('ANTI-LINK', error);
      }
    }
  });
}

// =================== ANTI-BOT ===================
export function antiBot(sock) {
  const forbiddenStarters = [
    '.', '?', '!', ';', ':', "'", '"', '*', '^', '§', '∆', '×', '÷', 'π', '√',
    '•', '|', '`', '~', '%', '/', '-', '+', '=', '#', '@', '&', '(', ')', '[', ']',
    '{', '}', '<', '>', '\\', '±', '∞', '°', '©', '®', '™', '¤', '¥', '€', '£'
  ];

  const processedKeys = new Set();

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      const msgId = msg.key.id;
      if (processedKeys.has(msgId)) continue;
      processedKeys.add(msgId);
      setTimeout(() => processedKeys.delete(msgId), 10_000);

      if (!msg.message) continue;

      const from = msg.key.remoteJid;
      if (!from?.endsWith("@g.us")) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.antiBot) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const sender = msg.key.participant || from;
      const text = protectionManager.getMessageContent(msg)?.trim();
      if (!text || text.length < 3) continue;

      const firstChar = text[0];
      if (!forbiddenStarters.includes(firstChar)) continue;

      try {
        await sock.sendMessage(from, { delete: msg.key });

        const botIsAdmin = await isBotAdmin(sock, from);
        if (botIsAdmin) {
          await sock.groupParticipantsUpdate(from, [sender], "remove");
        }

        await sock.sendMessage(from, {
          text: `> Knut XMD: ⚠️ Bot détecté et neutralisé !\n\n@${getBareNumber(sender)} kické pour message automatisé.\nPréfixe détecté : \`${firstChar}\``,
          mentions: [sender]
        });

        await sock.sendMessage(from, { react: { text: REACTIONS.antiBot, key: msg.key } });

        ProtectionLogger.log('ANTI-BOT', `Bot kické (préfixe: ${firstChar})`, sender, from);

      } catch (error) {
        ProtectionLogger.error('ANTI-BOT', error, { sender, group: from });
      }
    }
  });
}

// =================== ANTI-STICKER ===================
export function antiSticker(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message?.stickerMessage || msg.key.fromMe) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.antiSticker) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const sender = msg.key.participant || from;

      try {
        await sock.sendMessage(from, { delete: msg.key });
        await sock.sendMessage(from, { text: `> Knut XMD: Sticker interdit ! @${getBareNumber(sender)}`, mentions: [sender] });
        await sock.sendMessage(from, { react: { text: REACTIONS.antiSticker, key: msg.key } });
        ProtectionLogger.log('ANTI-STICKER', 'Sticker supprimé', sender, from);
      } catch (error) {
        ProtectionLogger.error('ANTI-STICKER', error);
      }
    }
  });
}

// =================== ANTI-VOICE ===================
export function antiVoice(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message?.audioMessage || msg.key.fromMe) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.antiVoice) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const sender = msg.key.participant || from;

      try {
        await sock.sendMessage(from, { delete: msg.key });
        await sock.sendMessage(from, { text: `> Knut XMD: Message vocal interdit ! @${getBareNumber(sender)}`, mentions: [sender] });
        await sock.sendMessage(from, { react: { text: REACTIONS.antiVoice, key: msg.key } });
        ProtectionLogger.log('ANTI-VOICE', 'Message vocal supprimé', sender, from);
      } catch (error) {
        ProtectionLogger.error('ANTI-VOICE', error);
      }
    }
  });
}

// =================== ANTI-VIDEO ===================
export function antiVideo(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message?.videoMessage || msg.key.fromMe) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.antiVideo) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const sender = msg.key.participant || from;

      try {
        await sock.sendMessage(from, { delete: msg.key });
        await sock.sendMessage(from, { text: `> Knut XMD: Vidéo interdite ! @${getBareNumber(sender)}`, mentions: [sender] });
        await sock.sendMessage(from, { react: { text: REACTIONS.antiVideo, key: msg.key } });
        ProtectionLogger.log('ANTI-VIDEO', 'Vidéo supprimée', sender, from);
      } catch (error) {
        ProtectionLogger.error('ANTI-VIDEO', error);
      }
    }
  });
}

// =================== AUTO-REACT ===================
export function autoReact(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.autoReact) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const randomReact = RANDOM_REACTIONS[Math.floor(Math.random() * RANDOM_REACTIONS.length)];

      try {
        await sock.sendMessage(from, { react: { text: randomReact, key: msg.key } });
        ProtectionLogger.log('AUTO-REACT', `Réaction envoyée: ${randomReact}`, msg.key.participant, from);
      } catch (error) {
        ProtectionLogger.error('AUTO-REACT', error);
      }
    }
  });
}

// =================== ANTI-SPAM ===================
export function antiSpam(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.antiSpam) continue;

      if (await shouldSkipProtection(sock, msg)) continue;

      const sender = msg.key.participant || from;
      const key = `${from}:${sender}`;
      const now = Date.now();

      if (!protectionManager.spamTracker.has(key)) {
        protectionManager.spamTracker.set(key, []);
      }

      const history = protectionManager.spamTracker.get(key);
      history.push(now);
      const recent = history.filter(t => now - t < CONFIG.spam.timeWindow);

      if (recent.length > CONFIG.spam.limit) {
        try {
          const botIsAdmin = await isBotAdmin(sock, from);
          if (botIsAdmin) {
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            await sock.sendMessage(from, { text: `> Knut XMD: 🚨 Spam détecté ! @${getBareNumber(sender)} a été kické.`, mentions: [sender] });
          } else {
            await sock.sendMessage(from, { text: `> Knut XMD: Spam détecté (@${getBareNumber(sender)}), mais je ne suis pas admin.`, mentions: [sender] });
          }
          protectionManager.spamTracker.delete(key);
          ProtectionLogger.log('ANTI-SPAM', 'Utilisateur kické pour spam', sender, from);
        } catch (error) {
          ProtectionLogger.error('ANTI-SPAM', error);
        }
      } else {
        protectionManager.spamTracker.set(key, recent);
      }
    }
  });
}

// =================== AUTO-KNUT-CHAT (TEXTE - GPT-4o) ===================
export function autoKnutChat(sock) {
  const cooldownMap = new Map();
  const userCooldown = 5000;

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.autoKnutChat) continue;

      const sender = msg.key.participant || from;
      const cooldownKey = `${from}:${sender}`;
      const now = Date.now();

      if (cooldownMap.has(cooldownKey) && now - cooldownMap.get(cooldownKey) < userCooldown) continue;

      const text = protectionManager.getMessageContent(msg)?.trim();
      if (!text || text.length < 3) continue;
      if (/^[\.\!\?\/\#\*\$\-\+\=]/.test(text)) continue;
      if (protectionManager.isWhitelisted(sender, 'user')) continue;
      if (getBareNumber(sender) === protectionManager.ownerNumber) continue;

      cooldownMap.set(cooldownKey, now);

      try {
        const apiUrl = `https://api.giftedtech.co.ke/api/ai/gpt4o?apikey=gifted&q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        const result = data?.result || data?.response || data?.message;
        if (!result) throw new Error("Pas de réponse GPT-4o");

        await sock.sendMessage(from, { text: `> Knut XMD:\n${result}` }, { quoted: msg });
        ProtectionLogger.log('AUTO-KNUT-CHAT', 'Réponse GPT-4o envoyée', sender, from);

      } catch (error) {
        ProtectionLogger.error('AUTO-KNUT-CHAT', error.message || error, { group: from, sender });
      }
    }
  });
}

// =================== KNUTA : IA + TTS AUTOMATIQUE (VOIX - Gemini) ===================
export function knuta(sock) {
  const cooldownMap = new Map();
  const userCooldown = 8000;
  const tts = gTTS("fr");
  const tempDir = "./bots/knutxmd/temp";

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      if (!from.endsWith("@g.us")) continue;

      const groupProtections = getGroupProtections(from);
      if (!groupProtections?.knuta) continue;

      const sender = msg.key.participant || from;
      const cooldownKey = `${from}:${sender}`;
      const now = Date.now();

      if (cooldownMap.has(cooldownKey) && now - cooldownMap.get(cooldownKey) < userCooldown) continue;

      const text = protectionManager.getMessageContent(msg)?.trim();
      if (!text || text.length < 3) continue;
      if (/^[\.\!\?\/\#\*\$\-\+\=]/.test(text)) continue;
      if (protectionManager.isWhitelisted(sender, 'user')) continue;
      if (getBareNumber(sender) === protectionManager.ownerNumber) continue;

      cooldownMap.set(cooldownKey, now);

      try {
        const apiUrl = `https://api.giftedtech.co.ke/api/ai/gemini?apikey=gifted&q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        const responseText = (data?.result || data?.response || data?.message)?.trim();
        if (!responseText) return; // Silence total si pas de réponse

        const audioPath = path.join(tempDir, `knuta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`);

        await new Promise((resolve, reject) => {
          tts.save(audioPath, responseText, (err) => err ? reject(err) : resolve());
        });

        await sock.sendMessage(from, {
          audio: fs.readFileSync(audioPath),
          mimetype: "audio/mpeg",
          ptt: false
        }, { quoted: msg });

        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

        ProtectionLogger.log('KNUTA', 'Réponse vocale Gemini envoyée', sender, from, { chars: responseText.length });

      } catch (error) {
        ProtectionLogger.error('KNUTA', error.message || error, { group: from, sender });
      }
    }
  });
}

// =================== WELCOME (SANS HIDETAG) ===================
export function welcome(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    const groupProtections = getGroupProtections(update.id);
    if (!groupProtections?.welcome || update.action !== "add") return;

    for (const participant of update.participants) {
      try {
        const metadata = await sock.groupMetadata(update.id);
        const memberCount = metadata.participants.length;
        const groupName = metadata.subject || "ce groupe";
        const randomImg = getRandomImage();

        await sock.sendMessage(update.id, {
          image: { url: randomImg },
          caption: 
`> ┏━━━━━ ✦ KNUT-XMD ✦ ━━━━┓
> ┃ 👥 @${getBareNumber(participant)} 
> ┃ 🎉 Bienvenue dans *${groupName}* !
> ┃ 
> ┃ 💯 Tu es le ${memberCount}ᵉ membre
> ┃ Présente-toi 
> ┗━━━━━━━━ ✦ ✦ ✦ ━━━━━━━━┛`,
          mentions: [participant]
        });

        ProtectionLogger.log('WELCOME', 'Nouveau membre accueilli', participant, update.id);

      } catch (error) {
        ProtectionLogger.error('WELCOME', error, { group: update.id, participant });
      }
    }
  });
}

// =================== GOODBYE (SANS HIDETAG) ===================
export function goodbye(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    const groupProtections = getGroupProtections(update.id);
    if (!groupProtections?.goodbye || update.action !== "remove") return;

    for (const participant of update.participants) {
      try {
        const metadata = await sock.groupMetadata(update.id);
        const memberCount = metadata.participants.length;
        const groupName = metadata.subject || "ce groupe";
        const randomImg = getRandomImage();

        const wasKicked = update.actor && update.actor !== participant;
        const actorNum = update.actor ? getBareNumber(update.actor) : null;

        const goodbyeText = wasKicked 
          ? `> ┏━━━━━ ✦ KNUT-XMD ✦ ━━━━━┓
> ┃ 👤 @${getBareNumber(participant)} 
> ┃ ❌ Expulsé du groupe !
> ┃ 🥷🏾 Par : @${actorNum}
> ┃ 👥 Membres restants : ${memberCount}
> ┗━━━━━━━━ ✦ ✦ ✦ ━━━━━━━┛`
          : `> ┏━━━━━━ ✦ KNUT-XMD ✦ ━━━━━━┓
> ┃ 👤 @${getBareNumber(participant)} 
> ┃ ❌ A quitté le groupe
> ┃ 👥 Membres restants : ${memberCount}
> ┃ 
> ┃ 🫩 C'est toi qui perd !!!!
> ┗━━━━━━━━ ✦ ✦ ✦ ━━━━━━━━┛`;

        await sock.sendMessage(update.id, {
          image: { url: randomImg },
          caption: goodbyeText,
          mentions: wasKicked ? [participant, update.actor].filter(Boolean) : [participant]
        });

        ProtectionLogger.log('GOODBYE', wasKicked ? 'Expulsé' : 'A quitté', participant, update.id);

      } catch (error) {
        ProtectionLogger.error('GOODBYE', error, { group: update.id, participant });
      }
    }
  });
}

// =================== INIT PROTECTIONS ===================
export function initProtections(sock, ownerNumber) {
  if (!ownerNumber) {
    ProtectionLogger.error('INIT', 'ownerNumber manquant !');
    return;
  }

  if (!global.autoVVIB) global.autoVVIB = { enabled: true };

  protectionManager = new ProtectionManager(ownerNumber);

  const availableProtections = [
    antiMessage,
    antiLink,
    antiBot,
    antiSticker,
    antiVoice,
    antiVideo,
    autoReact,
    autoVV,
    welcome,
    goodbye,
    antiSpam,
    autoKnutChat,
    knuta,           // ← IA Vocale automatique (silencieuse)
    antipromote1
  ];

  ProtectionLogger.log('SYSTÈME', 'Démarrage des protections...');

  availableProtections.forEach(protection => {
    protection(sock);
    ProtectionLogger.log('SYSTÈME', `${protection.name.toUpperCase()} activée ✓`);
  });

  ProtectionLogger.log('SYSTÈME', 'Toutes les protections sont ACTIVES ✓');
}