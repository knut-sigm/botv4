export const name = "muscu";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const muscle = args[0]?.toLowerCase() || "biceps";
    
    // API ExercisesDB (gratuit)
    const url = `https://exercisedb.p.rapidapi.com/exercises/target/${muscle}`;
    
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': 'TON_API_KEY',
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      await sock.sendMessage(from, { text: "> ❌ Knut XMD : Exercice non trouvé." }, { quoted: msg });
      return;
    }
    
    const exercise = data[0];
    
    const reply = `> 🏋️ Knut XMD : ${exercise.name}
━━━━━━━━━━━━━━━━━━
🎯 Cible: ${exercise.target}
💪 Muscle: ${exercise.bodyPart}
🎭 Équipement: ${exercise.equipment}
📝 Instructions: ${exercise.instructions?.split('.')[0] || "N/A"}...
🔗 Gif: ${exercise.gifUrl}`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
    
  } catch (err) {
    console.error("Erreur exercise :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service exercices indisponible." }, { quoted: msg });
  }
}