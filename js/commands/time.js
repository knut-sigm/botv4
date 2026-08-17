export const name = "time";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const city = args.join(" ") || "Paris";
    
    // API TimezoneDB
    const API_KEY = "TON_API_KEY";
    const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=city&city=${encodeURIComponent(city)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "OK") {
      const localTime = new Date(data.timestamp * 1000).toLocaleString('fr-FR');
      const reply = `> 🕐 Knut XMD : Heure ${data.cityName}
━━━━━━━━━━━━━━━━━━
🕐 Heure locale: ${localTime}
⌚ Fuseau: ${data.zoneName}
☀️ Décalage UTC: ${data.gmtOffset/3600}h`;
      await sock.sendMessage(from, { text: reply }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: "> Knut XMD : Ville non trouvée." }, { quoted: msg });
    }
    
  } catch (err) {
    console.error("Erreur time :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service heure indisponible." }, { quoted: msg });
  }
}