import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "baileys";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { createLimiter, sanitizeError } from "./js/runtime-guard.js";
import { MessageDeduper } from "./js/message-deduper.js";
import { Metrics } from "./js/performance-metrics.js";
import { readJson, writeJsonAtomic } from "./js/secure-store.js";
import pino from "pino";
import { Boom } from "@hapi/boom";
import dotenv from "dotenv";
import { initProtections } from "./js/protections.js";
import { initProtections as initProtections2 } from "./js/protections2.js";
import { registerGroupOnOwnerMessage } from "./js/groupManager.js";
import bugCommands from "./js/bug.js"; // Uniquement bug.js est conservé

dotenv.config();

const KNUT_ROOT = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.join(KNUT_ROOT, "js", "commands");

// =================== CONFIGURATION ===================
const config = {
  PREFIXE_COMMANDE: process.env.PREFIXE || "!",
  DOSSIER_AUTH: path.resolve(process.cwd(), process.env.DOSSIER_AUTH || "session"),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  RECONNECT_DELAY: Math.max(1000, Number.parseInt(process.env.RECONNECT_DELAY || "5000", 10)),
  RECONNECT_MAX: Math.max(10_000, Number.parseInt(process.env.RECONNECT_MAX || "60000", 10)),
  MAX_COMMANDS: Math.max(1, Number.parseInt(process.env.KNUT_MAX_CONCURRENT_COMMANDS || "4", 10))
};

const messageDeduper = new MessageDeduper({ max: 4096, ttlMs: 45_000 });
const commandLimiter = createLimiter(config.MAX_COMMANDS);
const metrics = new Metrics({ maxSamples: 2000 });
let reconnectAttempt = 0;
let reconnectTimer = null;
let commandsLoaded = false;

// =================== LOGGER ===================
const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: { colorize: true, ignore: "pid,hostname", translateTime: "HH:MM:ss" }
  },
  base: null
});

// =================== FICHIERS ===================
const SUDO_FILE = path.join(KNUT_ROOT, "json", "sudo.json");
const CONFIG_PATH = path.join(KNUT_ROOT, "config.json");
const MODE_PREFIX_FILE = path.join(KNUT_ROOT, "json", "modeprefix.json");
const GROUP_CONFIG_PATH = path.join(KNUT_ROOT, "json", "group.json");
const JID_FILE = path.join(KNUT_ROOT, "json", "jid.json");
const RESPONS_FILE = path.join(KNUT_ROOT, "json", "respons.json");
const SESSION_CREDS_PATH = path.join(config.DOSSIER_AUTH, "creds.json");

// Init files
fs.ensureDirSync(KNUT_ROOT);
if (!fs.existsSync(CONFIG_PATH)) writeJsonAtomic(CONFIG_PATH, { users: {}, owners: [] });
if (!fs.existsSync(MODE_PREFIX_FILE)) writeJsonAtomic(MODE_PREFIX_FILE, { modeprefix: true });
if (!fs.existsSync(GROUP_CONFIG_PATH)) writeJsonAtomic(GROUP_CONFIG_PATH, { groups: {} });

if (!fs.existsSync(JID_FILE)) {
  writeJsonAtomic(JID_FILE, { ownerLid: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
}

if (!fs.existsSync(RESPONS_FILE)) {
  writeJsonAtomic(RESPONS_FILE, { audioUrl: "https://files.catbox.moe/mej4f0.mp3", type: "notification_sound", createdAt: new Date().toISOString() });
  logger.info("respons.json créé avec l'URL audio par défaut");
}

// =================== UTILITAIRES ===================
const normalizeJid = (jid) => {
  if (!jid) return null;
  const base = String(jid).trim().split(":")[0];
  return base.includes("@") ? base : `${base}@s.whatsapp.net`;
};

const getBareNumber = (input) => {
  if (!input) return "";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
};

const unwrapMessage = (m) => {
  return m?.ephemeralMessage?.message ||
         m?.viewOnceMessageV2?.message ||
         m?.viewOnceMessageV2Extension?.message ||
         m?.documentWithCaptionMessage?.message ||
         m?.viewOnceMessage?.message ||
         m;
};

const pickText = (m) => {
  if (!m) return "";
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.templateButtonReplyMessage?.selectedId ||
    m.reactionMessage?.text ||
    (m.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
      ? JSON.parse(m.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson || "{}")?.text || ""
      : "")
  );
};

// =================== GESTION JID.JSON ===================
const saveOwnerLid = (lid) => {
  try {
    const jidData = fs.existsSync(JID_FILE) 
      ? JSON.parse(fs.readFileSync(JID_FILE, 'utf-8'))
      : {};
    jidData.ownerLid = lid;
    jidData.updatedAt = new Date().toISOString();
    writeJsonAtomic(JID_FILE, jidData);
    logger.info(`Lid de l'owner sauvegardé dans jid.json: ${lid}`);
  } catch (error) {
    logger.error(`Erreur lors de la sauvegarde du lid: ${error.message}`);
  }
};

const readOwnerLid = () => {
  try {
    if (!fs.existsSync(JID_FILE)) return null;
    const jidData = JSON.parse(fs.readFileSync(JID_FILE, 'utf-8'));
    return jidData.ownerLid || null;
  } catch (error) {
    logger.error(`Erreur lors de la lecture du lid: ${error.message}`);
    return null;
  }
};

const readAudioUrl = () => {
  try {
    if (!fs.existsSync(RESPONS_FILE)) return "https://files.catbox.moe/mej4f0.mp3";
    const responsData = JSON.parse(fs.readFileSync(RESPONS_FILE, 'utf-8'));
    return responsData.audioUrl || "https://files.catbox.moe/mej4f0.mp3";
  } catch (error) {
    logger.error(`Erreur lors de la lecture de l'URL audio: ${error.message}`);
    return "https://files.catbox.moe/mej4f0.mp3";
  }
};

// =================== CONFIG / SUDO / MODE ===================
const getConfig = () => readJson(CONFIG_PATH, { users: {}, owners: [] });
const saveConfig = (cfg) => writeJsonAtomic(CONFIG_PATH, cfg);

const setOwner = (user) => {
  const cfg = getConfig();
  if (!cfg.owners) cfg.owners = [];
  
  const add = (num) => { 
    if (num && !cfg.owners.includes(num)) {
      cfg.owners.push(num);
      logger.info(`Owner ajouté: ${num}`);
    }
  };
  
  // Ajouter l'ID normal
  if (user?.id) add(getBareNumber(user.id));
  
  // Ajouter le LID standard
  if (user?.lid) add(getBareNumber(user.lid));
  
  saveConfig(cfg);
  global.owners = cfg.owners;
  logger.info(`Owners: ${cfg.owners.join(", ")}`);
};

// =================== NOUVELLE FONCTION POUR CHARGER LE LID DEPUIS SESSION/CREDS.JSON ===================
const loadLidFromSessionCreds = () => {
  logger.info("🔍 Vérification du fichier session/creds.json pour le LID...");
  
  try {
    // Vérifier si le fichier creds.json existe dans le dossier session à la racine
    if (!fs.existsSync(SESSION_CREDS_PATH)) {
      logger.warn(`⚠️ Fichier non trouvé: ${SESSION_CREDS_PATH}`);
      return false;
    }

    // Lire le fichier creds.json
    const credsData = JSON.parse(fs.readFileSync(SESSION_CREDS_PATH, 'utf8'));
    
    // Récupérer le LID (format: "${lid}:16@lid")
    const sessionLid = credsData?.me?.lid || '';
    
    if (!sessionLid) {
      logger.warn("⚠️ Aucun LID trouvé dans creds.json");
      return false;
    }

    // Extraire le numéro avant le ":"
    const lidNumber = sessionLid.split(':')[0];
    
    if (!lidNumber) {
      logger.warn("⚠️ Format de LID invalide dans creds.json");
      return false;
    }

    // Lire la config actuelle
    const cfg = getConfig();
    
    // Initialiser owners si nécessaire
    if (!cfg.owners) cfg.owners = [];
    
    // Ajouter le LID s'il n'est pas déjà présent
    if (!cfg.owners.includes(lidNumber)) {
      cfg.owners.push(lidNumber);
      saveConfig(cfg);
      global.owners = cfg.owners;
      
      logger.info(`✅ LID ${lidNumber} ajouté à config.json depuis session/creds.json`);
      
      // Sauvegarder aussi dans jid.json
      saveOwnerLid(lidNumber);
      
      return true;
    } else {
      logger.info(`ℹ️ LID ${lidNumber} déjà présent dans config.json`);
      return true;
    }
    
  } catch (error) {
    logger.error(`❌ Erreur lors du chargement du LID: ${error.message}`);
    return false;
  }
};

const loadModePrefix = () => {
  try {
    return JSON.parse(fs.readFileSync(MODE_PREFIX_FILE, "utf-8")).modeprefix ?? true;
  } catch { return true; }
};

const saveModePrefix = (state) => {
  writeJsonAtomic(MODE_PREFIX_FILE, { modeprefix: Boolean(state) });
  logger.info(`Mode prefix: ${state}`);
};
global.saveModePrefix = saveModePrefix;

let sudoCache = { mtimeMs: -1, values: [] };
export const loadSudo = () => {
  try {
    if (!fs.existsSync(SUDO_FILE)) return [];
    const mtimeMs = fs.statSync(SUDO_FILE).mtimeMs;
    if (mtimeMs === sudoCache.mtimeMs) return sudoCache.values;
    const values = readJson(SUDO_FILE, []);
    sudoCache = { mtimeMs, values: Array.isArray(values) ? values.map(getBareNumber).filter(Boolean) : [] };
    return sudoCache.values;
  } catch { return []; }
};

export const isGroupAdmin = async (sock, groupJid, userJid) => {
  try {
    const meta = await sock.groupMetadata(groupJid);
    return meta.participants.find(p => p.id === userJid)?.admin !== null;
  } catch { return false; }
};

// =================== BANNER ===================
const afficherBanner = () => {
  try { console.clear(); } catch {}
  console.log(chalk.cyan(`
╔══════════════════════════════╗
║   KNUT MDX SYSTEM ONLINE     ║
╠══════════════════════════════╣
║  Based on Baileys + Node.js  ║
║  AI, Security, Automation    ║
╚══════════════════════════════╝
  `));
};

// =================== CHARGER COMMANDES ===================
async function loadCommands({ force = false } = {}) {
  if (commandsLoaded && !force) return global.commands;
  const registry = Object.create(null);
  let loadedFromDir = 0;
  let loadedFromBugJs = 0;

  const files = fs.existsSync(COMMANDS_DIR)
    ? fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".js")).sort()
    : [];
  for (const file of files) {
    try {
      const module = await import(`${path.join(COMMANDS_DIR, file)}?v=${process.env.KNUT_COMMAND_CACHE_VERSION || "1"}`);
      const command = module.default || module;
      if (command?.name && typeof command.execute === "function") {
        const name = String(command.name).toLowerCase();
        if (registry[name]) logger.warn(`Conflit : ${name} (commands/${file}) — premier conservé`);
        else { registry[name] = command; loadedFromDir++; }
      }
    } catch (err) {
      logger.warn(`Erreur chargement commands/${file} : ${sanitizeError(err)}`);
    }
  }

  if (Array.isArray(bugCommands)) {
    for (const cmd of bugCommands) {
      if (cmd?.name && typeof cmd.execute === "function") {
        const name = String(cmd.name).toLowerCase();
        if (registry[name]) logger.warn(`Conflit : ${name} (bug.js) — commande existante conservée`);
        else { registry[name] = cmd; loadedFromBugJs++; }
      }
    }
  }

  global.commands = registry;
  commandsLoaded = true;
  logger.info(`📚 Commandes chargées : ${loadedFromDir} (commands) + ${loadedFromBugJs} (bug.js) = ${Object.keys(registry).length} au total`);
  loadLidFromSessionCreds();
  return registry;
}

// =================== QUESTION SANS readline-sync ===================
function askQuestion(query) {
  return new Promise((resolve) => {
    process.stdout.write(chalk.cyan.bold(query));
    process.stdin.resume();
    process.stdin.once("data", (data) => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

// =================== START BOT ===================
const scheduleReconnect = (reason = "connection_closed", resetSession = false) => {
  if (reconnectTimer) return;
  if (resetSession) {
    try { fs.removeSync(config.DOSSIER_AUTH); } catch (error) { logger.warn(`Session cleanup failed: ${sanitizeError(error)}`); }
  }
  const delay = Math.min(config.RECONNECT_MAX, config.RECONNECT_DELAY * (2 ** Math.min(reconnectAttempt, 8))) + Math.floor(Math.random() * 1000);
  reconnectAttempt += 1;
  logger.warn(`Reconnexion planifiée (${reason}) dans ${delay}ms`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startBot().catch(error => logger.error(`Reconnexion échouée: ${sanitizeError(error)}`));
  }, delay);
};

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(config.DOSSIER_AUTH);
    const { version } = await fetchLatestBaileysVersion();
    await loadCommands();

    global.isPrefixMode = loadModePrefix();
    global.audioUrl = readAudioUrl();
    logger.info(`🎵 URL audio chargée: ${global.audioUrl}`);

    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      auth: state,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      msgRetryCounterCache: new Map()
    });

    sock.ev.on("creds.update", saveCreds);

    let phoneNumber = null;

    if (!state.creds.registered) {
      console.log(chalk.yellow.bold("\n📲 Enter your WhatsApp number (ex: 2376XXXXXXXX)"));
      phoneNumber = await askQuestion("Enter your WhatsApp number (ex: 2376XXXXXXXX): ");
      const number = phoneNumber.replace(/[^0-9]/g, "");
      if (!number || number.length < 10) {
        logger.error("❌ Invalid number!");
        process.exit(1);
      }

      try {
        const pairingCode = await sock.requestPairingCode(number, "KNUT1204");
        logger.info("✅ Pairing code generated: " + pairingCode);
        console.log(chalk.greenBright("\n🔐 Pairing code: ") + chalk.yellowBright.bold(pairingCode.split("").join(" ")));
        console.log(chalk.cyan("→ WhatsApp → Linked devices → Link with code\n"));
      } catch (err) {
        logger.error("❌ Pairing code failure:", err.message);
        process.exit(1);
      }
    } else {
      console.log(chalk.green.bold("✅ Existing session found. Connecting..."));
    }

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        reconnectAttempt = 0;
        console.log(chalk.greenBright("✅ Connected to WhatsApp successfully!"));
        
        // AFFICHAGE DE LA BANNIÈRE
        afficherBanner();

        const ownerBare = getBareNumber(sock.user?.id);
        const ownerLid = sock.user?.lid ? getBareNumber(sock.user.lid) : null;
        global.owners = [ownerBare];
        if (ownerLid && ownerLid !== ownerBare) global.owners.push(ownerLid);
        setOwner(sock.user);

        if (ownerLid) {
          saveOwnerLid(ownerLid);
        } else {
          logger.warn("⚠️ Aucun lid trouvé pour l'owner");
        }

        const ownerNumber = phoneNumber ? phoneNumber.replace(/[^0-9]/g, "") : ownerBare;

        // Les commandes sont déjà chargées avant l’ouverture du socket.

        try { 
          initProtections(sock, ownerNumber); 
          logger.info("✅ Protections.js loaded successfully");
        } catch (e) { 
          logger.error("❌ Error loading protections.js:", e); 
        }
        
        try { 
          initProtections2(sock, ownerNumber); 
          logger.info("✅ Protections2.js loaded successfully");
        } catch (e) { 
          logger.error("❌ Error loading protections2.js:", e); 
        }

        try {
          const ownerJid = normalizeJid(global.owners[0] + "@s.whatsapp.net");
          await sock.sendMessage(ownerJid, {
            image: { url: "https://files.catbox.moe/8dheuf.jpg" },
            caption: [
              "*KNUT MDX ACTIVE*",
              `🥷🏾 Mode: ${global.isPrefixMode ? 'Prefix' : 'Without prefix'}`,
              `☢️ Commands: ${Object.keys(global.commands).length}`,
              `🎵 Audio URL: ${global.audioUrl}`,
              "",
              `⚫ Type ${global.isPrefixMode ? config.PREFIXE_COMMANDE : ''}menu`,
              `Thank you for choosing KNUT XMD. 🌌`,
              ``,
              `👨‍💻 Developer Contact:`,
              `📞 +237 673 941 535 — Dev Knut`,
              ``,
              `📢 Join the official community:`,
              `👉 https://whatsapp.com/channel/0029Vb75xwOADTOBVjSgJV0k`,
              ``,
              `— of fluidity 🧠`,
              `— of speed ⚙️`,
              ``,
              `🎯 You will find there:`,
              `• Exclusive modules and futuristic previews`,
              `• Direct contact with the creative sphere of KNUT`,
              ``,
              `Thank you for writing this story with us.`
            ].join("\n")
          });
        } catch (e) {
          logger.warn("⚠️ Owner message failed:", e.message);
        }
      }

      if (connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(chalk.red("❌ Connection closed. Reason:"), reason);
        if (reason !== DisconnectReason.loggedOut) {
          scheduleReconnect(`disconnect_${reason || "unknown"}`);
        } else {
          logger.warn("⚠️ Disconnected (logged out). New session required.");
          scheduleReconnect("logged_out", true);
        }
      }
    });

    // =================== MESSAGES ===================
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== 'notify') return;
      const msg = messages?.[0];
      if (!msg?.message || !messageDeduper.accept(msg)) return;

      const from = msg.key.remoteJid;
      const isGroup = from?.endsWith("@g.us");
      const sender = msg.key.fromMe ? sock.user?.id : (msg.key.participant || from);
      const senderNum = getBareNumber(sender);
      const isOwner = global.owners?.includes(senderNum);
      const isSudo = loadSudo().includes(senderNum);
      if (!isOwner && !isSudo) return;

      if (isGroup && isOwner) registerGroupOnOwnerMessage(from, sock);

      const text = pickText(unwrapMessage(msg.message));
      if (!text) return;

      let cmdName = null;
      let args = [];

      if (global.isPrefixMode) {
        if (!text.startsWith(config.PREFIXE_COMMANDE)) return;
        args = text.slice(config.PREFIXE_COMMANDE.length).trim().split(/ +/);
        cmdName = args.shift()?.toLowerCase();
      } else {
        args = text.trim().split(/ +/);
        cmdName = args.shift()?.toLowerCase();
        if (cmdName?.startsWith(config.PREFIXE_COMMANDE)) return;
      }

      const cmd = global.commands[cmdName];
      if (!cmd) return;

      if (cmd.ownerOnly && !isOwner) {
        await sock.sendMessage(from, { text: "❌ Owner only." });
        return;
      }

      try { await sock.sendMessage(from, { react: { text: "🐺", key: msg.key } }); } catch {}
      const startedAt = Date.now();
      try {
        await commandLimiter(() => cmd.execute(sock, msg, args, from));
        metrics.observe(cmdName, Date.now() - startedAt, true);
      } catch (err) {
        metrics.observe(cmdName, Date.now() - startedAt, false);
        logger.error(`❌ Error in ${cmdName}:`, sanitizeError(err));
      }
    });
  } catch (error) {
    logger.error("❌ Fatal error in startBot:", sanitizeError(error));
    scheduleReconnect("fatal_start_error");
  }
}

// =================== DÉMARRAGE ===================
startBot().catch(error => {
  logger.error("❌ Failed to start bot:", sanitizeError(error));
  scheduleReconnect("initial_start_error");
});
export const protectForObfuscation = (targetObj) => {
  if (!targetObj || typeof targetObj !== "object") return;

  Object.keys(targetObj).forEach(key => {
    // Empêche le renommage de cette clé par l'obfuscateur
    Object.defineProperty(targetObj, key, {
      configurable: false,
      writable: false
    });

    // Si la valeur est une fonction, la gèle aussi
    if (typeof targetObj[key] === "function") {
      Object.defineProperty(targetObj, key, {
        configurable: false,
        writable: false
      });
    }
  });
  return targetObj;
};

// =================== USAGE ===================
// Exemple: protéger les commandes et fonctions critiques
global.commands = protectForObfuscation(global.commands);
global.saveModePrefix = protectForObfuscation({ saveModePrefix }).saveModePrefix;
// =================== ERREURS GLOBALES ===================
process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception:", error);
});