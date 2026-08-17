// 📁 commands/apk.js
export default {
  name: 'apk',
  description: 'Recherche des APK sur différents stores',
  category: '📥 Téléchargement',

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
      if (!args || args.length === 0) {
        return await sock.sendMessage(from, {
          text: `> Knut XMD:❌ Usage:.apk <nom de l'application>\n\nExemple: .apk WhatsApp`,
        }, { quoted: msg });
      }

      const query = args.join(' ');

      // 🌐 Liens de recherche
      const playStoreUrl = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`;
      const apkpureUrl = `https://apkpure.com/search?q=${encodeURIComponent(query)}`;
      const apkmirrorUrl = `https://www.apkmirror.com/?s=${encodeURIComponent(query)}`;
      const uptodownUrl = `https://en.uptodown.com/android/search/${encodeURIComponent(query)}`;
      const happymodUrl = `https://www.happymod.com/search.html?q=${encodeURIComponent(query)}`;
      const apkmonkUrl = `https://www.apkmonk.com/search/?q=${encodeURIComponent(query)}`;
      const aptoideUrl = `https://en.aptoide.com/search/${encodeURIComponent(query)}`;
      const apksfreeUrl = `https://apksfree.com/search/${encodeURIComponent(query)}/`;
      const epicGamesUrl = `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(query)}`;
      const mobogenieUrl = `https://mobogenie.com/search/${encodeURIComponent(query)}.html`;

      // 🧾 Message stylisé avec contours identiques au ping
      const reply = `> Knut XMD:
> ╔════ 𝗔𝗣𝗞 𝗦𝗘𝗔𝗥𝗖𝗛 ════╗
> 🔍 *Requête:* ${query}
> 🎮 *STORES OFFICIELS*
>  Play Store:
> ${playStoreUrl}
> ╚═══════════════════╝`;

      await sock.sendMessage(from, { text: reply }, { quoted: msg });

    } catch (error) {
      console.error('Erreur APK:', error);
      await sock.sendMessage(from, {
        text: `> ⚠️ *Erreur*\n> Impossible de générer les liens de recherche.`,
      }, { quoted: msg });
    }
  },
};