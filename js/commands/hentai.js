import axios from 'axios';

export const name = "hentai";
export const aliases = ["h", "ass", "milf", "hneko", "hwaifu", "naija", "celeb"];
export const description = "Envoie du contenu NSFW aléatoire (anime & real)";
export const usage = "!hentai [type]\nTypes disponibles : ass, milf, hneko, hwaifu, naija, celeb\n(sans argument = aléatoire anime)";

const APIS = {
  ass:     'https://api.princetechn.com/api/anime/ass?apikey=prince',
  hwaifu:  'https://api.princetechn.com/api/anime/hwaifu?apikey=prince',
  hneko:   'https://api.princetechn.com/api/anime/hneko?apikey=prince',
  milf:    'https://api.princetechn.com/api/anime/milf?apikey=prince',
  naija:   'https://api.princetechn.com/api/nsfw/naija?apikey=prince',
  celeb:   'https://apis.davidcyril.name.ng/celeb'
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  let type = args[0] ? args[0].toLowerCase() : "random";
  const validTypes = Object.keys(APIS);
  const animeTypes = ["ass", "hwaifu", "hneko", "milf"];

  // Si aucun type ou random → anime aléatoire
  if (type === "random" || !validTypes.includes(type)) {
    if (!args[0]) {
      type = animeTypes[Math.floor(Math.random() * animeTypes.length)];
    } else {
      await sock.sendMessage(from, { 
        text: "> Knut XMD ⚠️ Type invalide.\n\nTypes valides : ass, milf, hneko, hwaifu, naija, celeb\nExemple : !hentai ass" 
      });
      return;
    }
  }

  try {
    await sock.sendMessage(from, { 
      react: { text: type === "celeb" ? "🔥" : "🔞", key: msg.key } 
    });

    const apiUrl = APIS[type];
    const { data } = await axios.get(apiUrl, { 
      headers: { 'User-Agent': UA },
      timeout: 15000 
    });

    // ─── CELEB (vidéo) ───────────────────────────────────────────────
    if (type === "celeb") {
      if (!data.success || !data.data?.downloadUrl) {
        throw new Error("Réponse API celeb invalide");
      }

      await sock.sendMessage(from, { 
        video: { url: data.data.downloadUrl },
        caption: `> Knut XMD 🔥 CELEB EXPOSED\n\nTitre : \( {data.data.title || "Sans titre"}\nSource : \){APIS.celeb}`,
        mimetype: "video/mp4",
        gifPlayback: false
      }, { quoted: msg });

      return;
    }

    // ─── NAIJA (image ou vidéo) ─────────────────────────────────────
    if (type === "naija") {
      if (!data.success || !data.result) {
        throw new Error("Réponse API naija invalide");
      }

      const url = data.result;

      if (url.toLowerCase().endsWith('.mp4')) {
        await sock.sendMessage(from, { 
          video: { url },
          caption: `> Knut XMD 🍑 NAIJA LEAK\n\n${url}`,
          mimetype: "video/mp4",
          gifPlayback: false
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { 
          image: { url },
          caption: `> Knut XMD 🍑 NAIJA LEAK\n\n${url}`
        }, { quoted: msg });
      }
      return;
    }

    // ─── Images anime (ass, milf, hneko, hwaifu) ─────────────────────
    if (!data.success || !data.result) {
      throw new Error("Réponse API image invalide");
    }

    await sock.sendMessage(from, { 
      image: { url: data.result },
      caption: `> Knut XMD 🔞 ${type.toUpperCase()}\n\nImage aléatoire via PrinceTech API`
    }, { quoted: msg });

  } catch (e) {
    console.error(`[HENTAI - ${type.toUpperCase()}] Erreur :`, e.message || e);

    let errorMsg = "> Knut XMD ❌ Impossible de charger le contenu.\n\n" +
                   "Vérifie que :\n" +
                   "• L'API n'est pas down\n" +
                   "• Ta connexion est stable\n" +
                   "• Pas de restriction sur cette API";

    if (e.code === "ECONNABORTED" || e.message?.includes("timeout")) {
      errorMsg += "\n• Délai dépassé (API lente)";
    }

    await sock.sendMessage(from, { text: errorMsg });
  }
}