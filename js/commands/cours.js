export const name = "cours";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const sujet = args.join(" ") || "programmation";
    
    // API Coursera Catalog (gratuit)
    const url = `https://api.coursera.org/api/courses.v1?q=search&query=${encodeURIComponent(sujet)}&limit=3`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      await sock.sendMessage(from, { text: "> ❌ Knut XMD : Aucun cours trouvé." }, { quoted: msg });
      return;
    }
    
    let reply = `> 🎓 Knut XMD : Cours ${sujet}\n━━━━━━━━━━━━━━━━━━\n\n`;
    
    data.elements.slice(0, 3).forEach((cours, i) => {
      reply += `📚 ${i+1}. ${cours.name}\n`;
      reply += `🏫 Université: ${cours.partnerNames?.[0] || "Divers"}\n`;
      reply += `⭐ Note: ${cours.averageRating || "N/A"}/5\n`;
      reply += `🎯 Niveau: ${cours.difficultyLevel || "Débutant"}\n`;
      reply += `🔗 https://www.coursera.org/learn/${cours.slug}\n`;
      reply += `━━━━━━━━━━━━━━━━━━\n`;
    });
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur coursera :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service Coursera indisponible." }, { quoted: msg });
  }
}