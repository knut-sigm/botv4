export const name = "definition";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    if (!args.length) {
      await sock.sendMessage(from, { 
        text: "> 📚 Knut XMD : Usage: !definition <mot>\nEx: !definition algorithm" 
      }, { quoted: msg });
      return;
    }
    
    const mot = args[0];
    
    // API DictionaryAPI
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${mot}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data[0]) {
      const entry = data[0];
      let reply = `> 📚 Knut XMD : ${entry.word}\n━━━━━━━━━━━━━━━━━━\n`;
      
      entry.meanings.slice(0, 2).forEach((meaning, i) => {
        reply += `📖 ${meaning.partOfSpeech}\n`;
        meaning.definitions.slice(0, 2).forEach((def, j) => {
          reply += `  ${j+1}. ${def.definition}\n`;
          if (def.example) reply += `    Ex: "${def.example}"\n`;
        });
        reply += `━━━━━━━━━━━━━━━━━━\n`;
      });
      
      if (entry.phonetic) {
        reply += `🔊 Phonétique: ${entry.phonetic}\n`;
      }
      
      await sock.sendMessage(from, { text: reply }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: "> ❌ Knut XMD : Mot non trouvé." }, { quoted: msg });
    }
    
  } catch (err) {
    console.error("Erreur definition :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service dictionnaire indisponible." }, { quoted: msg });
  }
}