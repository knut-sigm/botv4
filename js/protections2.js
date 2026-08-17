import chalk from "chalk";
import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "baileys";
import axios from "axios";
import FormData from "form-data";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =================== CONFIGURATION ===================
const CONFIG = {
  AUDIO_FILE: "./respon.mp3",
  DEFAULT_TYPING_DURATION: 10000,
  DEFAULT_RECORDING_DURATION: 10000,
  SIMULATION_COOLDOWN: 30000,
  DEFAULT_RESPONSE_DELAY: 1000,
  MAX_AUDIO_SIZE: 16 * 1024 * 1024,
  ANTI_DELETE_GROUPES: {
    MAX_MESSAGES: 1000,
    ROTATION_ENABLED: true,
    DB_FILE: "./json/antidelete-groupes.json",
    MODE: "simple" // "simple" ou "owner"
  },
  ANTI_DELETE_IB: {
    MAX_MESSAGES: 500,
    ROTATION_ENABLED: true,
    DB_FILE: "./json/antidelete-ib.json"
  },
  MEDIA_UPLOAD: {
    SERVICE: "catbox.moe",
    UPLOAD_URL: "https://catbox.moe/user/api.php",
    TEMP_DIR: "./bots/knutxmd/temp"
  }
};

// =================== FONCTIONS UTILITAIRES ===================
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour uploader un média
async function uploadMediaToCatbox(buffer, mediaType) {
  try {
    if (!fs.existsSync(CONFIG.MEDIA_UPLOAD.TEMP_DIR)) {
      fs.mkdirSync(CONFIG.MEDIA_UPLOAD.TEMP_DIR, { recursive: true });
    }
    
    const extensions = {
      image: "jpg",
      video: "mp4",
      audio: "mp3",
      document: "pdf",
      sticker: "webp"
    };
    
    const ext = extensions[mediaType] || "bin";
    const tempFilePath = path.join(
      CONFIG.MEDIA_UPLOAD.TEMP_DIR,
      `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`
    );
    
    fs.writeFileSync(tempFilePath, buffer);
    
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempFilePath));
    
    const response = await axios.post(CONFIG.MEDIA_UPLOAD.UPLOAD_URL, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    fs.unlinkSync(tempFilePath);
    
    return response.data.trim();
  } catch (error) {
    console.error(chalk.red("❌ Erreur upload:"), error.message);
    return null;
  }
}

// =================== SYSTÈME DE PROTECTION PRINCIPAL ===================
class ProtectionSystem {
  constructor() {
    this.isResponsActive = true;
    this.isAutoWriteActive = true;
    this.isAutoRecordingActive = false;
    this.isAutoStatusLikeActive = false;

    this.lastSimulationTime = new Map();
    this.sock = null;
    this.audioFilePath = path.resolve(process.cwd(), CONFIG.AUDIO_FILE);
    
    this.stats = {
      totalMentions: 0,
      totalAudiosSent: 0,
      totalSimulations: 0,
      totalStatusLikes: 0,
      errors: 0
    };
  }

  init(sock) {
    this.sock = sock;
    this._checkAudioFile();
    this._setupMessageListener();
    
    console.log(chalk.green(`✅ Protection initialisé`));
    return this.getExports();
  }

  _checkAudioFile() {
    if (!fs.existsSync(this.audioFilePath)) {
      console.log(chalk.yellow(`⚠️  "./respon.mp3" non trouvé`));
      return false;
    }
    
    try {
      const stats = fs.statSync(this.audioFilePath);
      if (stats.size === 0) {
        console.log(chalk.red(`❌ Fichier audio vide`));
        return false;
      }
      
      if (stats.size > CONFIG.MAX_AUDIO_SIZE) {
        console.log(chalk.red(`❌ Fichier trop volumineux (max 16MB)`));
        return false;
      }
      
      console.log(chalk.green(`✅ Fichier audio OK (${(stats.size / 1024).toFixed(2)}KB)`));
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Erreur fichier`), error);
      return false;
    }
  }

  getOwnerLid() {
    try {
      if (!fs.existsSync("./json/jid.json")) return null;
      const rawData = fs.readFileSync("./json/jid.json", "utf-8");
      const jidData = JSON.parse(rawData);
      return jidData?.ownerLid || null;
    } catch {
      return null;
    }
  }

  getOwnerJid() {
    const ownerLid = this.getOwnerLid();
    return ownerLid ? `${ownerLid}@s.whatsapp.net` : null;
  }

  getBotNumber() {
    return process.env.NUMBER || null;
  }

  getMessageText(msg) {
    if (!msg?.message) return "";
    
    const message = msg.message;
    return message.conversation || 
           message.extendedTextMessage?.text ||
           message.imageMessage?.caption ||
           message.videoMessage?.caption ||
           message.documentMessage?.caption ||
           "";
  }

  isMentioningOwner(msg) {
    try {
      const ownerLid = this.getOwnerLid();
      if (!ownerLid) return false;
      
      const text = this.getMessageText(msg);
      const ownerJid = `${ownerLid}@s.whatsapp.net`;
      
      if (text && text.includes(`@${ownerLid}`)) return true;
      
      const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentionedJids.includes(ownerJid)) return true;
      
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (quotedMsg === ownerJid) return true;
      
      return false;
    } catch {
      return false;
    }
  }

  async sendAudioResponse(msg, from) {
    if (!this.sock) return;
    
    this.stats.totalMentions++;
    
    try {
      await delay(CONFIG.DEFAULT_RESPONSE_DELAY);
      
      if (!fs.existsSync(this.audioFilePath)) {
        throw new Error("Fichier audio non trouvé");
      }
      
      const audioBuffer = fs.readFileSync(this.audioFilePath);
      
      await this.sock.sendMessage(from, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: msg });
      
      this.stats.totalAudiosSent++;
      console.log(chalk.green(`✅ Audio envoyé à ${from}`));
      
    } catch (error) {
      this.stats.errors++;
      console.error(chalk.red(`❌ Erreur audio`), error);
    }
  }

  async simulateTyping(chatJid, duration = CONFIG.DEFAULT_TYPING_DURATION) {
    if (!this.sock || !chatJid) return;
    try {
      await this.sock.sendPresenceUpdate("composing", chatJid);
      await delay(duration);
      await this.sock.sendPresenceUpdate("paused", chatJid);
      this.stats.totalSimulations++;
    } catch {}
  }

  async simulateRecording(chatJid, duration = CONFIG.DEFAULT_RECORDING_DURATION) {
    if (!this.sock || !chatJid) return;
    try {
      await this.sock.sendPresenceUpdate("recording", chatJid);
      await delay(duration);
      await this.sock.sendPresenceUpdate("paused", chatJid);
      this.stats.totalSimulations++;
    } catch {}
  }

  async autoLikeStatus(msg) {
    if (!this.isAutoStatusLikeActive) return;
    if (msg.key?.remoteJid !== "status@broadcast") return;
    if (msg.key?.fromMe) return;

    try {
      const posterJid = msg.key?.participant;
      if (!posterJid) return;

      await this.sock.sendMessage(posterJid, {
        react: {
          text: '💚',
          key: msg.key
        }
      });

      this.stats.totalStatusLikes++;
      console.log(chalk.green(`💚 Statut liké (${this.stats.totalStatusLikes})`));
    } catch (error) {
      console.error(chalk.red(`❌ Échec like statut`), error.message);
    }
  }

  toggleAutoStatusLike() {
    this.isAutoStatusLikeActive = !this.isAutoStatusLikeActive;
    console.log(chalk.green(`💚 Auto like statuts : ${this.isAutoStatusLikeActive ? 'ON' : 'OFF'}`));
    return this.isAutoStatusLikeActive;
  }

  setAutoStatusLike(status) {
    this.isAutoStatusLikeActive = Boolean(status);
    console.log(chalk.green(`💚 Auto like statuts : ${this.isAutoStatusLikeActive ? 'ON' : 'OFF'}`));
    return this.isAutoStatusLikeActive;
  }

  _setupMessageListener() {
    this.sock.ev.on("messages.upsert", async ({ messages }) => {
      if (!messages || messages.length === 0) return;
      
      const msg = messages[0];
      if (!msg.key || !msg.key.remoteJid || msg.key.fromMe) return;
      
      const from = msg.key.remoteJid;
      const now = Date.now();
      
      // Auto write (typing simulation)
      if (this.isAutoWriteActive) {
        const lastSim = this.lastSimulationTime.get(`${from}-typing`);
        if (!lastSim || (now - lastSim) > CONFIG.SIMULATION_COOLDOWN) {
          this.simulateTyping(from).catch(() => {});
          this.lastSimulationTime.set(`${from}-typing`, now);
        }
      }
      
      // Auto recording simulation
      if (this.isAutoRecordingActive) {
        const lastSim = this.lastSimulationTime.get(`${from}-recording`);
        if (!lastSim || (now - lastSim) > CONFIG.SIMULATION_COOLDOWN) {
          this.simulateRecording(from).catch(() => {});
          this.lastSimulationTime.set(`${from}-recording`, now);
        }
      }
      
      // Réponse audio quand on mentionne le owner
      if (this.isResponsActive && this.isMentioningOwner(msg)) {
        this.sendAudioResponse(msg, from).catch(() => {});
      }

      // Auto like sur les statuts
      await this.autoLikeStatus(msg);
    });
  }

  toggleRespons() {
    this.isResponsActive = !this.isResponsActive;
    console.log(chalk.yellow(`🎵 Audiorespons: ${this.isResponsActive ? 'ON' : 'OFF'}`));
    return this.isResponsActive;
  }
  
  setResponsStatus(status) {
    this.isResponsActive = Boolean(status);
    console.log(chalk.yellow(`🎵 Audiorespons: ${this.isResponsActive ? 'ON' : 'OFF'}`));
    return this.isResponsActive;
  }
  
  toggleAutoWrite() {
    this.isAutoWriteActive = !this.isAutoWriteActive;
    console.log(chalk.magenta(`⌨️  Autowrite: ${this.isAutoWriteActive ? 'ON' : 'OFF'}`));
    return this.isAutoWriteActive;
  }
  
  setAutoWriteStatus(status) {
    this.isAutoWriteActive = Boolean(status);
    console.log(chalk.magenta(`⌨️  Autowrite: ${this.isAutoWriteActive ? 'ON' : 'OFF'}`));
    return this.isAutoWriteActive;
  }
  
  toggleAutoRecording() {
    this.isAutoRecordingActive = !this.isAutoRecordingActive;
    console.log(chalk.cyan(`🎙️  Autorecording: ${this.isAutoRecordingActive ? 'ON' : 'OFF'}`));
    return this.isAutoRecordingActive;
  }
  
  setAutoRecordingStatus(status) {
    this.isAutoRecordingActive = Boolean(status);
    console.log(chalk.cyan(`🎙️  Autorecording: ${this.isAutoRecordingActive ? 'ON' : 'OFF'}`));
    return this.isAutoRecordingActive;
  }
  
  getStats() {
    return {
      ...this.stats,
      status: {
        audiorespons: this.isResponsActive,
        autowrite: this.isAutoWriteActive,
        autorecording: this.isAutoRecordingActive,
        autostatuslike: this.isAutoStatusLikeActive
      },
      ownerLid: this.getOwnerLid(),
      ownerJid: this.getOwnerJid(),
      botNumber: this.getBotNumber()
    };
  }

  getExports() {
    return {
      toggleRespons: () => this.toggleRespons(),
      setResponsStatus: (status) => this.setResponsStatus(status),
      
      toggleAutoWrite: () => this.toggleAutoWrite(),
      setAutoWriteStatus: (status) => this.setAutoWriteStatus(status),
      
      toggleAutoRecording: () => this.toggleAutoRecording(),
      setAutoRecordingStatus: (status) => this.setAutoRecordingStatus(status),
      
      toggleAutoStatusLike: () => this.toggleAutoStatusLike(),
      setAutoStatusLike: (status) => this.setAutoStatusLike(status),
      
      simulateTyping: (jid, duration) => this.simulateTyping(jid, duration),
      simulateRecording: (jid, duration) => this.simulateRecording(jid, duration),
      
      getStats: () => this.getStats(),
      
      checkAudioFile: () => this._checkAudioFile(),
      sendTestAudio: async (jid) => {
        const testMsg = { key: { remoteJid: jid } };
        return await this.sendAudioResponse(testMsg, jid);
      }
    };
  }
}

// =================== SYSTÈME ANTI-DELETE GROUPES ===================
class AntiDeleteGroupes {
  constructor() {
    this.messagesDB = new Map();
    this.mediaDB = new Map();
    this.dbFilePath = CONFIG.ANTI_DELETE_GROUPES.DB_FILE;
    this.isEnabled = false;
    this.mode = CONFIG.ANTI_DELETE_GROUPES.MODE; // "simple" ou "owner"
    this.rotationCount = 0;
    this.sock = null;
    this.ownerJid = null;
    this.initializeDB();
  }

  initializeDB() {
    try {
      if (!fs.existsSync(this.dbFilePath)) {
        fs.writeFileSync(this.dbFilePath, JSON.stringify({ messages: {}, media: {}, config: { mode: this.mode } }, null, 2));
        console.log(chalk.green(`✅ Anti-delete Groupes DB créée: ${this.dbFilePath}`));
      } else {
        // Charger la config existante
        try {
          const db = JSON.parse(fs.readFileSync(this.dbFilePath, 'utf-8'));
          if (db.config && db.config.mode) {
            this.mode = db.config.mode;
          }
        } catch (e) {}
        console.log(chalk.blue(`📁 Anti-delete Groupes DB chargée: ${this.dbFilePath}`));
      }
    } catch (error) {
      console.error(chalk.red("❌ Erreur création DB groupes:"), error);
    }
  }

  setSock(sock) {
    this.sock = sock;
  }

  setOwnerJid(jid) {
    this.ownerJid = jid;
  }

  setMode(mode) {
    if (mode === "simple" || mode === "owner") {
      this.mode = mode;
      
      // Sauvegarder le mode dans la DB
      try {
        const db = this.loadDB();
        db.config = db.config || {};
        db.config.mode = mode;
        fs.writeFileSync(this.dbFilePath, JSON.stringify(db, null, 2));
      } catch (e) {}
      
      console.log(chalk.yellow(`👥 Mode anti-delete groupes: ${mode === "simple" ? "Simple (dans le groupe)" : "Owner (dans l'IB du owner)"}`));
      return true;
    }
    return false;
  }

  getMode() {
    return this.mode;
  }

  checkAndRotate() {
    if (!CONFIG.ANTI_DELETE_GROUPES.ROTATION_ENABLED) return false;
    
    try {
      const dbContent = this.loadDB();
      const total = Object.keys(dbContent.messages || {}).length;
      if (total >= CONFIG.ANTI_DELETE_GROUPES.MAX_MESSAGES) {
        this.performRotation();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  performRotation() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const backup = `./antidelete-groupes_backup_${this.rotationCount}.json`;
        fs.copyFileSync(this.dbFilePath, backup);
        console.log(chalk.yellow(`💾 Backup groupes créé: ${backup}`));
      }
      
      const newDB = { messages: {}, media: {}, config: { mode: this.mode } };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(newDB, null, 2), 'utf-8');
      
      this.messagesDB.clear();
      this.mediaDB.clear();
      this.rotationCount++;
      
      console.log(chalk.yellow(`🔄 DB groupes vidée après ${CONFIG.ANTI_DELETE_GROUPES.MAX_MESSAGES} messages`));
      return true;
    } catch (error) {
      console.error(chalk.red("❌ Erreur rotation DB groupes:"), error);
      return false;
    }
  }

  setEnabled(status) {
    this.isEnabled = Boolean(status);
    console.log(chalk.yellow(`👥 Anti-delete Groupes: ${this.isEnabled ? 'ON' : 'OFF'} (Mode: ${this.mode})`));
    return this.isEnabled;
  }

  toggleEnabled() {
    return this.setEnabled(!this.isEnabled);
  }

  extractMessageContent(msg) {
    if (!msg?.message) return { content: "", mediaType: null, pushName: msg.pushName || "Inconnu" };

    const m = msg.message;
    let content = "";
    let mediaType = null;

    if (m.conversation) content = m.conversation;
    else if (m.extendedTextMessage) content = m.extendedTextMessage.text || "";
    else if (m.imageMessage) { content = m.imageMessage.caption || "[Image]"; mediaType = "image"; }
    else if (m.videoMessage) { content = m.videoMessage.caption || "[Vidéo]"; mediaType = "video"; }
    else if (m.audioMessage) { content = "[Audio]"; mediaType = "audio"; }
    else if (m.documentMessage) content = m.documentMessage.caption || m.documentMessage.fileName || "[Document]";
    else if (m.stickerMessage) content = "[Sticker]";
    else if (m.contactsArrayMessage) content = "[Contact]";
    else if (m.locationMessage) content = "[Localisation]";
    else if (m.liveLocationMessage) content = "[Localisation en direct]";

    return { content, mediaType, pushName: msg.pushName || "Inconnu" };
  }

  async downloadAndUploadMedia(msg, mediaType) {
    try {
      let mediaMsg;
      let streamType = mediaType;
      
      switch (mediaType) {
        case "image": 
          mediaMsg = msg.message?.imageMessage; 
          break;
        case "video": 
          mediaMsg = msg.message?.videoMessage; 
          break;
        case "audio": 
          mediaMsg = msg.message?.audioMessage; 
          streamType = "audio";
          break;
        case "document":
          mediaMsg = msg.message?.documentMessage;
          streamType = "document";
          break;
        case "sticker":
          mediaMsg = msg.message?.stickerMessage;
          streamType = "sticker";
          break;
        default: 
          return null;
      }
      
      if (!mediaMsg) return null;

      const stream = await downloadContentFromMessage(mediaMsg, streamType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const url = await uploadMediaToCatbox(buffer, mediaType);
      if (url) console.log(chalk.green(`📎 Média groupe uploadé → ${url}`));
      return url;
    } catch (err) {
      console.error(chalk.red(`❌ Erreur download/upload média groupe`), err.message);
      return null;
    }
  }

  async storeMessage(msg) {
    try {
      if (!msg?.key?.id || !msg.key.remoteJid) return null;
      
      // Ne stocker que les messages de groupe
      if (!msg.key.remoteJid.endsWith('@g.us')) return null;
      
      // Ne pas stocker les messages du bot
      if (msg.key.fromMe) return null;
      
      this.checkAndRotate();

      const id = msg.key.id;
      const { content, mediaType, pushName } = this.extractMessageContent(msg);
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const groupJid = msg.key.remoteJid;

      let mediaUrl = null;
      if (mediaType && ["image", "video", "audio", "document", "sticker"].includes(mediaType)) {
        mediaUrl = await this.downloadAndUploadMedia(msg, mediaType);
      }

      const data = {
        id,
        content,
        pushName, // Le nom WhatsApp de l'expéditeur
        senderJid,
        groupJid,
        mediaType,
        mediaUrl,
        timestamp: msg.messageTimestamp || Math.floor(Date.now() / 1000)
      };

      this.messagesDB.set(id, data);

      const db = this.loadDB();
      db.messages[id] = { 
        content, 
        pushName, // Stocker le pushName
        senderJid,
        groupJid,
        mediaType,
        timestamp: data.timestamp
      };
      
      if (mediaUrl) db.media[id] = mediaUrl;

      fs.writeFileSync(this.dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
      return data;
    } catch (err) {
      console.error(chalk.red("❌ Erreur stockage message groupe:"), err);
      return null;
    }
  }

  loadDB() {
    try {
      if (!fs.existsSync(this.dbFilePath)) return { messages: {}, media: {}, config: { mode: this.mode } };
      const data = JSON.parse(fs.readFileSync(this.dbFilePath, 'utf-8'));
      return data;
    } catch {
      return { messages: {}, media: {}, config: { mode: this.mode } };
    }
  }

  findMessage(id) {
    if (this.messagesDB.has(id)) return this.messagesDB.get(id);
    
    const db = this.loadDB();
    const msg = db.messages[id];
    if (!msg) return null;
    
    return {
      ...msg,
      id,
      mediaUrl: db.media[id] || null,
    };
  }

  removeMessage(id) {
    try {
      this.messagesDB.delete(id);
      this.mediaDB.delete(id);
      
      const db = this.loadDB();
      if (db.messages[id]) {
        delete db.messages[id];
        delete db.media[id];
        fs.writeFileSync(this.dbFilePath, JSON.stringify(db, null, 2));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  detectDeletedMessage(message) {
    const proto = message?.message?.protocolMessage;
    if (!proto || proto.type !== 0) return { isDeleted: false };
    
    return {
      isDeleted: true,
      deletedMessageId: proto.key?.id,
      chatId: proto.key?.remoteJid
    };
  }

  async resendDeletedMessage(sock, deletedId, chatId) {
    try {
      const data = this.findMessage(deletedId);
      if (!data) {
        console.log(chalk.yellow(`⚠️ Message groupe ${deletedId} non trouvé`));
        return false;
      }

      const time = new Date(data.timestamp * 1000).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const txt = `╭═══❰ *ANTI-DELETE GROUPE* ❱═══╮\n` +
                  `┃\n` +
                  `┃ 👤 *Expéditeur :* ${data.pushName || 'Inconnu'}\n` +
                  `┃ 📱 *Numéro :* ${data.senderJid.split('@')[0]}\n` +
                  `┃ 📅 *Date :* ${time}\n` +
                  `┃ 🌐 *Mode :* ${this.mode === "simple" ? "Simple (groupe)" : "Owner (IB owner)"}\n` +
                  `┃\n` +
                  `┃ 📝 *Message supprimé :*\n` +
                  `┃ ${data.content || '[Message vide]'}\n` +
                  `┃\n` +
                  `╰═══════════════════╯`;

      // Déterminer où envoyer le message selon le mode
      const targetChat = this.mode === "simple" ? chatId : this.ownerJid;
      
      if (!targetChat) {
        console.log(chalk.red(`❌ Impossible de restaurer: mode ${this.mode} mais destination non définie`));
        return false;
      }

      // Renvoyer le message
      if (data.mediaUrl && data.mediaType) {
        const opts = { caption: txt };
        
        switch (data.mediaType) {
          case "image":
            opts.image = { url: data.mediaUrl };
            break;
          case "video":
            opts.video = { url: data.mediaUrl };
            break;
          case "audio":
            opts.audio = { url: data.mediaUrl };
            opts.mimetype = 'audio/mpeg';
            opts.ptt = false;
            break;
          case "document":
            opts.document = { url: data.mediaUrl };
            opts.mimetype = 'application/octet-stream';
            opts.fileName = `document_${Date.now()}.pdf`;
            break;
          case "sticker":
            opts.sticker = { url: data.mediaUrl };
            break;
        }
        
        await sock.sendMessage(targetChat, opts);
        console.log(chalk.green(`✅ Message groupe restauré dans ${this.mode === "simple" ? "le groupe" : "l'IB du owner"}`));
      } else {
        await sock.sendMessage(targetChat, { text: txt });
        console.log(chalk.green(`✅ Message groupe restauré (texte) dans ${this.mode === "simple" ? "le groupe" : "l'IB du owner"}`));
      }

      this.removeMessage(deletedId);
      return true;
    } catch (err) {
      console.error(chalk.red("❌ Erreur resend deleted msg groupe:"), err);
      return false;
    }
  }

  getStats() {
    const db = this.loadDB();
    
    return {
      totalMessages: Object.keys(db.messages || {}).length,
      totalMedia: Object.keys(db.media || {}).length,
      isEnabled: this.isEnabled,
      mode: this.mode,
      maxMessages: CONFIG.ANTI_DELETE_GROUPES.MAX_MESSAGES,
      rotationEnabled: CONFIG.ANTI_DELETE_GROUPES.ROTATION_ENABLED,
      totalRotations: this.rotationCount
    };
  }

  clearDB() {
    try {
      const config = { mode: this.mode };
      fs.writeFileSync(this.dbFilePath, JSON.stringify({ messages: {}, media: {}, config }, null, 2));
      this.messagesDB.clear();
      this.mediaDB.clear();
      console.log(chalk.green("✅ Base anti-delete groupes vidée"));
      return true;
    } catch (err) {
      console.error("❌ Erreur clear DB groupes:", err);
      return false;
    }
  }
  
  viewLastMessages(limit = 10) {
    const db = this.loadDB();
    const messages = Object.entries(db.messages || {})
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limit);
      
    return messages;
  }
}

// =================== SYSTÈME ANTI-DELETE IB ===================
class AntiDeleteIB {
  constructor() {
    this.messagesDB = new Map();
    this.mediaDB = new Map();
    this.dbFilePath = CONFIG.ANTI_DELETE_IB.DB_FILE;
    this.isEnabled = false;
    this.rotationCount = 0;
    this.sock = null;
    this.botNumber = null;
    this.initializeDB();
  }

  initializeDB() {
    try {
      if (!fs.existsSync(this.dbFilePath)) {
        fs.writeFileSync(this.dbFilePath, JSON.stringify({ messages: {}, media: {} }, null, 2));
        console.log(chalk.green(`✅ Anti-delete IB DB créée: ${this.dbFilePath}`));
      } else {
        console.log(chalk.blue(`📁 Anti-delete IB DB chargée: ${this.dbFilePath}`));
      }
    } catch (error) {
      console.error(chalk.red("❌ Erreur création DB IB:"), error);
    }
  }

  setSock(sock) {
    this.sock = sock;
  }

  setBotNumber(number) {
    this.botNumber = number;
  }

  checkAndRotate() {
    if (!CONFIG.ANTI_DELETE_IB.ROTATION_ENABLED) return false;
    
    try {
      const dbContent = this.loadDB();
      const total = Object.keys(dbContent.messages || {}).length;
      if (total >= CONFIG.ANTI_DELETE_IB.MAX_MESSAGES) {
        this.performRotation();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  performRotation() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const backup = `./antidelete-ib_backup_${this.rotationCount}.json`;
        fs.copyFileSync(this.dbFilePath, backup);
        console.log(chalk.yellow(`💾 Backup IB créé: ${backup}`));
      }
      
      const newDB = { messages: {}, media: {} };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(newDB, null, 2), 'utf-8');
      
      this.messagesDB.clear();
      this.mediaDB.clear();
      this.rotationCount++;
      
      console.log(chalk.yellow(`🔄 DB IB vidée après ${CONFIG.ANTI_DELETE_IB.MAX_MESSAGES} messages`));
      return true;
    } catch (error) {
      console.error(chalk.red("❌ Erreur rotation DB IB:"), error);
      return false;
    }
  }

  setEnabled(status) {
    this.isEnabled = Boolean(status);
    console.log(chalk.cyan(`💬 Anti-delete IB: ${this.isEnabled ? 'ON' : 'OFF'}`));
    return this.isEnabled;
  }

  toggleEnabled() {
    return this.setEnabled(!this.isEnabled);
  }

  extractMessageContent(msg) {
    if (!msg?.message) return { content: "", mediaType: null, pushName: msg.pushName || "Inconnu" };

    const m = msg.message;
    let content = "";
    let mediaType = null;

    if (m.conversation) content = m.conversation;
    else if (m.extendedTextMessage) content = m.extendedTextMessage.text || "";
    else if (m.imageMessage) { content = m.imageMessage.caption || "[Image]"; mediaType = "image"; }
    else if (m.videoMessage) { content = m.videoMessage.caption || "[Vidéo]"; mediaType = "video"; }
    else if (m.audioMessage) { content = "[Audio]"; mediaType = "audio"; }
    else if (m.documentMessage) content = m.documentMessage.caption || m.documentMessage.fileName || "[Document]";
    else if (m.stickerMessage) content = "[Sticker]";
    else if (m.contactsArrayMessage) content = "[Contact]";
    else if (m.locationMessage) content = "[Localisation]";
    else if (m.liveLocationMessage) content = "[Localisation en direct]";

    return { content, mediaType, pushName: msg.pushName || "Inconnu" };
  }

  async downloadAndUploadMedia(msg, mediaType) {
    try {
      let mediaMsg;
      let streamType = mediaType;
      
      switch (mediaType) {
        case "image": 
          mediaMsg = msg.message?.imageMessage; 
          break;
        case "video": 
          mediaMsg = msg.message?.videoMessage; 
          break;
        case "audio": 
          mediaMsg = msg.message?.audioMessage; 
          streamType = "audio";
          break;
        case "document":
          mediaMsg = msg.message?.documentMessage;
          streamType = "document";
          break;
        case "sticker":
          mediaMsg = msg.message?.stickerMessage;
          streamType = "sticker";
          break;
        default: 
          return null;
      }
      
      if (!mediaMsg) return null;

      const stream = await downloadContentFromMessage(mediaMsg, streamType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const url = await uploadMediaToCatbox(buffer, mediaType);
      if (url) console.log(chalk.green(`📎 Média IB uploadé → ${url}`));
      return url;
    } catch (err) {
      console.error(chalk.red(`❌ Erreur download/upload média IB`), err.message);
      return null;
    }
  }

  async storeMessage(msg) {
    try {
      if (!msg?.key?.id || !msg.key.remoteJid) return null;
      
      // Ne stocker que les messages IB (pas les groupes)
      if (msg.key.remoteJid.endsWith('@g.us')) return null;
      if (msg.key.remoteJid === "status@broadcast") return null;
      
      // Ne pas stocker les messages du bot
      if (msg.key.fromMe) return null;
      
      this.checkAndRotate();

      const id = msg.key.id;
      const { content, mediaType, pushName } = this.extractMessageContent(msg);
      const senderJid = msg.key.remoteJid; // En IB, c'est directement le JID de la personne
      const messageId = msg.key.id;

      let mediaUrl = null;
      if (mediaType && ["image", "video", "audio", "document", "sticker"].includes(mediaType)) {
        mediaUrl = await this.downloadAndUploadMedia(msg, mediaType);
      }

      const data = {
        id: messageId,
        senderJid: senderJid,
        pushName: pushName, // Le nom WhatsApp de l'expéditeur
        content: content,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        timestamp: msg.messageTimestamp || Math.floor(Date.now() / 1000)
      };

      this.messagesDB.set(messageId, data);

      const db = this.loadDB();
      db.messages[senderJid] = db.messages[senderJid] || [];
      
      // Ajouter le message à la liste des messages de ce contact
      db.messages[senderJid].push({
        id: messageId,
        pushName: pushName,
        content: content,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        timestamp: data.timestamp
      });
      
      // Limiter à 50 messages par contact pour éviter la surcharge
      if (db.messages[senderJid].length > 50) {
        db.messages[senderJid] = db.messages[senderJid].slice(-50);
      }
      
      if (mediaUrl) {
        db.media[messageId] = mediaUrl;
      }

      fs.writeFileSync(this.dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
      return data;
    } catch (err) {
      console.error(chalk.red("❌ Erreur stockage message IB:"), err);
      return null;
    }
  }

  loadDB() {
    try {
      if (!fs.existsSync(this.dbFilePath)) return { messages: {}, media: {} };
      const data = JSON.parse(fs.readFileSync(this.dbFilePath, 'utf-8'));
      return data;
    } catch {
      return { messages: {}, media: {} };
    }
  }

  findMessageByContent(senderJid, content, timestamp) {
    const db = this.loadDB();
    const userMessages = db.messages[senderJid] || [];
    
    // Chercher un message récent avec ce contenu
    return userMessages.find(msg => 
      msg.content === content && 
      Math.abs(msg.timestamp - timestamp) < 5 // Dans les 5 secondes
    );
  }

  findMessageById(messageId) {
    const db = this.loadDB();
    
    // Parcourir tous les utilisateurs pour trouver le message
    for (const [senderJid, messages] of Object.entries(db.messages)) {
      const found = messages.find(msg => msg.id === messageId);
      if (found) {
        return {
          ...found,
          senderJid
        };
      }
    }
    return null;
  }

  removeMessage(messageId, senderJid) {
    try {
      this.messagesDB.delete(messageId);
      this.mediaDB.delete(messageId);
      
      const db = this.loadDB();
      if (senderJid && db.messages[senderJid]) {
        db.messages[senderJid] = db.messages[senderJid].filter(msg => msg.id !== messageId);
        
        if (db.messages[senderJid].length === 0) {
          delete db.messages[senderJid];
        }
      }
      
      if (db.media[messageId]) {
        delete db.media[messageId];
      }
      
      fs.writeFileSync(this.dbFilePath, JSON.stringify(db, null, 2));
      return true;
    } catch {
      return false;
    }
  }

  detectDeletedMessage(message) {
    const proto = message?.message?.protocolMessage;
    if (!proto || proto.type !== 0) return { isDeleted: false };
    
    return {
      isDeleted: true,
      deletedMessageId: proto.key?.id,
      chatId: proto.key?.remoteJid
    };
  }

  async resendDeletedMessage(sock, deletedId, chatId) {
    try {
      if (!this.botNumber) {
        console.log(chalk.red("❌ Numéro du bot non défini dans .env"));
        return false;
      }

      const data = this.findMessageById(deletedId);
      if (!data) {
        console.log(chalk.yellow(`⚠️ Message IB ${deletedId} non trouvé`));
        return false;
      }

      const botJid = `${this.botNumber}@s.whatsapp.net`;
      const time = new Date(data.timestamp * 1000).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // L'expéditeur est celui qui a supprimé le message (data.pushName)
      const txt = `╭═══❰ *ANTI-DELETE IB* ❱═══╮\n` +
                  `┃\n` +
                  `┃ 👤 *Expéditeur :* ${data.pushName || 'Inconnu'}\n` +
                  `┃ 📱 *Numéro :* ${data.senderJid.split('@')[0]}\n` +
                  `┃ 📅 *Date :* ${time}\n` +
                  `┃\n` +
                  `┃ 📋 *Message supprimé :*\n` +
                  `┃ ${data.content || '[Message vide]'}\n` +
                  `┃\n` +
                  `┃ ⚠️ *Message restauré dans l'IB du bot*\n` +
                  `╰═══════════════════╯`;

      // Renvoyer dans l'IB du bot
      if (data.mediaUrl && data.mediaType) {
        const opts = { caption: txt };
        
        switch (data.mediaType) {
          case "image":
            opts.image = { url: data.mediaUrl };
            break;
          case "video":
            opts.video = { url: data.mediaUrl };
            break;
          case "audio":
            opts.audio = { url: data.mediaUrl };
            opts.mimetype = 'audio/mpeg';
            opts.ptt = false;
            break;
          case "document":
            opts.document = { url: data.mediaUrl };
            opts.mimetype = 'application/octet-stream';
            opts.fileName = `document_${Date.now()}.pdf`;
            break;
          case "sticker":
            opts.sticker = { url: data.mediaUrl };
            break;
        }
        
        await sock.sendMessage(botJid, opts);
        console.log(chalk.green(`✅ Message IB restauré dans l'IB du bot (expéditeur: ${data.pushName})`));
      } else {
        await sock.sendMessage(botJid, { text: txt });
        console.log(chalk.green(`✅ Message IB restauré (texte) dans l'IB du bot (expéditeur: ${data.pushName})`));
      }

      this.removeMessage(deletedId, data.senderJid);
      return true;
    } catch (err) {
      console.error(chalk.red("❌ Erreur resend deleted msg IB:"), err);
      return false;
    }
  }

  getStats() {
    const db = this.loadDB();
    
    let totalMessages = 0;
    const contacts = Object.keys(db.messages || {}).length;
    
    for (const msgs of Object.values(db.messages || {})) {
      totalMessages += msgs.length;
    }
    
    return {
      totalContacts: contacts,
      totalMessages: totalMessages,
      totalMedia: Object.keys(db.media || {}).length,
      isEnabled: this.isEnabled,
      maxMessages: CONFIG.ANTI_DELETE_IB.MAX_MESSAGES,
      rotationEnabled: CONFIG.ANTI_DELETE_IB.ROTATION_ENABLED,
      totalRotations: this.rotationCount,
      botNumber: this.botNumber
    };
  }

  clearDB() {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify({ messages: {}, media: {} }, null, 2));
      this.messagesDB.clear();
      this.mediaDB.clear();
      console.log(chalk.green("✅ Base anti-delete IB vidée"));
      return true;
    } catch (err) {
      console.error("❌ Erreur clear DB IB:", err);
      return false;
    }
  }
  
  viewLastMessages(limit = 10) {
    const db = this.loadDB();
    const allMessages = [];
    
    for (const [senderJid, messages] of Object.entries(db.messages || {})) {
      messages.forEach(msg => {
        allMessages.push({
          ...msg,
          senderJid
        });
      });
    }
    
    return allMessages
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limit);
  }
}

// =================== INITIALISATION ===================

let antiDeleteGroupes = null;
let antiDeleteIB = null;

export function initProtections(sock, ownerNumber) {
  const protection = new ProtectionSystem();
  const exports = protection.init(sock);
  
  // Récupérer le JID du owner
  const ownerJid = protection.getOwnerJid();
  
  // Initialiser les deux systèmes anti-delete
  antiDeleteGroupes = new AntiDeleteGroupes();
  antiDeleteIB = new AntiDeleteIB();
  
  // Connecter les sockets
  antiDeleteGroupes.setSock(sock);
  antiDeleteIB.setSock(sock);
  
  // Définir le JID du owner pour les groupes
  if (ownerJid) {
    antiDeleteGroupes.setOwnerJid(ownerJid);
    console.log(chalk.green(`✅ Owner JID défini pour groupes: ${ownerJid}`));
  } else {
    console.log(chalk.yellow(`⚠️ Owner non défini, le mode owner de l'anti-delete groupes ne fonctionnera pas`));
  }
  
  // Récupérer le numéro du bot depuis .env
  const botNumber = process.env.NUMBER;
  if (botNumber) {
    antiDeleteIB.setBotNumber(botNumber);
    console.log(chalk.green(`✅ Numéro bot défini: ${botNumber}`));
  } else {
    console.log(chalk.yellow(`⚠️ NUMBER non défini dans .env, l'anti-delete IB ne pourra pas restaurer les messages`));
  }

  // Stockage des messages de groupe et IB
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages?.length) return;
    
    for (const msg of messages) {
      if (msg.key?.fromMe) continue;
      
      // Stocker dans le système approprié
      if (msg.key.remoteJid?.endsWith('@g.us')) {
        await antiDeleteGroupes.storeMessage(msg);
      } else if (!msg.key.remoteJid?.endsWith('@g.us') && msg.key.remoteJid !== "status@broadcast") {
        await antiDeleteIB.storeMessage(msg);
      }
    }
  });

  // Détection suppression - via messages.update
  sock.ev.on('messages.update', async (updates) => {
    for (const upd of updates) {
      // Vérifier pour les groupes
      if (antiDeleteGroupes.isEnabled) {
        const { isDeleted, deletedMessageId, chatId } = antiDeleteGroupes.detectDeletedMessage(upd.update);
        if (isDeleted && deletedMessageId && chatId?.endsWith('@g.us')) {
          console.log(chalk.red(`🗑️ Suppression détectée dans GROUPE → ${deletedMessageId}`));
          await antiDeleteGroupes.resendDeletedMessage(sock, deletedMessageId, chatId);
        }
      }
      
      // Vérifier pour les IB
      if (antiDeleteIB.isEnabled) {
        const { isDeleted, deletedMessageId, chatId } = antiDeleteIB.detectDeletedMessage(upd.update);
        if (isDeleted && deletedMessageId && chatId && !chatId.endsWith('@g.us') && chatId !== "status@broadcast") {
          console.log(chalk.blue(`🗑️ Suppression détectée dans IB → ${deletedMessageId}`));
          await antiDeleteIB.resendDeletedMessage(sock, deletedMessageId, chatId);
        }
      }
    }
  });

  // Détection suppression - via messages.upsert (protocol messages)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages?.length) return;
    
    for (const msg of messages) {
      // Vérifier pour les groupes
      if (antiDeleteGroupes.isEnabled) {
        const { isDeleted, deletedMessageId, chatId } = antiDeleteGroupes.detectDeletedMessage(msg);
        if (isDeleted && deletedMessageId && chatId?.endsWith('@g.us')) {
          console.log(chalk.red(`🗑️ Suppression protocol détectée dans GROUPE → ${deletedMessageId}`));
          await antiDeleteGroupes.resendDeletedMessage(sock, deletedMessageId, chatId);
        }
      }
      
      // Vérifier pour les IB
      if (antiDeleteIB.isEnabled) {
        const { isDeleted, deletedMessageId, chatId } = antiDeleteIB.detectDeletedMessage(msg);
        if (isDeleted && deletedMessageId && chatId && !chatId.endsWith('@g.us') && chatId !== "status@broadcast") {
          console.log(chalk.blue(`🗑️ Suppression protocol détectée dans IB → ${deletedMessageId}`));
          await antiDeleteIB.resendDeletedMessage(sock, deletedMessageId, chatId);
        }
      }
    }
  });

  global.protectionSystem = {
    ...exports,
    antiDeleteGroupes: {
      toggle: () => antiDeleteGroupes.toggleEnabled(),
      setStatus: (s) => antiDeleteGroupes.setEnabled(s),
      setMode: (mode) => antiDeleteGroupes.setMode(mode),
      getMode: () => antiDeleteGroupes.getMode(),
      getStats: () => antiDeleteGroupes.getStats(),
      findMessage: (id) => antiDeleteGroupes.findMessage(id),
      clearDB: () => antiDeleteGroupes.clearDB(),
      viewLastMessages: (limit) => antiDeleteGroupes.viewLastMessages(limit),
      forceRotation: () => antiDeleteGroupes.performRotation()
    },
    antiDeleteIB: {
      toggle: () => antiDeleteIB.toggleEnabled(),
      setStatus: (s) => antiDeleteIB.setEnabled(s),
      getStats: () => antiDeleteIB.getStats(),
      findMessage: (id) => antiDeleteIB.findMessageById(id),
      clearDB: () => antiDeleteIB.clearDB(),
      viewLastMessages: (limit) => antiDeleteIB.viewLastMessages(limit),
      forceRotation: () => antiDeleteIB.performRotation()
    }
  };

  const printStatus = () => {
    const p = protection.getStats();
    const aG = antiDeleteGroupes.getStats();
    const aI = antiDeleteIB.getStats();
    
    console.log(chalk.cyan("\n" + "═".repeat(50)));
    console.log(chalk.cyan("📊 STATUT PROTECTION"));
    console.log(chalk.cyan("═".repeat(50)));
    console.log(chalk.yellow(`🎵 Audio response      : ${p.status.audiorespons ? 'ON' : 'OFF'}`));
    console.log(chalk.magenta(`⌨️  Auto typing         : ${p.status.autowrite ? 'ON' : 'OFF'}`));
    console.log(chalk.cyan(`🎙️  Auto recording      : ${p.status.autorecording ? 'ON' : 'OFF'}`));
    console.log(chalk.green(`💚  Auto like status    : ${p.status.autostatuslike ? 'ON' : 'OFF'}`));
    console.log(chalk.red(`👥 Anti-delete GROUPES  : ${aG.isEnabled ? 'ON' : 'OFF'}`));
    console.log(chalk.red(`   Mode                : ${aG.mode === "simple" ? "Simple (groupe)" : "Owner (IB owner)"}`));
    console.log(chalk.blue(`   Messages groupes    : ${aG.totalMessages}/${aG.maxMessages}`));
    console.log(chalk.blue(`   Médias groupes      : ${aG.totalMedia}`));
    console.log(chalk.cyan(`💬 Anti-delete IB      : ${aI.isEnabled ? 'ON' : 'OFF'}`));
    console.log(chalk.cyan(`   Contacts IB         : ${aI.totalContacts}`));
    console.log(chalk.cyan(`   Messages IB         : ${aI.totalMessages}`));
    console.log(chalk.cyan(`   Médias IB           : ${aI.totalMedia}`));
    console.log(chalk.cyan(`   Bot IB              : ${aI.botNumber || 'Non défini'}`));
    console.log(chalk.cyan("═".repeat(50)));
  };

  global.protectionSystem.printStatus = printStatus;
  printStatus();

  console.log(chalk.green.bold("\n🚀 Protection systems loaded:"));
  console.log(chalk.green(" • Audio response on mention"));
  console.log(chalk.green(" • Auto typing simulation"));
  console.log(chalk.green(" • Auto recording simulation"));
  console.log(chalk.green(" • Auto 💚 like on status"));
  console.log(chalk.green(" • Anti-delete GROUPES (2 modes: groupe ou IB owner) + upload média"));
  console.log(chalk.green(" • Anti-delete IB (restauration dans l'IB du bot avec nom WhatsApp)"));
  
  return global.protectionSystem;
}