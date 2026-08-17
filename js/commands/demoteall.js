import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const name = "demoteall";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifie si la commande est utilisée dans un groupe
  if (!from.endsWith("@g.us")) {
    return await sock.sendMessage(from, {
      text: "🚫 *Commande réservée aux groupes seulement.*"
    }, { quoted: msg });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants || [];

    // --- Identifiants essentiels ---
    const botJid =
      (sock?.user?.id?.split?.(":")?.[0] || sock?.user?.jid?.split?.(":")?.[0] || "") +
      "@s.whatsapp.net";

    const sender = msg.key.participant || msg.participant || from;

    // --- Charger les propriétaires depuis un fichier JSON ---
    const configPath = "./config.json";
    if (!fs.existsSync(configPath)) {
      console.error("⚠️ config.json introuvable !");
      return await sock.sendMessage(from, {
        text: "> Knut XMD: ⚠️ Le fichier config.json est introuvable."
      }, { quoted: msg });
    }

    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const OWNER_NUMBERS = Array.isArray(configData.owners) ? configData.owners : [];

    if (OWNER_NUMBERS.length === 0) {
      console.error("⚠️ Aucun numéro de propriétaire trouvé dans config.json !");
      return await sock.sendMessage(from, {
        text: "> Knut XMD: ⚠️ Aucun numéro de propriétaire n’est configuré dans config.json."
      }, { quoted: msg });
    }

    // Formater les JIDs des propriétaires
    const OWNER_JIDS = OWNER_NUMBERS.map(n => n.replace(/\D/g, "") + "@s.whatsapp.net");

    // --- Fonction utilitaire pour détecter les admins ---
    const isAdmin = p => {
      const adminFlag = p?.admin || p?.isAdmin || p?.isSuperAdmin;
      return adminFlag === true || adminFlag === "admin" || adminFlag === "superadmin";
    };

    // --- Liste des admins à rétrograder (exclure bot, owners, auteur) ---
    const toDemote = participants
      .filter(p => {
        const jid = p?.id || p?.jid || p?.participant;
        if (!jid) return false;
        return isAdmin(p) && jid !== botJid && !OWNER_JIDS.includes(jid) && jid !== sender;
      })
      .map(p => p.id);

    if (toDemote.length === 0) {
      return await sock.sendMessage(from, {
        text: "> Knut XMD: ✅ Aucun admin à rétrograder"
      }, { quoted: msg });
    }

    // --- Exécution du demote ---
    await sock.groupParticipantsUpdate(from, toDemote, "demote");

    // --- Confirmation ---
    await sock.sendMessage(from, {
      text: `> Knut XMD: 🔽 *${toDemote.length} admin(s) rétrogradé(s).* (Bot, propriétaires et auteur exclus)`,
      mentions: toDemote
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur demoteall :", err);
    await sock.sendMessage(from, {
      text: "❌ *Erreur lors de l'exécution de demoteall.* Vérifie mes permissions ou réessaye."
    }, { quoted: msg });
  }
}
