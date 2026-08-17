export const name = "resetlink";
export const aliases = ["relink", "linkreset"];
export const description = "Réinitialiser le lien du groupe";
export const usage = "resetlink";
export const category = "Administration";

export async function execute(Knutt, msg, args) {
  const chatId = msg.key.remoteJid;

  try {
    // 🔹 Réinitialiser le lien du groupe
    const newCode = await Knutt.groupRevokeInvite(chatId);

    // 🔹 Message de succès
    await Knutt.sendMessage(chatId, { 
      text: `> Knut XMD: ✅ Lien du groupe réinitialisé avec succès. `.trim()
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur resetlink :", err);
    await Knutt.sendMessage(chatId, { 
      text: "❌ Échec de la réinitialisation du lien !" 
    }, { quoted: msg });
  }
}