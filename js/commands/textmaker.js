import mumaker from 'mumaker';

export const name = "logo";
export const description = "Génère des effets texte / logos style ephoto360";
export const usage = "!logo <effet> <texte>\n!logo list → voir tous les effets disponibles";

const EFFECTS = {
  metallic:    "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html",
  ice:         "https://en.ephoto360.com/ice-text-effect-online-101.html",
  snow:        "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html",
  impressive:  "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html",
  matrix:      "https://en.ephoto360.com/matrix-text-effect-154.html",
  light:       "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
  neon:        "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
  devil:       "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html",
  purple:      "https://en.ephoto360.com/purple-text-effect-online-100.html",
  thunder:     "https://en.ephoto360.com/thunder-text-effect-online-97.html",
  leaves:      "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html",
  '1917':      "https://en.ephoto360.com/1917-style-text-effect-523.html",
  arena:       "https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html",
  hacker:      "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html",
  sand:        "https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html",
  glitch:      "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
  fire:        "https://en.ephoto360.com/flame-lettering-effect-372.html",
  dragonball:  "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html",
  foggyglass:  "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
  naruto:      "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html",
  typo:        "https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-811.html",
  frost:       "https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html",
  pixelglitch: "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html",
  neonglitch:  "https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html",
  america:     "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html",
  erase:       "https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html",
  blackpink:   "https://en.ephoto360.com/create-a-blackpink-neon-logo-text-effect-online-710.html",
  starwars:    "https://en.ephoto360.com/create-star-wars-logo-online-982.html",
  bearlogo:    "https://en.ephoto360.com/free-bear-logo-maker-online-673.html",
  graffiti:    "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
  futuristic:  "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
  clouds:      "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html",
  
  // Effets nécessitant 2 textes (séparés par |)
  pornhub:         "https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html",
  marvel:          "https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html",
  captainamerica:  "https://en.ephoto360.com/create-a-cinematic-captain-america-text-effect-online-715.html"
};

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0]) {
    await sock.sendMessage(from, { 
      text: "> Knut XMD ⚠️ Utilisation : !logo <effet> <texte>\n!logo list → voir tous les effets" 
    });
    return;
  }

  const effect = args[0].toLowerCase();
  const text = args.slice(1).join(" ").trim();

  if (effect === "list") {
    const effectsList = Object.keys(EFFECTS).join(", ");
    await sock.sendMessage(from, { 
      text: `> Knut XMD 🎨 Liste des effets disponibles :\n\n${effectsList}\n\nPour pornhub, marvel et captainamerica → utilise | pour séparer les deux textes\nExemple : !logo pornhub Steve | XMD` 
    });
    return;
  }

  if (!EFFECTS[effect]) {
    await sock.sendMessage(from, { 
      text: "> Knut XMD ❌ Cet effet n'existe pas.\nFais !logo list pour voir la liste complète." 
    });
    return;
  }

  if (!text) {
    await sock.sendMessage(from, { 
      text: `> Knut XMD ⚠️ Il manque le texte !\nExemple : !logo ${effect} Knut XMD` 
    });
    return;
  }

  try {
    await sock.sendMessage(from, { 
      react: { text: "🎨", key: msg.key } 
    });

    let result;

    // Gestion spéciale pour les effets à 2 textes
    if (["pornhub", "marvel", "captainamerica"].includes(effect)) {
      const parts = text.split("|").map(p => p.trim());
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        await sock.sendMessage(from, { 
          text: `> Knut XMD ⚠️ Cet effet nécessite deux textes séparés par |\nExemple : !logo ${effect} Premier | Second` 
        });
        return;
      }
      result = await mumaker.ephoto(EFFECTS[effect], [parts[0], parts[1]]);
    } else {
      result = await mumaker.ephoto(EFFECTS[effect], text);
    }

    if (!result || !result.image) {
      throw new Error("Aucune image retournée par l'API");
    }

    await sock.sendMessage(from, { 
      image: { url: result.image },
      caption: `> Knut XMD 🎨 Effet **\( {effect.toUpperCase()}** généré\nTexte : \){text}`
    }, { quoted: msg });

  } catch (e) {
    console.error("[LOGO - " + effect.toUpperCase() + "] Erreur :", e);

    let errorText = "> Knut XMD ❌ Impossible de générer l'effet.\n\n" +
                    "Vérifie que :\n" +
                    "• Le texte n'est pas trop long\n" +
                    "• L'API ephoto360 est accessible\n" +
                    "• mumaker est à jour\n" +
                    "• Ta connexion est stable";

    if (e.message && e.message.includes("timeout")) {
      errorText += "\n• Délai dépassé (API lente)";
    }

    await sock.sendMessage(from, { text: errorText });
  }
}