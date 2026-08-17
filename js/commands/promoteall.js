import dotenv from "dotenv";
dotenv.config();

export const name = "promoteall";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifie si c’est un groupe
  if (!from.endsWith("@g.us")) {
    return await sock.sendMessage(from, {
      text: "> Knut XMD: 🚫 Commande réservée aux groupes seulement."
    }, { quoted: msg });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants || [];

    // --- JIDs essentiels ---
    const botJid =
      (sock?.user?.id?.split?.(":")?.[0] || sock?.user?.jid?.split?.(":")?.[0] || "") +
      "@s.whatsapp.net";

    const OWNER_NUMBER = process.env.NUMBER?.replace(/\D/g, "");
    const OWNER_JID = OWNER_NUMBER ? `${OWNER_NUMBER}@s.whatsapp.net` : null;

    const sender = msg.key.participant || msg.participant || from;

    if (!OWNER_JID) {
      console.error("⚠️ Le numéro du propriétaire (NUMBER) n'est pas défini dans .env !");
      return await sock.sendMessage(from, {
        text: "> Knut XMD: ⚠️ Le numéro du propriétaire n’est pas configuré."
      }, { quoted: msg });
    }

    // --- Fonction utilitaire pour vérifier si admin ---
    const isAdmin = p => {
      const adminFlag = p?.admin || p?.isAdmin || p?.isSuperAdmin;
      return adminFlag === true || adminFlag === "admin" || adminFlag === "superadmin";
    };

    // --- Liste des membres à promouvoir (exclure bot, owner et auteur déjà admin) ---
    const toPromote = participants
      .filter(p => {
        const jid = p?.id || p?.jid || p?.participant;
        if (!jid) return false;
        return !isAdmin(p) && jid !== botJid && jid !== OWNER_JID;
      })
      .map(p => p.id);

    if (toPromote.length === 0) {
      return await sock.sendMessage(from, {
        text: "> Knut XMD: ✅ Tous les membres sont déjà administrateurs"
      }, { quoted: msg });
    }

    // --- Promotion des membres ---
    await sock.groupParticipantsUpdate(from, toPromote, "promote");

    await sock.sendMessage(from, {
      text: `🟢 *${toPromote.length} membre(s) promu(s) administrateur(s).* (Bot et propriétaire exclus)`,
      mentions: toPromote
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur promoteall :", err);
    await sock.sendMessage(from, {
      text: "❌ *Erreur lors de l'exécution de promoteall.* Vérifie mes permissions ou réessaye."
    }, { quoted: msg });
  }
}
