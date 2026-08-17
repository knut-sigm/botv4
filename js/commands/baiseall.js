export const name = "baiseall";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // Uptime du bot
    const totalSeconds = process.uptime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    const text = `
╔════════════════════════╗
     🤤🍆 𝐊𝐍𝐔𝐓-𝐗𝐌𝐃 🍑🤤
╚════════════════════════╝

> 🜂 *État du Système* : Excité  
> ⚙️ Uptime : ${uptime}  
> 🕯️ Énergie : Flux magnétique — synchronisé-sensuel 
> 🧠 Canal psychique : Actif  

> 🌑 Portails de Connexion sensuelle :

www.4tube.com
www.8teenxxx.com
www.alotporn.com
www.beeg.com
www.bustnow.com
www.cliphunter.com
www.definebabes.com
www.deviantclip.com
www.drtuber.com
www.empflix.com
www.fantasti.cc
www.fapdu.com
www.freeporn.com
www.freudbox.com
www.fuq.com
www.fux.com
www.grayvee.com
www.hellxx.com
www.hustlertube.com
www.jugy.com
www.jizzhut.com
www.kaktuz.com
www.keezmovies.com
www.kinxxx.com
www.laraporn.com
www.leakedporn.com
www.lovelyclips.com
www.lubetube.com
www.mofosex.com
www.monstertube.com
www.madthumbs.com
www.moviefap.com
www.moviesand.com
www.orgasm.com
www.perfectgirls.net
www.pichunter.com
www.planetsuzy.com
www.porn.com
www.porn-plus.com
www.porncor.com
www.pornhub.com
www.pornrabbit.com
www.porntitan.com
www.pussy.org
www.redtube.com
www.tube8.com
www.xhamster.com
www.xnxx.com
www.xvideos.com
www.youjizz.com
www.hentaigasm.com
Ianimes.co
www.hentaicorner.fr

> “Baisons vivant... La mort arrive ”  
>  𝐊𝐍𝐔𝐓 𝐗𝐌𝐃`;

    await sock.sendMessage(
      from,
      {
        image: { url: "https://files.catbox.moe/o18xsa.jpg" },
        caption: text,
        gifPlayback: true
      },
      { quoted: msg }
    );

    await sock.sendMessage(
      from,
      {
        audio: { url: "https://files.catbox.moe/tg7tv6.mp3" },
        mimetype: "audio/mpeg"
      },
      { quoted: msg }
    );

  } catch (err) {
    console.error("❌ Erreur commande baiseall :", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "⚠️ Perturbation du champ hypnotique détectée." },
      { quoted: msg }
    );
  }
}