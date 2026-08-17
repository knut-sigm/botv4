export const name = "translate";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    if (args.length < 2) {
      await sock.sendMessage(from, { 
        text: "> 🌍 Knut XMD : Usage: !translate <langue_cible> <texte>\nEx: !translate es Hello world" 
      }, { quoted: msg });
      return;
    }
    
    const targetLang = args[0];
    const text = args.slice(1).join(" ");
    
    // API MyMemory (gratuit, sans clé)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const reply = `> 🌍 Knut XMD : Traduction
━━━━━━━━━━━━━━━━━━
📝 Original (EN): ${text}
✅ Traduit (${targetLang.toUpperCase()}): ${data.responseData.translatedText}
🎯 Match: ${data.responseData.match}%`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur translate :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service traduction indisponible." }, { quoted: msg });
  }
}