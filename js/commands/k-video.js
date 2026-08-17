import axios from "axios";

export const name = "k-video";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    // Récupération du texte envoyé ou cité
    const textMsg =
      msg.message?.conversation?.trim() ||
      msg.message?.extendedTextMessage?.text?.trim() ||
      msg.message?.imageMessage?.caption?.trim() ||
      msg.message?.videoMessage?.caption?.trim() ||
      "";

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";

    // Détermination du prompt à utiliser
    const used = (textMsg.split(/\s+/)[0] || ".sora");
    const prompt = textMsg.slice(used.length).trim() || quotedText;

    if (!prompt) {
      await sock.sendMessage(from, {
        text: `> Knut XMD :⚠️ Fournis une description pour générer la vidéo.\n\n> Exemple : . k-video anime girl with short blue hair`
      }, { quoted: msg });
      return;
    }

    // Message initial
    await sock.sendMessage(from, {
      text: `> ╔════Knut XMD════╗
> ➤ Génération de la vidéo...
> ➤ Objectif  : ${prompt}
> ╚═══════════════╝`
    }, { quoted: msg });

    // Requête vers l’API Sora
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(prompt)}`;
    const { data } = await axios.get(apiUrl, {
      timeout: 120000,
      headers: { "User-Agent": "Mozilla/5.0 (KnutMD)" }
    });

    // Vérification du résultat
    const videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;
    if (!videoUrl) throw new Error("Aucune vidéo trouvée dans la réponse de l’API.");

    // Envoi du résultat
    await sock.sendMessage(from, {
      video: { url: videoUrl },
      mimetype: "video/mp4",
      caption: `> 🎬 **Vidéo générée par Knut XMD*\n> 🐺 Objectif : ${prompt}`
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur K12 :", err?.message || err);
    await sock.sendMessage(from, {
      text: `> ⚠️ KNUT XMD: Échec de la génération vidéo.\n> Réessaie avec un autre prompt.`
    }, { quoted: msg });
  }
}