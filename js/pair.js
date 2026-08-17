// ============================================================
// KNUT XMD V4 — pair.js
// Structure calquée sur rokxd/pair.js
//
// ISOLATION TOTALE PAR SESSION :
//   sessions/{number}/creds.json   → owner, number, lid (source de vérité)
//   sessions/{number}/config.json  → prefix, prefixMode, owners
//   sessions/{number}/sudo.json    → liste sudo propre à ce bot
//   sessions/{number}/group.json   → protections groupes propres à ce bot
//
// Zéro conflit entre plusieurs utilisateurs/sessions simultanées
// Sans préfixe par défaut (prefixMode: false)
// ============================================================

import express from 'express';
import fs      from 'fs-extra';
import path    from 'path';
import pino    from 'pino';
import { retry, sanitizeError } from './runtime-guard.js';
import { readJson, writeJsonAtomic } from './secure-store.js';
import { markConnected, markDisconnected, markReconnect, markCommandError, heartbeat, clearSessionHealth, listSessionHealth } from './session-health.js';
import { publicProviderStatus } from './api-fallback.js';
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  delay
} from 'baileys';

const router = express.Router();

// =======================
// CHEMINS BASE
const SESSIONS_BASE = './sessions';

// =======================
// LIMITES
const MAX_BOTS        = 25;
const MAX_RETRIES     = Number(process.env.KNUT_MAX_RETRIES || 12);
const RECONNECT_BASE  = Number(process.env.KNUT_RECONNECT_BASE_MS || 1500);
const RECONNECT_MAX   = Number(process.env.KNUT_RECONNECT_MAX_MS || 60000);
const PAIRING_TIMEOUT = 5 * 60 * 1000;

// =======================
// ÉTAT GLOBAL — chaque entrée est 100% isolée
let ACTIVE_BOTS = 0;
const retryCount   = new Map();
const pairingLocks = new Set();
const bots         = new Map();
let globalExecution = Promise.resolve();
// bots Map : number → {
//   sock, connected, KhostUserId, commands,
//   sessionDir,   ← chemin sessions/{number}
//   getConfig,    ← lit sessions/{number}/config.json
//   saveConfig,   ← écrit sessions/{number}/config.json
//   getOwners,    ← retourne owners depuis config + lid depuis creds
//   getSudo,      ← lit sessions/{number}/sudo.json
//   saveSudo,
//   getGroups,    ← lit sessions/{number}/group.json
//   saveGroups
// }

// =======================
// UTILITAIRES
const fmt = (num) => {
  let d = num.replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  return d;
};

const bare = (input) => {
  if (!input) return '';
  return String(input).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
};

const removeSession = async (dir) => {
  if (await fs.pathExists(dir)) await fs.remove(dir);
};

// Unwrap messages KNUT
const unwrap = (m) =>
  m?.ephemeralMessage?.message ||
  m?.viewOnceMessageV2?.message ||
  m?.documentWithCaptionMessage?.message ||
  m?.viewOnceMessage?.message || m;

const pickText = (m) => {
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId || ''
  );
};

// =======================
// HELPERS PAR SESSION
// Toutes les données sont dans sessions/{number}/
function makeSessionHelpers(sessionDir) {

  const configPath = path.join(sessionDir, 'config.json');
  const sudoPath   = path.join(sessionDir, 'sudo.json');
  const groupPath  = path.join(sessionDir, 'group.json');
  const credsPath  = path.join(sessionDir, 'creds.json');

  // ── config.json ──────────────────────────────────────────
  const defaultConfig = { prefix: '!', prefixMode: false, owners: [] };
  const getConfig = () => readJson(configPath, defaultConfig);
  const saveConfig = (data) => {
    try { writeJsonAtomic(configPath, data); } catch (error) { console.error(`[KNUT] config save failed: ${sanitizeError(error)}`); }
  };

  // ── creds.json → owner number + LID ──────────────────────
  // C'est la SOURCE DE VÉRITÉ pour l'identité du bot
  const getCredsIdentity = () => {
    try {
      if (!fs.existsSync(credsPath)) return { ownerNumber: null, ownerLid: null };
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      const ownerNumber = bare(creds?.me?.id  || '');
      const ownerLid    = bare(creds?.me?.lid || '');
      return { ownerNumber, ownerLid };
    } catch { return { ownerNumber: null, ownerLid: null }; }
  };

  // ── owners = number + lid depuis creds + owners supplémentaires depuis config ──
  const getOwners = () => {
    const { ownerNumber, ownerLid } = getCredsIdentity();
    const cfg = getConfig();
    const extra = cfg.owners || [];
    const all = new Set();
    if (ownerNumber) all.add(ownerNumber);
    if (ownerLid)    all.add(ownerLid);
    extra.forEach(n => all.add(bare(n)));
    return [...all].filter(Boolean);
  };

  // ── sudo.json ─────────────────────────────────────────────
  const getSudo = () => readJson(sudoPath, []);
  const saveSudo = (list) => {
    try { writeJsonAtomic(sudoPath, Array.isArray(list) ? list.slice(0, 100) : []); } catch (error) { console.error(`[KNUT] sudo save failed: ${sanitizeError(error)}`); }
  };

  // ── group.json ────────────────────────────────────────────
  const getGroups = () => readJson(groupPath, { groups: {} });
  const saveGroups = (data) => {
    try { writeJsonAtomic(groupPath, data); } catch (error) { console.error(`[KNUT] groups save failed: ${sanitizeError(error)}`); }
  };

  const getGroupConfig = (groupJid) => {
    return getGroups().groups?.[groupJid] || {};
  };

  const setGroupProtection = (groupJid, key, value) => {
    const data = getGroups();
    if (!data.groups) data.groups = {};
    if (!data.groups[groupJid]) data.groups[groupJid] = {};
    data.groups[groupJid][key] = value;
    saveGroups(data);
  };

  return {
    configPath, sudoPath, groupPath, credsPath,
    getConfig, saveConfig,
    getCredsIdentity, getOwners,
    getSudo, saveSudo,
    getGroups, saveGroups, getGroupConfig, setGroupProtection
  };
}

// =======================
// CHARGEMENT COMMANDES
// Structure KNUT : export const name + export async function execute
let GLOBAL_COMMANDS = null;

async function loadCommands() {
  const commands = new Map();
  const folder   = path.resolve('./js/commands');
  await fs.ensureDir(folder);

  const files = fs.readdirSync(folder).filter(f => f.endsWith('.js') && !f.startsWith('.'));
  let loaded = 0;

  for (const file of files) {
    try {
      const fp  = path.resolve(folder, file);
      const mod = await import(`${fp}?v=${Date.now()}`);
      const name    = mod.default?.name    || mod.name;
      const execute = mod.default?.execute || mod.execute;
      if (name && typeof execute === 'function') {
        commands.set(name.toLowerCase(), { name, execute });
        loaded++;
      }
    } catch (err) {
      console.error(`  [KNUT] ❌ ${file}: ${err.message}`);
    }
  }

  console.log(`  [KNUT] ${loaded} commandes chargées`);
  return commands;
}

// =======================
// SESSION DE PAIRING
async function startPairingSession(number, KhostUserId = null) {
  if (pairingLocks.has(number)) return null;
  if (ACTIVE_BOTS >= MAX_BOTS) throw new Error('BOT_LIMIT_REACHED');

  pairingLocks.add(number);
  retryCount.set(number, retryCount.get(number) || 0);

  const SESSION_DIR = path.join(SESSIONS_BASE, number);
  await fs.ensureDir(SESSION_DIR);

  // Helpers isolés pour cette session
  const h = makeSessionHelpers(SESSION_DIR);

  // Initialiser config par défaut si absente
  if (!fs.existsSync(h.configPath)) {
    h.saveConfig({ prefix: '!', prefixMode: false, owners: [] });
  }

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await retry(
    () => fetchLatestBaileysVersion(),
    { attempts: 3, baseDelayMs: 500, maxDelayMs: 5000, timeoutMs: 15000, label: 'baileys_version' }
  );

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
    },
    logger:               pino({ level: 'silent' }),
    browser:              ['Ubuntu', 'Chrome', '20.0.04'],
    printQRInTerminal:    false,
    msgRetryCounterCache: new Map()
  });

  if (!GLOBAL_COMMANDS) GLOBAL_COMMANDS = await loadCommands();

  // Enregistrer ce bot avec tous ses helpers isolés
  bots.set(number, {
    sock,
    connected:    false,
    KhostUserId: KhostUserId,
    sessionDir:   SESSION_DIR,
    commands:     GLOBAL_COMMANDS,
    ...h    // getConfig, saveConfig, getOwners, getSudo, saveSudo, getGroupConfig, setGroupProtection, ...
  });

  sock.ev.on('creds.update', saveCreds);

  // ══════════════════════════════════════════
  // ÉTAPE 1 — CODE DE PAIRING KNUT1204
  // ══════════════════════════════════════════
  let pairingCode = null;
  if (!sock.authState.creds.registered) {
    await delay(1500);
    try {
      const raw   = await sock.requestPairingCode(number, 'KNUT1204');
      pairingCode = raw.match(/.{1,4}/g).join('-');
      console.log(`  [KNUT] 🔑 ${number}: ${pairingCode}`);
    } catch (err) {
      pairingLocks.delete(number);
      bots.delete(number);
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // ÉTAPE 2 — TIMEOUT
  // ══════════════════════════════════════════
  const autoClose = setTimeout(() => {
    if (!bots.get(number)?.connected) {
      try { sock.end(); } catch {}
      bots.delete(number);
      pairingLocks.delete(number);
      console.log(`  [KNUT] ⏱️ Timeout ${number}`);
    }
  }, PAIRING_TIMEOUT);

  // ══════════════════════════════════════════
  // ÉTAPE 3 — CONNEXION
  // On lit le LID depuis creds.json après connexion
  // ══════════════════════════════════════════
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      clearTimeout(autoClose);
      pairingLocks.delete(number);
      const bot = bots.get(number);
      if (bot && !bot.connected) {
        bot.connected = true;
        ACTIVE_BOTS++;
        retryCount.set(number, 0);
        markConnected(number);
        bot.heartbeatTimer = setInterval(() => heartbeat(number), 30_000);

        // Lire owner + LID depuis creds.json (source de vérité)
        // creds.json est écrit par saveCreds après connexion
        await delay(500); // laisser saveCreds écrire
        const { ownerNumber, ownerLid } = h.getCredsIdentity();

        // Mettre à jour config avec les owners réels lus depuis creds
        const cfg = h.getConfig();
        const ownersSet = new Set(cfg.owners || []);
        if (ownerNumber) ownersSet.add(ownerNumber);
        if (ownerLid)    ownersSet.add(ownerLid);
        cfg.owners = [...ownersSet];
        h.saveConfig(cfg);

        console.log(`  [KNUT] ✅ ${number} | owner: ${ownerNumber} | lid: ${ownerLid || 'N/A'}`);

        // ── Charger protections.js (antiMessage, antiLink, antiBot, autoVV, welcome, etc.) ──
        try {
          const { initProtections } = await import('./protections.js');
          initProtections(sock, ownerNumber);
          console.log(`  [KNUT] protections.js charge [${number}]`);
        } catch (e) {
          console.warn(`  [KNUT] protections.js erreur: ${e.message}`);
        }

        // ── Charger protections2.js ──
        // Initialise : audiorespons, autowrite, autorecording, autostatuslike,
        //              anti-delete groupes (2 modes), anti-delete IB
        try {
          const { initProtections: initP2 } = await import('./protections2.js');

          // Injecter le numero du bot dans process.env.NUMBER
          // pour que antiDeleteIB identifie le bot dans les conversations
          if (!process.env.NUMBER && ownerNumber) {
            process.env.NUMBER = ownerNumber;
          }

          const p2system = initP2(sock, ownerNumber);

          // Exposer le systeme de protection sur l'objet bot
          // pour que les commandes antidelete-groups.js / antidelete-ib.js
          // puissent interagir avec lui via msg._knut.protectionSystem
          const botEntry = bots.get(number);
          if (botEntry && p2system) {
            botEntry.protectionSystem = p2system;
          }

          console.log(`  [KNUT] protections2.js charge [${number}]`);
        } catch (e) {
          console.warn(`  [KNUT] protections2.js erreur: ${e.message}`);
        }

        // Notifier Khost
        try {
          const { default: fetch } = await import('node-fetch');
          await fetch(`http://localhost:${process.env.PORT || 3000}/api/bot/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, userId: bot.KhostUserId, botType: 'knutxmd' })
          });
        } catch {}

        // Message de bienvenue original KNUT — envoyé au propriétaire
        try {
          const ownerJid = `${ownerNumber}@s.whatsapp.net`;
          await sock.sendMessage(ownerJid, {
            image: { url: 'https://files.catbox.moe/8dheuf.jpg' },
            caption: [
              '*KNUT MDX ACTIVE*',
              `🥷🏾 Mode: ${cfg.prefixMode ? 'Prefix' : 'Without prefix'}`,
              `☢️ Commands: ${GLOBAL_COMMANDS.size}`,
              `🎵 Audio URL: ${cfg.audioUrl || 'https://files.catbox.moe/mej4f0.mp3'}`,
              '',
              `⚫ Type ${cfg.prefixMode ? (cfg.prefix || '!') : ''}menu`,
              `Thank you for choosing KNUT XMD. 🌌`,
              '',
              `👨‍💻 Developer Contact:`,
              `📞 +237 673 941 535 — Dev Knut`,
              '',
              `📢 Join the official community:`,
              `👉 https://whatsapp.com/channel/0029Vb75xwOADTOBVjSgJV0k`,
              '',
              `— of fluidity 🧠`,
              `— of speed ⚙️`,
              '',
              `🎯 You will find there:`,
              `• Exclusive modules and futuristic previews`,
              `• Direct contact with the creative sphere of KNUT`,
              '',
              `Thank you for writing this story with us.`
            ].join('\n')
          });
        } catch {}
      }
    }

    if (connection === 'close') {
      const status  = lastDisconnect?.error?.output?.statusCode;
      const retries = retryCount.get(number) || 0;
      const bot = bots.get(number);
      if (bot?.heartbeatTimer) clearInterval(bot.heartbeatTimer);
      if (bot?.connected) {
        bot.connected = false;
        ACTIVE_BOTS = Math.max(0, ACTIVE_BOTS - 1);
      }
      markDisconnected(number, status || 'connection_closed');

      if (status === DisconnectReason.loggedOut) {
        await removeSession(SESSION_DIR);
        bots.delete(number);
        pairingLocks.delete(number);
        retryCount.delete(number);
        clearSessionHealth(number);
        console.log(`  [KNUT] ❌ ${number} session invalidée/logout — nouveau pairing requis`);
      } else {
        const nextRetry = retries + 1;
        retryCount.set(number, nextRetry);
        markReconnect(number);
        const delayMs = Math.min(RECONNECT_MAX, RECONNECT_BASE * (2 ** Math.min(retries, 8))) + Math.floor(Math.random() * 1000);
        console.log(`  [KNUT] 🔁 Reconnexion ${number} (${nextRetry}/${MAX_RETRIES}, ${delayMs}ms)`);
        setTimeout(async () => {
          try { sock.end(); } catch {}
          bots.delete(number);
          pairingLocks.delete(number);
          try {
            await startPairingSession(number, KhostUserId);
          } catch (error) {
            console.error(`  [KNUT] reconnexion ${number}: ${sanitizeError(error)}`);
          }
        }, delayMs);
      }
    }
  });

  // ══════════════════════════════════════════
  // ÉTAPE 4 — MESSAGES
  // Chaque message est traité avec les données de la SESSION du bot
  // Signature KNUT : execute(sock, msg, args, from)
  // On injecte msg._knut = { owners, sudo, config, helpers... }
  // pour que les commandes aient accès à leurs données isolées
  // ══════════════════════════════════════════
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg?.message) return;

    const from    = msg.key.remoteJid;
    const isGroup = from?.endsWith('@g.us');
    const sender  = msg.key.fromMe ? sock.user?.id : (msg.key.participant || from);
    const senderNum = bare(sender);

    const bot = bots.get(number);
    if (!bot) return;
    const { commands } = bot;

    // Lire les données isolées de ce bot
    const owners = bot.getOwners();
    const sudo   = bot.getSudo();
    const cfg    = bot.getConfig();

    const isOwner = owners.includes(senderNum);
    const isSudo  = sudo.map(n => bare(n)).includes(senderNum);

    if (!isOwner && !isSudo) return;

    // Enregistrer groupe si c'est l'owner
    if (isGroup && isOwner) {
      const gData = bot.getGroups();
      if (!gData.groups[from]) {
        gData.groups[from] = { antiLink: false, antiSpam: false, antiBot: false };
        bot.saveGroups(gData);
      }
    }

    const text = pickText(unwrap(msg.message));
    if (!text) return;

    const prefix     = cfg.prefix     || '!';
    // prefixMode: true = avec préfixe, false = sans préfixe (défaut)
    const prefixMode = cfg.prefixMode === true;

    let cmdName = null;
    let args    = [];

    if (prefixMode) {
      // Mode AVEC préfixe — le message doit commencer par le préfixe
      if (!text.startsWith(prefix)) return;
      args    = text.slice(prefix.length).trim().split(/\s+/);
      cmdName = args.shift()?.toLowerCase();
    } else {
      // Mode SANS préfixe — le message ne doit PAS commencer par le préfixe
      args    = text.trim().split(/\s+/);
      cmdName = args.shift()?.toLowerCase();
      if (cmdName?.startsWith(prefix)) return;
    }

    if (!cmdName) return;
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    // Injecter le contexte isolé dans msg._knut
    // Les commandes qui font global.owners peuvent utiliser msg._knut.owners
    msg._knut = {
      owners,
      sudo,
      config:    cfg,
      sessionDir: bot.sessionDir,
      getConfig:          bot.getConfig,
      saveConfig:         bot.saveConfig,
      getSudo:            bot.getSudo,
      saveSudo:           bot.saveSudo,
      getGroupConfig:     bot.getGroupConfig,
      setGroupProtection: bot.setGroupProtection,
      isOwner,
      isSudo,
      prefix,
      prefixMode,  // true = avec préfixe, false = sans préfixe
      // Accès au système de protection2 pour les commandes antidelete, audiorespons, etc.
      protectionSystem: bot.protectionSystem || null
    };

    // Injecter aussi dans global pour compat commandes qui font global.owners
    // MAIS isolé par numéro de bot — on restaure après l'exécution
    const prevOwners      = global.owners;
    const prevPrefixMode  = global.isPrefixMode;
    const prevPrefix      = global.PREFIXE_COMMANDE;
    const prevSavePref    = global.saveModePrefix;
    // Réaction 🐺 KNUT
    try { await sock.sendMessage(from, { react: { text: '🐺', key: msg.key } }); } catch {}

    let releaseGlobal;
    const turn = new Promise(resolve => { releaseGlobal = resolve; });
    const previousTurn = globalExecution;
    globalExecution = globalExecution.then(() => turn);
    await previousTurn;
    global.owners         = owners;
    global.isPrefixMode   = prefixMode;
    global.PREFIXE_COMMANDE = prefix;
    global.saveModePrefix = (state) => {
      const c = bot.getConfig();
      c.prefixMode = state;
      bot.saveConfig(c);
    };
    try {
      await cmd.execute(sock, msg, args, from);
    } catch (err) {
      markCommandError(number, err);
      console.error(`  [KNUT] ❌ ${cmdName} [${number}]:`, sanitizeError(err));
      try {
        await sock.sendMessage(from, {
          text: `> Knut XMD: ❌ Erreur commande ${cmdName}`
        }, { quoted: msg });
      } catch {}
    } finally {
      global.owners           = prevOwners;
      global.isPrefixMode     = prevPrefixMode;
      global.PREFIXE_COMMANDE = prevPrefix;
      global.saveModePrefix   = prevSavePref;
      releaseGlobal();
    }
  });

  // ══════════════════════════════════════════
  // ÉTAPE 5 — WELCOME / BYE
  // ══════════════════════════════════════════
  sock.ev.on('group-participants.update', async ({ participants, action, id: groupId }) => {
    const bot = bots.get(number);
    if (!bot) return;
    const gc = bot.getGroupConfig(groupId);
    for (const userJid of participants) {
      const name = userJid.split('@')[0];
      let ppUrl = null;
      try { ppUrl = await sock.profilePictureUrl(userJid, 'image'); } catch {}
      if (action === 'add' && gc.welcome) {
        const t = `👋 Bienvenue @${name} !`;
        ppUrl
          ? await sock.sendMessage(groupId, { image: { url: ppUrl }, caption: t, mentions: [userJid] })
          : await sock.sendMessage(groupId, { text: t, mentions: [userJid] });
      }
      if (action === 'remove' && gc.bye) {
        const t = `👋 Au revoir @${name}`;
        ppUrl
          ? await sock.sendMessage(groupId, { image: { url: ppUrl }, caption: t, mentions: [userJid] })
          : await sock.sendMessage(groupId, { text: t, mentions: [userJid] });
      }
    }
  });

  return pairingCode;
}

// =======================
// ROUTES

// État public minimal : aucun numéro, token ou chemin de session n’est renvoyé.
router.get('/health', (req, res) => {
  const sessions = listSessionHealth();
  res.json({
    status: sessions.every(item => item.status !== 'failed') ? 'ok' : 'degraded',
    sessions: sessions.map(({ id, ...item }) => item),
    providers: publicProviderStatus()
  });
});

// GET /knutxmd/pair/code?number=237XXXXXXXX&userId=123
router.get('/code', async (req, res) => {
  try {
    let num = req.query.number;
    const userId = req.query.userId || null;
    if (!num) return res.status(400).json({ error: 'Numéro requis' });
    num = fmt(num);
    if (pairingLocks.has(num))
      return res.status(429).json({ error: 'Pairing déjà en cours pour ce numéro' });
    const code = await startPairingSession(num, userId);
    res.json(code ? { code } : { status: 'Ce numéro est déjà connecté' });
  } catch (err) {
    res.status(500).json({ error: 'pairing_failed' });
  }
});

// POST /knutxmd/pair/config  { number, prefix, prefixMode }
router.post('/config', async (req, res) => {
  try {
    let { number, prefix, prefixMode } = req.body;
    if (!number) return res.status(400).json({ error: 'Numéro requis' });
    number = fmt(number);

    const SESSION_DIR = path.join(SESSIONS_BASE, number);
    await fs.ensureDir(SESSION_DIR);
    const h   = makeSessionHelpers(SESSION_DIR);
    const cfg = h.getConfig();

    if (prefix !== undefined) {
      const normalizedPrefix = String(prefix).trim().slice(0, 4);
      if (normalizedPrefix && !/^[!#./_-]+$/.test(normalizedPrefix)) {
        return res.status(400).json({ error: 'prefix_invalid' });
      }
      if (normalizedPrefix) cfg.prefix = normalizedPrefix;
    }
    if (prefixMode !== undefined) cfg.prefixMode = prefixMode === true || prefixMode === 'true';
    h.saveConfig(cfg);

    // Mettre à jour si bot actif
    if (bots.has(number)) {
      bots.get(number).getConfig = h.getConfig; // refresh
    }

    res.json({ status: `✅ Config sauvegardée`, prefix: cfg.prefix, prefixMode: cfg.prefixMode });
  } catch (err) {
    res.status(500).json({ error: 'config_save_failed' });
  }
});

// =======================
// EXPORT
export default router;
