export const name = "add";

export const description = "Ajoute une personne dans le groupe";

export const usage = "!add <numéro>";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  try {

    // Vérifie si c'est un groupe

    if (!from.endsWith("@g.us")) {

      await sock.sendMessage(from, { text: "> Knut XMD : ⚠️ Cette commande ne fonctionne que dans un groupe." });

      return;

    }

    // Vérifie si un numéro est donné

    if (!args[0]) {

      await sock.sendMessage(from, { text: "> Knut XMD ⚠️ Utilisation : !add <numéro>" });

      return;

    }

    // Nettoyage du numéro

    let number = args[0].replace(/[^0-9]/g, ""); // garde seulement les chiffres

    if (!number) {

      await sock.sendMessage(from, { text: "❌ Numéro invalide." });

      return;

    }

    if (!number.endsWith("@s.whatsapp.net")) {

      number = number + "@s.whatsapp.net";

    }

    // Ajout au groupe

    await sock.groupParticipantsUpdate(from, [number], "add");

    await sock.sendMessage(from, {

      text: `> Knut XMD: ✅ L'utilisateur ${args[0]} a été ajouté au groupe.`

    });

  } catch (e) {

    console.error("[ADD] Erreur :", e);

    await sock.sendMessage(from, { text: "> Knut XMD:❌ Impossible d'ajouter ce numéro. Vérifie que :\n- Le numéro existe\n- Il a WhatsApp\n- Le bot est admin du groupe" });

  }

}