import { getGroupProtections, setGroupProtection } from "../groupManager.js";
import { loadSudo } from "../knut-bridge.js";

// Liste des protections de groupe gérées par groupManager
// (antiCall et antiUnknown sont globales et ne sont pas incluses)
const PROTECTION_KEYS = [
  'antiMessage',
  'antiLink',
  'antiBot',
  'antiSticker',
  'antiVoice',
  'antiVideo',
  'autoReact',
  'antiSpam',
  'autoKnutChat',
  'knuta',
  'antipromote1',
  'warnAdmin',
  'antiFile',
  'antiTagAll',
  'antiKickall',
  'antiGroupMention',
  'welcome',
  'goodbye'
  // Ajoutez ici toute nouvelle protection de groupe
];

export const name = "security";

export async function execute(sock, msg, args, from) {
  try {
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "Cette commande est réservée aux groupes." }, { quoted: msg });
      return;
    }

    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");
    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));

    const isOwner = owners.includes(senderNum);
    const isSudo = sudoList.includes(senderNum);
    const isAdmin = await isGroupAdmin(sock, from, sender);

    if (!isOwner && !isSudo && !isAdmin) {
      await sock.sendMessage(from, { text: "Accès refusé. Admin, owner ou sudo requis." }, { quoted: msg });
      return;
    }

    const arg = args[0]?.toLowerCase();
    const currentProtections = getGroupProtections(from);

    // Affichage de l'état
    if (arg === "state") {
      let message = "> 🔐 *État des sécurités dans ce groupe*\n\n";
      for (const key of PROTECTION_KEYS) {
        const status = currentProtections[key] ? "✅" : "❌";
        // Formatage lisible (ex: "Anti Message")
        const displayName = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace('Anti ', 'Anti‑')
          .replace('Auto ', 'Auto‑');
        message += `${status} ${displayName}\n`;
      }
      await sock.sendMessage(from, { text: message }, { quoted: msg });
      return;
    }

    // Activation / désactivation globale
    if (arg === "on" || arg === "off") {
      const newState = arg === "on";
      
      // Mettre à jour toutes les protections de la liste
      for (const key of PROTECTION_KEYS) {
        setGroupProtection(from, key, newState);
      }

      await sock.sendMessage(from, {
        text: `> Knut XMD: Toutes les sécurités ont été ${newState ? "activées" : "désactivées"} dans ce groupe.`
      }, { quoted: msg });
      
      console.log(`[SECURITY] ${newState ? 'Activées' : 'Désactivées'} par ${senderNum} dans ${from}`);
      return;
    }

    // Aide
    await sock.sendMessage(from, {
      text: `> *Commande Security*\n\nUtilisation :\n!security on   → active toutes les protections\n!security off  → désactive toutes les protections\n!security state → affiche l'état actuel`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur security command:", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "Une erreur est survenue." }, { quoted: msg });
  }
}

async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    return metadata.participants.some(p => p.id === userJid && p.admin);
  } catch {
    return false;
  }
}