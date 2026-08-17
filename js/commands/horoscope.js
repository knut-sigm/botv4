export const name = "horoscope";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const sign = args[0]?.toLowerCase() || "taurus";
    
    // API Aztro (gratuit)
    const url = `https://aztro.sameerkumar.website/?sign=${sign}&day=today`;
    
    const response = await fetch(url, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    const signs = {
      "aries": "♈ Bélier",
      "taurus": "♉ Taureau",
      "gemini": "♊ Gémeaux",
      "cancer": "♋ Cancer",
      "leo": "♌ Lion",
      "virgo": "♍ Vierge",
      "libra": "♎ Balance",
      "scorpio": "♏ Scorpion",
      "sagittarius": "♐ Sagittaire",
      "capricorn": "♑ Capricorne",
      "aquarius": "♒ Verseau",
      "pisces": "♓ Poissons"
    };
    
    const reply = `> 🌌 Knut XMD : ${signs[sign] || sign}
━━━━━━━━━━━━━━━━━━
📅 Date: ${data.current_date}
🌟 Couleur: ${data.color}
📊 Compatibilité: ${data.compatibility}
🎯 Humeur: ${data.mood}
💫 Chance: ${data.lucky_number}
⏱️ Heure: ${data.lucky_time}
📝 Prediction: ${data.description}`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur horoscope :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service horoscope indisponible." }, { quoted: msg });
  }
}