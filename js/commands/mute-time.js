export const name = "mute-time";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  if (!from || !from.endsWith("@g.us")) {

    await sock.sendMessage(from, { text: "> Knut XMD : ❌ Cette commande marche uniquement dans un groupe." }, { quoted: msg });

    return;

  }

  if (!args[0]) {

    await sock.sendMessage(from, { text: "> Knut XMD : ⏰ Usage : mute-time HH:MM\nExemple : mute-time 00:05 (dans 5 minutes)" }, { quoted: msg });

    return;

  }

  const match = args[0].match(/^(\d{2}):(\d{2})$/);

  if (!match) {

    await sock.sendMessage(from, { text: "> Knut XMD : ⚠️ Format invalide. Exemple : mute-time 00:10 (10 minutes)" }, { quoted: msg });

    return;

  }

  const addHours = parseInt(match[1], 10);

  const addMinutes = parseInt(match[2], 10);

  if (isNaN(addHours) || isNaN(addMinutes)) {

    await sock.sendMessage(from, { text: "> Knut XMD : ⚠️ Valeurs d'heures/minutes incorrectes." }, { quoted: msg });

    return;

  }

  // Calcul du délai en ms

  const delay = (addHours * 60 + addMinutes) * 60 * 1000;

  if (delay <= 0) {

    await sock.sendMessage(from, { text: "> Knut XMD : ⚠️ Donne un délai supérieur à 0." }, { quoted: msg });

    return;

  }

  await sock.sendMessage(from, {

    text: `> Knut XMD : ⏳ Le groupe sera fermé dans ${addHours}h ${addMinutes}m.`

  }, { quoted: msg });

  setTimeout(async () => {

    try {

      await sock.groupSettingUpdate(from, "announcement");

      await sock.sendMessage(from, {

        text: `> Knut XMD : 🔒 Le groupe a été fermé automatiquement après ${addHours}h ${addMinutes}m !`

      });

    } catch (err) {

      console.error("Erreur fermeture groupe :", err);

      await sock.sendMessage(from, {

        text: "> Knut XMD : ⚠️ Impossible de fermer le groupe (suis-je admin ?)."

      });

    }

  }, delay);

}