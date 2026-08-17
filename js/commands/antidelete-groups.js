import fs from "fs";
import path from "path";
import { loadSudo } from "../knut-bridge.js";

const DB_FILE = path.resolve("./json/antidelete-groupes.json");

export const name = "antidelete-groups";

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
    if (!global.protectionSystem?.antiDeleteGroupes) {
      await sock.sendMessage(from, { text: "> Knut XMD : Système anti-delete groupes non initialisé." }, { quoted: msg });
      return;
    }

    const antiDelete = global.protectionSystem.antiDeleteGroupes;
    const stats = antiDelete.getStats();
    const currentStatus = stats.isEnabled;
    const currentMode = stats.mode;

    // === ARGUMENT ===
    const arg = args[0]?.toLowerCase();

    if (!arg || !["on", "off", "mode", "status", "stats", "last", "clear", "help"].includes(arg)) {
      const status = currentStatus ? "✅ activé" : "🛑 désactivé";
      const modeText = currentMode === "simple" ? "📢 Groupe" : "👤 Owner IB";
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Delete Groups\n\n` +
              `État actuel : ${status}\n` +
              `Mode actuel : ${modeText}\n` +
              `Messages : ${stats.totalMessages}/${stats.maxMessages}\n` +
              `Médias : ${stats.totalMedia}\n\n` +
              `Utilisation :\n` +
              `• antidelete-groups on        → ✅ Activer\n` +
              `• antidelete-groups off       → 🛑 Désactiver\n` +
              `• antidelete-groups mode      → Voir/changer mode\n` +
              `• antidelete-groups status    → 📊 Statut\n` +
              `• antidelete-groups stats     → 📈 Statistiques\n` +
              `• antidelete-groups last [n]  → Voir derniers messages\n` +
              `• antidelete-groups clear     → 🗑️ Vider la base\n` +
              `• antidelete-groups help      → ℹ️ Aide détaillée`
      }, { quoted: msg });
      return;
    }

    // === HELP ===
    if (arg === "help") {
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Aide Anti-Delete Groups\n\n` +
              `📌 *Description :*\n` +
              `Protège les groupes contre la suppression de messages.\n\n` +
              `🎯 *Modes :*\n` +
              `• simple → Restaure dans le groupe 📢\n` +
              `• owner  → Restaure dans l'IB du owner 👤\n\n` +
              `📋 *Commandes :*\n` +
              `• on        → ✅ Activer\n` +
              `• off       → 🛑 Désactiver\n` +
              `• mode      → Voir le mode\n` +
              `• mode simple → 📢 Mode groupe\n` +
              `• mode owner  → 👤 Mode owner\n` +
              `• status    → 📊 Statut détaillé\n` +
              `• stats     → 📈 Statistiques\n` +
              `• last [n]  → Voir les n derniers messages\n` +
              `• clear     → 🗑️ Vider la base (avec --force)`
      }, { quoted: msg });
      return;
    }

    // === STATUS DÉTAILLÉ ===
    if (arg === "status") {
      const statusEmoji = currentStatus ? "✅" : "🛑";
      const modeText = currentMode === "simple" ? "Simple (groupe)" : "Owner (IB owner)";
      const pourcentage = Math.round((stats.totalMessages/stats.maxMessages)*100);
      
      let barre = "";
      for (let i = 0; i < 10; i++) {
        barre += i < Math.floor(pourcentage/10) ? "█" : "░";
      }
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Delete Groups - Statut\n\n` +
              `État : ${statusEmoji} ${currentStatus ? "Activé" : "Désactivé"}\n` +
              `Mode : ${modeText}\n` +
              `Messages : ${stats.totalMessages}/${stats.maxMessages}\n` +
              `Utilisation : ${barre} ${pourcentage}%\n` +
              `Médias : ${stats.totalMedia}\n` +
              `Rotations : ${stats.totalRotations || 0}\n` +
              `Base : ${path.basename(DB_FILE)}`
      }, { quoted: msg });
      return;
    }

    // === STATISTIQUES ===
    if (arg === "stats") {
      const pourcentage = Math.round((stats.totalMessages/stats.maxMessages)*100);
      
      await sock.sendMessage(from, { 
        text: `> Knut XMD: Anti-Delete Groups - Statistiques\n\n` +
              `Total messages : ${stats.totalMessages}\n` +
              `Total médias : ${stats.totalMedia}\n` +
              `Capacité max : ${stats.maxMessages}\n` +
              `Taux remplissage : ${pourcentage}%\n` +
              `Rotations : ${stats.totalRotations || 0}\n` +
              `Rotation auto : ${stats.rotationEnabled ? "✅ Oui" : "🛑 Non"}`
      }, { quoted: msg });
      return;
    }

    // === MODE ===
    if (arg === "mode") {
      if (!args[1]) {
        const modeText = currentMode === "simple" ? "📢 Simple (groupe)" : "👤 Owner (IB owner)";
        await sock.sendMessage(from, { 
          text: `> Knut XMD: Mode Anti-Delete Groups\n\n` +
                `Mode actuel : ${modeText}\n\n` +
                `Changer de mode :\n` +
                `• antidelete-groups mode simple → 📢 Mode groupe\n` +
                `• antidelete-groups mode owner  → 👤 Mode owner IB`
        }, { quoted: msg });
        return;
      }

      const newMode = args[1].toLowerCase();
      if (newMode === "simple" || newMode === "owner") {
        if (currentMode === newMode) {
          await sock.sendMessage(from, { 
            text: `> Knut XMD : ⚠️ Le mode est déjà en "${newMode}".` 
          }, { quoted: msg });
          return;
        }

        antiDelete.setMode(newMode);
        const modeEmoji = newMode === "simple" ? "📢" : "👤";
        await sock.sendMessage(from, { 
          text: `> Knut XMD: Mode changé ${modeEmoji} Mode ${newMode === "simple" ? "groupe" : "owner IB"} activé.`
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ❌ Mode invalide. Utilisez 'simple' ou 'owner'." 
        }, { quoted: msg });
      }
      return;
    }

    // === LAST ===
    if (arg === "last") {
      const limit = args[1] ? parseInt(args[1]) : 5;
      if (isNaN(limit) || limit < 1 || limit > 20) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ⚠️ Utilisation : antidelete-groups last [nombre 1-20]" 
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

      let msgText = `> Knut XMD: Derniers messages (${lastMessages.length})\n\n`;
      lastMessages.forEach((m, i) => {
        const date = m.timestamp ? new Date(m.timestamp * 1000).toLocaleString() : "Date inconnue";
        msgText += `${i+1}. 👤 ${m.pushName || "Inconnu"}\n   📝 ${m.content?.substring(0, 50)}${m.content?.length > 50 ? "..." : ""}\n   🕐 ${date}\n\n`;
      });

      await sock.sendMessage(from, { text: msgText }, { quoted: msg });
      return;
    }

    // === CLEAR ===
    if (arg === "clear") {
      if (args[1] !== "--force") {
        await sock.sendMessage(from, { 
          text: "> Knut XMD : ⚠️ Confirmation requise.\nFaites `antidelete-groups clear --force` pour vider la base." 
        }, { quoted: msg });
        return;
      }

      const cleared = antiDelete.clearDB();
      if (cleared) {
        await sock.sendMessage(from, { 
          text: "> Knut XMD: ✅ Base anti-delete groups vidée." 
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
        text: "> Knut XMD : ⚠️ L'anti-delete groups est déjà ✅ activé." 
      }, { quoted: msg });
      return;
    }
    
    if (arg === "off" && !currentStatus) {
      await sock.sendMessage(from, { 
        text: "> Knut XMD : ⚠️ L'anti-delete groups est déjà 🛑 désactivé." 
      }, { quoted: msg });
      return;
    }

    antiDelete.setStatus(newState);
    const statusEmoji = newState ? "✅" : "🛑";
    await sock.sendMessage(from, { 
      text: `> Knut XMD: Anti-Delete Groups ${statusEmoji} ${newState ? "activé" : "désactivé"}.`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur antidelete-groups:", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Une erreur est survenue." }, { quoted: msg });
  }
}