import { getDevice } from "baileys";

export const name = "device";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  // Vérifier si la commande est utilisée en réponse à un message

  const quoted = msg.message?.extendedTextMessage?.contextInfo;

  if (!quoted?.stanzaId) {

    await sock.sendMessage(

      from,

      { text: "> Knut XMD : Réponds à un message pour détecter l’appareil utilisé." },

      { quoted: msg }

    );

    return;

  }

  try {

    // Récupérer l’appareil de l’auteur du message cité

    const device = getDevice(quoted.stanzaId);

    await sock.sendMessage(

      from,

      { text: `> Knut XMD : L’utilisateur visé utilise ${device ?? "un appareil inconnu"}.` },

      { quoted: msg }

    );

  } catch (err) {

    console.error("Erreur device :", err);

    await sock.sendMessage(

      from,

      { text: "> Knut XMD : Impossible de détecter l’appareil. Vérifie que tu as bien répondu à un message." },

      { quoted: msg }

    );

  }

}