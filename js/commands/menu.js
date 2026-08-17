export const name = "menu";
import fs from "fs";
import path from "path";

export async function execute(sock, msg, args) {

  try {

    const from = msg.key.remoteJid;

    let thumbBuffer;
    try {
      thumbBuffer = fs.readFileSync(path.resolve("./knut.jpg"));
    } catch (err) {
      console.error("❌ knut.jpg not found:", err.message);
      thumbBuffer = null;
    }

    // Uptime du bot
    const totalSeconds = process.uptime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    const text = `> ╔════════════════════╗
    🐺⚫ KNUT-XMD V4 ⚫🐺
> ╚════════════════════╝

> 🥷🏾 *Utilisateur* : ${msg.pushName || "Invité"}
> ⚙️ *Mode*        : 🔒 Privé
> ⏱️ *Uptime*      : ${uptime}
> 📱 *Version*     : 4.0
> 🧎🏾 *Développeur* : _Knut_

> ╔──────XMD───────╗
> ➤ bugmenu 
> ╚────────────────╝

> ╔────── IA ──────╗
> ➤ knut (question)
> ➤ imagine 
> ➤ k-video
> ➤ knutts
> ➤ ai
> ➤ knutchat
> ➤ knuta
> ╚────────────────╝

> ╔──── UTILITY ─────╗
> ➤ anime-stick
> ➤ anime-quote
> ➤ artist
> ➤ calc
> ➤ car
> ➤ cours
> ➤ dico
> ➤ fact
> ➤ film
> ➤ horoscope
> ➤ prefix
> ➤ delete
> ➤ vv
> ➤ vv2
> ➤ device
> ➤ countryinfos
> ➤ infos
> ➤ take
> ➤ lid
> ➤ meteo
> ➤ muscu
> ➤ podcast
> ➤ textpro
> ➤ translate
> ➤ time
> ➤ lyrics 
> ➤ lyrics2
> ➤ ping
> ➤ whois
> ➤ autoreact
> ➤ setpp
> ╚─────────────────╝

> ╔────── SUDO ──────╗
> ➤ delsudo
> ➤ listsudo
> ➤ setsudo
> ╚─────────────────╝

> ╔───── GROUPS ─────╗
> ➤ add
> ➤ audiorespons
> ➤ demote @
> ➤ demoteall
> ➤ gclink
> ➤ infosgroups
> ➤ kick @
> ➤ kickall
> ➤ left
> ➤ listonline
> ➤ mute
> ➤ unmute
> ➤ manga
> ➤ mute-time
> ➤ promote @
> ➤ promoteall
> ➤ purge
> ➤ principal 
> ➤ setppg
> ➤ setrespons
> ➤ settimeg 
> ➤ soulmate
> ➤ tag
> ➤ tagadmin
> ➤ tagall
> ➤ writetoall
> ➤ wasted
> ➤ welcome 
> ➤ goodbye 
> ╚──────────────────╝

> ╔──── DOWNLOAD ────╗
> ➤ anime
> ➤ img
> ➤ itunes
> ➤ play
> ➤ apk
> ➤ tiktok
> ➤ Instagram 
> ➤ down-url
> ➤ url
> ➤ youtube 
> ➤ yt
> ➤ telegram-stick
> ╚──────────────────╝

> ╔───── SECURITY ─────╗
> ➤ block
> ➤ unblock
> ➤ autoblock
> ➤ antibot
> ➤ antilink
> ➤ antimessage 
> ➤ antivoice 
> ➤ antiaudio 
> ➤ antisticker 
> ➤ protectionstate
> ╚───────────────────╝

> ╔───── MEDIAS ─────╗
> ➤ photo
> ➤ save
> ➤ sticker
> ➤ static-stick
> ➤ logo
> ➤ tts
> ➤ tomp4
> ╚──────────────────╝

> ╔─────────FUN───────╗
> ➤ anime
> ➤ baiseall
> ➤ blur
> ➤ hentai
> ➤ xvid
> ➤ xxx
> ╚───────────────────╝

> Dev  Knut`;

    // Envoi du menu avec image + voir la chaîne
    await sock.sendMessage(
      from,
      {
        image: { url: "https://files.catbox.moe/5t635s.jpg" },
        caption: text,
        gifPlayback: true,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363422093642600@newsletter",
            newsletterName: "Knut XMD"
          },
          externalAdReply: {
            title: "⚫ KNUT-XMD-V4",
            body: "Rejoignez nous ici !!!",
            mediaType: 1,
            thumbnail: thumbBuffer,
            renderLargerThumbnail: false,
            mediaUrl: "./knut.jpg",
            sourceUrl: "./knut.jpg",
            thumbnailUrl: "https://whatsapp.com/channel/0029Vb75xwOADTOBVjSgJV0k"
          }
        }
      },
      { quoted: msg }
    );

    // Envoi de l'audio (sans contextInfo)
    await sock.sendMessage(
      from,
      {
        audio: { url: "./knut.jpg" },
        mimetype: "audio/mpeg"
      },
      { quoted: msg }
    );

  } catch (err) {

    console.error("❌ Erreur commande menu :", err);

    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "> ⚠️ Impossible d'afficher le menu." },
      { quoted: msg }
    );

  }

}
