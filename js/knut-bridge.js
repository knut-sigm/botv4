/**
 * knut-bridge.js
 * Module pont — remplace les imports depuis ../index.js dans les commandes KNUT
 * Expose les fonctions utilitaires sans dépendre de la console ou de readline
 */

import fs   from 'fs-extra';
import path from 'path';

// Chemins relatifs à la racine du projet (process.cwd())
const SUDO_FILE       = './json/sudo.json';
const CONFIG_FILE     = './config.json';
const GROUP_FILE      = './json/group.json';
const JID_FILE        = './json/jid.json';
const RESPONS_FILE    = './json/respons.json';
const MODEPREFIX_FILE = './json/modeprefix.json';

// ── Sudo ──────────────────────────────────────────
export const loadSudo = () => {
  if (!fs.existsSync(SUDO_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SUDO_FILE, 'utf8')); } catch { return []; }
};

export const saveSudo = (list) => {
  fs.writeFileSync(SUDO_FILE, JSON.stringify(list, null, 2));
};

// ── Config ────────────────────────────────────────
export const getConfig = () => {
  if (!fs.existsSync(CONFIG_FILE)) return { users: {}, owners: [] };
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch { return { users: {}, owners: [] }; }
};

export const saveConfig = (cfg) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
};

// ── Mode prefix ───────────────────────────────────
export const loadModePrefix = () => {
  try {
    if (!fs.existsSync(MODEPREFIX_FILE)) return true;
    return JSON.parse(fs.readFileSync(MODEPREFIX_FILE, 'utf8')).modeprefix ?? true;
  } catch { return true; }
};

export const saveModePrefix = (state) => {
  fs.writeFileSync(MODEPREFIX_FILE, JSON.stringify({ modeprefix: state }, null, 2));
  if (typeof global !== 'undefined') global.isPrefixMode = state;
};

// ── Owners ────────────────────────────────────────
export const getOwners = () => {
  return global.owners || getConfig().owners || [];
};

export const getBareNumber = (input) => {
  if (!input) return '';
  return String(input).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
};

// ── isGroupAdmin ─────────────────────────────────
export const isGroupAdmin = async (sock, groupJid, userJid) => {
  try {
    const meta = await sock.groupMetadata(groupJid);
    return meta.participants.some(p => p.id === userJid && p.admin);
  } catch { return false; }
};

// ── JID / LID ─────────────────────────────────────
export const saveOwnerLid = (lid) => {
  try {
    const data = fs.existsSync(JID_FILE) ? JSON.parse(fs.readFileSync(JID_FILE, 'utf8')) : {};
    data.ownerLid  = lid;
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(JID_FILE, JSON.stringify(data, null, 2));
  } catch {}
};

export const readOwnerLid = () => {
  try {
    if (!fs.existsSync(JID_FILE)) return null;
    return JSON.parse(fs.readFileSync(JID_FILE, 'utf8')).ownerLid || null;
  } catch { return null; }
};

// ── Respons (audio URL) ───────────────────────────
export const readAudioUrl = () => {
  try {
    if (!fs.existsSync(RESPONS_FILE)) return 'https://files.catbox.moe/mej4f0.mp3';
    return JSON.parse(fs.readFileSync(RESPONS_FILE, 'utf8')).audioUrl || 'https://files.catbox.moe/mej4f0.mp3';
  } catch { return 'https://files.catbox.moe/mej4f0.mp3'; }
};

// ── unwrapMessage / pickText ──────────────────────
export const unwrapMessage = (m) =>
  m?.ephemeralMessage?.message ||
  m?.viewOnceMessageV2?.message ||
  m?.documentWithCaptionMessage?.message ||
  m?.viewOnceMessage?.message || m;

export const pickText = (m) => {
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

// ── registerGroupOnOwnerMessage ───────────────────
export const registerGroupOnOwnerMessage = (groupJid, sock) => {
  if (!fs.existsSync(GROUP_FILE)) return;
  try {
    const data = JSON.parse(fs.readFileSync(GROUP_FILE, 'utf8'));
    if (data.groups?.[groupJid]) return;
    if (!data.groups) data.groups = {};
    data.groups[groupJid] = { antiLink: false, antiSpam: false, antiBot: false };
    fs.writeFileSync(GROUP_FILE, JSON.stringify(data, null, 2));
  } catch {}
};

// ── default export pour compat ────────────────────
export default {
  loadSudo, saveSudo, getConfig, saveConfig,
  loadModePrefix, saveModePrefix, getOwners,
  getBareNumber, isGroupAdmin,
  saveOwnerLid, readOwnerLid, readAudioUrl,
  unwrapMessage, pickText, registerGroupOnOwnerMessage
};
