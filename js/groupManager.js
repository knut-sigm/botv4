import path from "path";
import { fileURLToPath } from "url";
import { readJson, writeJsonAtomic } from "./secure-store.js";

const KNUT_ROOT = path.dirname(fileURLToPath(import.meta.url));
const GROUP_CONFIG_PATH = path.join(KNUT_ROOT, "group.json");
let saveTimer = null;

let groupConfig = {};

const loadGroupConfig = () => {
  const loaded = readJson(GROUP_CONFIG_PATH, { groups: {} });
  groupConfig = loaded && typeof loaded === "object" && loaded.groups && typeof loaded.groups === "object"
    ? loaded
    : { groups: {} };
};

const saveGroupConfig = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { writeJsonAtomic(GROUP_CONFIG_PATH, groupConfig); }
    catch (err) { console.error("Erreur écriture group.json:", err.message); }
  }, 75);
};

// Charger au démarrage
loadGroupConfig();

// === GET / SET PAR GROUPE ===
export const getGroupProtections = (groupJid) => {
  return groupConfig.groups[groupJid] || {};
};

export const setGroupProtection = (groupJid, protection, value) => {
  if (!groupConfig.groups[groupJid]) {
    groupConfig.groups[groupJid] = {};
  }
  groupConfig.groups[groupJid][protection] = value;
  saveGroupConfig();
};

export const toggleGroupProtection = (groupJid, protection) => {
  const current = getGroupProtections(groupJid)[protection] ?? false;
  setGroupProtection(groupJid, protection, !current);
  return !current;
};


export const registerGroupOnOwnerMessage = (groupJid, sock) => {
  if (groupConfig.groups[groupJid]) return; 


  const defaultProtections = {
    antiLink: false,
    antiPromote1: false,
    antiDemote: false,
    antiBot: false,
    antiSpam: false,
    antiSticker: false,
    antiVoice: false,
    antiVideo: false,
    antiMessage: false,
    knuta: false,              
    autoKnutChat: false,       
    autoReact: false,
    statusLike: false,
    warnAdmin: false,
    alertAdmin: false,
    respons: true,
    autoVV2: false,
    welcome: true,
    goodbye: true
  };

  groupConfig.groups[groupJid] = defaultProtections;
  saveGroupConfig();

 
  console.log(`[GROUP MANAGER] Nouveau groupe détecté : ${groupJid.split("@")[0]}`);
};


export default {
  getGroupProtections,
  setGroupProtection,
  toggleGroupProtection,
  registerGroupOnOwnerMessage
};