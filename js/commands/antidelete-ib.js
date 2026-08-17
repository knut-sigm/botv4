import fs from "fs";
import path from "path";
import { loadSudo } from "../knut-bridge.js";

const DB_FILE = path.resolve("./json/antidelete-ib.json");

export const name = "antidelete-ib";

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
    if (!global.protectionSystem?.antiDeleteIB) {
      await sock.sendMessage(from, { text: "> Knut XMD : Système anti-delete IB non initialisé." }, { quoted: msg });
      return;
    }

    const antiDelete = global.protectionSystem.antiDeleteIB;
    const stats = antiDelete.getStats();
    const currentStatus = stats.isEnabled;
    const botNumber = stats.botNumber;

    // === ARGUMENT ===
    const arg = args[0]?.toLowerCase();

    if (!arg || !["on", "off", "status", "stats", "contacts", "last", "search", "clear", "help"].includes(arg)) {
      const status = currentStatus ? "✅ activé" : "🛑 désactivé";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Delete IB\n\n` +
              `État actuel : ${status}\n` +
              `Contacts : ${stats.totalContacts}\n` +
              `Messages : ${stats.totalMessages}\n` +
              `Médias : ${stats.totalMedia}\n` +
              `Bot IB : ${botNumber || "Non défini"}\n\n` +
              `Utilisation :\n` +
              `• antidelete-ib on        → ✅ Activer\n` +
              `• antidelete-ib off       → 🛑 Désactiver\n` +
              `• antidelete-ib status    → 📊 Statut\n` +
              `• antidelete-ib stats     → 📈 Statistiques\n` +
              `• antidelete-ib contacts  → 👥 Liste contacts\n` +
              `• antidelete-ib last [n]  → Voir derniers messages\n` +
              `• antidelete-ib search [nom] → 🔍 Rechercher\n` +
              `• antidelete-ib clear     → 🗑️ Vider la base\n` +
              `• antidelete-ib help      → ℹ️ Aide détaillée`
      }, { quoted: msg });
      return;
    }

    // === HELP ===
    if (arg === "help") {
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Aide Anti-Delete IB\n\n` +
              `📌 *Description :*\n` +
              `Protège les conversations privées contre la suppression.\n` +
              `Les messages supprimés sont restaurés dans l'IB du bot.\n\n` +
              `👤 *Expéditeur affiché :*\n` +
              `Le nom WhatsApp de la personne qui a supprimé le message.\n\n` +
              `📋 *Commandes :*\n` +
              `• on        → ✅ Activer\n` +
              `• off       → 🛑 Désactiver\n` +
              `• status    → 📊 Statut détaillé\n` +
              `• stats     → 📈 Statistiques\n` +
              `• contacts  → 👥 Liste des contacts\n` +
              `• last [n]  → Voir les n derniers messages\n` +
              `• search [nom] → 🔍 Rechercher par nom\n` +
              `• clear     → 🗑️ Vider la base (avec --force)`
      }, { quoted: msg });
      return;
    }

    // === STATUS DÉTAILLÉ ===
    if (arg === "status") {
      const statusEmoji = currentStatus ? "✅" : "🛑";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Delete IB - Statut\n\n` +
              `État : ${statusEmoji} ${currentStatus ? "Activé" : "Désactivé"}\n` +
              `Bot IB : ${botNumber || "Non défini"}\n` +
              `Contacts suivis : ${stats.totalContacts}\n` +
              `Messages stockés : ${stats.totalMessages}\n` +
              `Médias stockés : ${stats.totalMedia}\n` +
              `Rotations : ${stats.totalRotations || 0}\n` +
              `Base : ${path.basename(DB_FILE)}`
      }, { quoted: msg });
      return;
    }

    // === STATISTIQUES ===
    if (arg === "stats") {
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Delete IB - Statistiques\n\n` +
              `Contacts : ${stats.totalContacts}\n` +
              `Messages : ${stats.totalMessages}\n` +
              `Médias : ${stats.totalMedia}\n` +
              `Capacité max : ${stats.maxMessages}\n` +
              `Rotations : ${stats.totalRotations || 0}\n` +
              `Rotation auto : ${stats.rotationEnabled ? "✅ Oui" : "🛑 Non"}`
      }, { quoted: msg });
      return;
    }

    // === CONTACTS ===
    if (arg === "contacts") {
      const db = antiDelete.loadDB();
      const contacts = Object.keys(db.messages || {}).sort();
      
      if (contacts.length === 0) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : 📭 Aucun contact enregistré." 
        }, { quoted: msg });
        return;
      }

      let msgText = `> Knut XMD: Contacts suivis (${contacts.length})\n\n`;
      contacts.slice(0, 15).forEach((contact, i) => {
        const msgCount = db.messages[contact]?.length || 0;
        const lastMsg = db.messages[contact]?.slice(-1)[0];
        const name = lastMsg?.pushName || "Inconnu";
        msgText += `${i+1}. 👤 ${name}\n   📱 ${contact.split('@')[0]}\n   💬 ${msgCount} messages\n\n`;
      });

      if (contacts.length > 15) {
        msgText += `... et ${contacts.length - 15} autres contacts\n`;
      }

      await sock.sendMessage(from, { text: msgText }, { quoted: msg });
      return;
    }

    // === LAST ===
    if (arg === "last") {
      const limit = args[1] ? parseInt(args[1]) : 5;
      if (isNaN(limit) || limit < 1 || limit > 20) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ⚠️ Utilisation : antidelete-ib last [nombre 1-20]" 
        }, { quoted: msg });
        return;
      }

      const lastMessages = antiDelete.viewLastMessages(limit);
      
      if (!lastMessages || lastMessages.length === 0) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : 📭 Aucun message stocké." 
        }, { quoted: msg });
        return;
      }

      let msgText = `> Knut XMD: Derniers messages IB (${lastMessages.length})\n\n`;
      lastMessages.forEach((m, i) => {
        const date = m.timestamp ? new Date(m.timestamp * 1000).toLocaleString() : "Date inconnue";
        msgText += `${i+1}. 👤 ${m.pushName || "Inconnu"}\n   📱 ${m.senderJid?.split('@')[0]}\n   📝 ${m.content?.substring(0, 50)}${m.content?.length > 50 ? "..." : ""}\n   🕐 ${date}\n\n`;
      });

      await sock.sendMessage(from, { text: msgText }, { quoted: msg });
      return;
    }

    // === SEARCH ===
    if (arg === "search") {
      if (!args[1]) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ⚠️ Utilisation : antidelete-ib search [nom]" 
        }, { quoted: msg });
        return;
      }

      const searchTerm = args.slice(1).join(" ").toLowerCase();
      const db = antiDelete.loadDB();
      const results = [];
      
      for (const [jid, messages] of Object.entries(db.messages || {})) {
        messages.forEach(msg => {
          if (msg.pushName && msg.pushName.toLowerCase().includes(searchTerm)) {
            results.push({ ...msg, jid });
          }
        });
      }

      if (results.length === 0) {
        await sock.sendMessage(from, { 
          text: `> Knut XMD : 📭 Aucun résultat pour "${args.slice(1).join(" ")}".` 
        }, { quoted: msg });
        return;
      }

      let msgText = `> Knut XMD: Résultats pour "${args.slice(1).join(" ")}" (${results.length})\n\n`;
      results.slice(0, 10).forEach((m, i) => {
        const date = m.timestamp ? new Date(m.timestamp * 1000).toLocaleString() : "Date inconnue";
        msgText += `${i+1}. 👤 ${m.pushName}\n   📝 ${m.content?.substring(0, 50)}${m.content?.length > 50 ? "..." : ""}\n   🕐 ${date}\n\n`;
      });

      if (results.length > 10) {
        msgText += `... et ${results.length - 10} autres résultats\n`;
      }

      await sock.sendMessage(from, { text: msgText }, { quoted: msg });
      return;
    }

    // === CLEAR ===
    if (arg === "clear") {
      if (args[1] !== "--force") {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ⚠️ Confirmation requise.\nFaites `antidelete-ib clear --force` pour vider la base." 
        }, { quoted: msg });
        return;
      }

      const cleared = antiDelete.clearDB();
      if (cleared) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD: ✅ Base anti-delete IB vidée." 
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ❌ Erreur lors du vidage." 
        }, { quoted: msg });
      }
      return;
    }

    // === ON / OFF ===
    const newState = arg === "on";
    
    if (arg === "on" && currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'anti-delete IB est déjà ✅ activé." 
      }, { quoted: msg });
      return;
    }
    
    if (arg === "off" && !currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'anti-delete IB est déjà 🛑 désactivé." 
      }, { quoted: msg });
      return;
    }

    if (arg === "on" && !botNumber) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ❌ NUMÉRO du bot non défini dans .env" 
      }, { quoted: msg });
      return;
    }

    antiDelete.setStatus(newState);
    const statusEmoji = newState ? "✅" : "🛑";
    await sock.sendMessage(from, { 
      text: `> Knut XMD: Anti-Delete IB ${statusEmoji} ${newState ? "activé" : "désactivé"}.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur antidelete-ib:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}