export const name = "car";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const marque = args[0] || "Toyota";
    const modele = args[1] || "Corolla";
    
    // API CarsXE (gratuit 500 req/mois)
    const API_KEY = "TON_API_KEY";
    const url = `https://api.carsxe.com/specs?key=${API_KEY}&make=${marque}&model=${modele}&year=2020`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.specs) {
      await sock.sendMessage(from, { text: "> ❌ Knut XMD : Voiture non trouvée." }, { quoted: msg });
      return;
    }
    
    const spec = data.specs[0];
    
    const reply = `> 🚗 Knut XMD : ${spec.make} ${spec.model}
━━━━━━━━━━━━━━━━━━
📅 Année: ${spec.year}
⚙️ Moteur: ${spec.engine}
⛽ Carburant: ${spec.fuel_type}
🐎 Puissance: ${spec.horsepower} hp
⚡ Transmission: ${spec.transmission}
🏁 0-100 km/h: ${spec.zero_to_sixty_mph || "N/A"} sec
💰 Prix estimé: $${spec.price || "N/A"}`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur car :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service voitures indisponible." }, { quoted: msg });
  }
}