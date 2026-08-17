import axios from "axios";

export const name = "imagine";
export const description = "Génère une image à partir d’un prompt via AI";
export const category = "🎨 AI";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const rawText = args.join(" ").trim() || 
                    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation?.trim() ||
                    '';

    if (!rawText) {
      await sock.sendMessage(from, {
        text: `> ⚠️ Knut XMD: Exemple : .imagine un coucher de soleil sur les montagnes`
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(from, { text: "🎨 Génération de l'image en cours..." }, { quoted: msg });

    // Amélioration du prompt
    const prompt = enhancePrompt(rawText);

    // Appel API
    const response = await axios.get(`https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(prompt)}`, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "StPatrickMD/1.0" }
    });

    const imageBuffer = Buffer.from(response.data);

    const replyCaption = `> ╔════ Knut XMD ════╗
>  Imagine : ${rawText}
> ╚════════════════╝`;

    await sock.sendMessage(from, {
      image: imageBuffer,
      caption: replyCaption
    }, { quoted: msg });

  } catch (error) {
    console.error("❌ Erreur Imagine:", error);
    await sock.sendMessage(from, {
      text: `> Knut XMD:⚠️ Erreur\n> Impossible de générer l'image. Réessayez plus tard.`
    }, { quoted: msg });
  }
};

// Fonction pour améliorer le prompt avec des mots-clés qualité
function enhancePrompt(prompt) {
  const qualityEnhancers = [
    "high quality",
    "detailed",
    "masterpiece",
    "best quality",
    "ultra realistic",
    "4k",
    "highly detailed",
    "professional photography",
    "cinematic lighting",
    "sharp focus"
  ];

  const numEnhancers = Math.floor(Math.random() * 2) + 3; // 3 ou 4 mots-clés
  const selectedEnhancers = qualityEnhancers
    .sort(() => Math.random() - 0.5)
    .slice(0, numEnhancers);

  return `${prompt}, ${selectedEnhancers.join(", ")}`;
}