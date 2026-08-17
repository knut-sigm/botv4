import moment from "moment-timezone";

let groupSchedules = {}; // stockage des horaires par groupe

export const name = "settimeg";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  try {

    // Vérifie si on est bien dans un groupe

    if (!from.endsWith("@g.us")) {

      return await sock.sendMessage(from, {

        text: "> Knut XMD :⚠️ Cette commande fonctionne uniquement dans un groupe.",

      }, { quoted: msg });

    }

    // Vérifie si la commande est bien formée

    const input = args.join(" ");

    if (!input.includes("/")) {

      return await sock.sendMessage(from, {

        text: "> Knut XMD ⚠️ Format invalide.\nExemple : `!settimeg 08:00/22:00`",

      }, { quoted: msg });

    }

    const [openTime, closeTime] = input.split("/");

    // Validation format HH:mm

    if (!/^\d{2}:\d{2}$/.test(openTime) || !/^\d{2}:\d{2}$/.test(closeTime)) {

      return await sock.sendMessage(from, {

        text: "> Knut XMD :⚠️ Utilise le format HH:mm (exemple : 08:00/22:00).",

      }, { quoted: msg });

    }

    // Stocke la config

    groupSchedules[from] = { open: openTime, close: closeTime };

    await sock.sendMessage(from, {

      text: `> Knut XMD ✅ Horaires configurés avec succès :\n\n🟢 Ouverture : ${openTime}\n🔴 Fermeture : ${closeTime}`,

    }, { quoted: msg });

  } catch (err) {

    console.error("❌ Erreur settimeg :", err);

    await sock.sendMessage(from, {

      text: "> Knut XMD: ❌ Une erreur est survenue lors de la configuration des horaires.",

    }, { quoted: msg });

  }

}

// Fonction pour vérifier automatiquement les horaires

export function autoGroupScheduler(sock) {

  setInterval(async () => {

    const now = moment().tz("fuseau").format("HH:mm"); // ✅ adapte le fuseau horaire

    for (const groupId in groupSchedules) {

      const schedule = groupSchedules[groupId];

      try {

        if (now === schedule.open) {

          await sock.groupSettingUpdate(groupId, "not_announcement"); // ouvre le groupe

          await sock.sendMessage(groupId, { text: "> Knut XMD :🟢 Le groupe est maintenant *ouvert* !" });

        }

        if (now === schedule.close) {

          await sock.groupSettingUpdate(groupId, "announcement"); // ferme le groupe

          await sock.sendMessage(groupId, { text: "> Knut XMD :🔴 Le groupe est maintenant *fermé* !" });

        }

      } catch (e) {

        console.error("Erreur autoGroupScheduler :", e);

      }

    }

  }, 60 * 1000); // vérifie toutes les minutes

}