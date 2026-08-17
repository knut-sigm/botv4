import fetch from "node-fetch";

export const name = "img";

export async function execute(sock, msg, args, prefix = ".") {
  const from = msg.key.remoteJid;

  try {
    // 🧠 Vérifier si un mot-clé est fourni
    if (!args[0]) {
      await sock.sendMessage(from, {
        text: `${prefix}Utilisation : .img <mot-clé> [nombre]\n\nExemples :\n• .img naruto\n• .img voiture 5`
      }, { quoted: msg });
      return;
    }

    // 🧩 Extraire le mot-clé et le nombre d’images
    const lastArg = args[args.length - 1];
    const count = !isNaN(lastArg) ? Math.min(parseInt(lastArg), 10) : 5; // max 10, par défaut 5
    const query = !isNaN(lastArg) ? args.slice(0, -1).join(" ") : args.join(" ");

    await sock.sendMessage(from, {
      text: `> Knut XMD ${prefix}Recherche de *${count}* image(s) pour : *${query}*...\n> ⏳ Veuillez patienter...`
    }, { quoted: msg });

    // 🌐 Requête vers Bing Images
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`;
    const res = await fetch(bingUrl);
    const html = await res.text();

    // 📸 Extraire les URLs d’images valides
    const imageUrls = [...html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)]
      .map(m => m[1])
      .filter(u => u.startsWith("http"));

    if (imageUrls.length === 0) {
      await sock.sendMessage(from, {
        text: `${prefix}Aucune image trouvée pour : *${query}*.`
      }, { quoted: msg });
      return;
    }

    // 🖼️ Envoi des images
    const imagesToSend = imageUrls.slice(0, count);
    let sent = 0;

    for (const img of imagesToSend) {
      try {
        const response = await fetch(img);
        const buffer = Buffer.from(await response.arrayBuffer());

        // 🔍 Ignorer les miniatures trop petites
        if (buffer.length < 5000) continue;

        await sock.sendMessage(from, {
          image: buffer,
          caption: `> Knut XMD: 🖼️ *${query}* (${sent + 1}/${count})`
        }, { quoted: msg });

        sent++;
        await new Promise(r => setTimeout(r, 1000)); // délai 1s entre envois
      } catch (e) {
        console.error("Erreur image :", e.message);
      }
    }

    // ✅ Résumé final
    if (sent === 0) {
      await sock.sendMessage(from, {
        text: `> Knut XMD: ${prefix}Aucune image valide trouvée.`
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, {
        text: `> Knut XMD: ${prefix}${sent}/${count} image(s) envoyée(s) pour *${query}*.`
      }, { quoted: msg });
      console.log(`✅ ${sent}/${count} images envoyées pour "${query}"`);
    }

  } catch (err) {
    console.error("❌ Erreur .img :", err);
    await sock.sendMessage(from, {
      text: `${prefix}Une erreur est survenue lors de la recherche d'image.`
    }, { quoted: msg });
  }
}