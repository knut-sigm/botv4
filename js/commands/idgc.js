export const name = "idgc";
export const description = "Affiche l'ID du groupe WhatsApp";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // Vérifier si c'est un groupe
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(
        from,
        { text: "> ⚠️ KNUT XMD : Cette commande fonctionne uniquement dans un groupe." },
        { quoted: msg }
      );
    }

    // Récupérer le nom du groupe pour plus de contexte
    const groupMetadata = await sock.groupMetadata(from);
    const groupName = groupMetadata.subject || "ce groupe";

    const text = `> ╔════════════════════╗
        ⚫ KNUT-XMD ⚫
> ╚════════════════════╝

📌 *Groupe :* ${groupName}
🔑 *ID :* \`${from}\`

> Utilise cet ID dans les commandes qui nécessitent l'ID du groupe.
> Dev by Knut`;

    await sock.sendMessage(
      from,
      { text: text },
      { quoted: msg }
    );

  } catch (err) {
    console.error("_⚫KNUT MDX☠️:_ ❌ Erreur idgc :", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "> ⚠️ KNUT XMD : Impossible de récupérer l'ID du groupe." },
      { quoted: msg }
    );
  }
};