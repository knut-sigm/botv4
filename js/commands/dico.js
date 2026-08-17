export const name = "dico";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    if (!args.length) {
      await sock.sendMessage(from, { 
        text: "> 📖 Knut XMD : Usage: !dico <mot>\nEx: !dict algorithm" 
      }, { quoted: msg });
      return;
    }
    
    const word = args[0];
    
    // API Free Dictionary
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data[0]) {
      const entry = data[0];
      let reply = `> 📖 Knut XMD : ${entry.word}\n━━━━━━━━━━━━━━━━━━\n`;
      
      entry.meanings.slice(0, 2).forEach((meaning, i) => {
        reply += `📚 ${meaning.partOfSpeech}\n`;
        meaning.definitions.slice(0, 2).forEach((def, j) => {
          reply += `  ${j+1}. ${def.definition.substring(0, 100)}\n`;
        });
        reply += `━━━━━━━━━━━━━━━━━━\n`;
      });
      
      await sock.sendMessage(from, { text: reply }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: "> Knut XMD : Mot non trouvé." }, { quoted: msg });
    }
    
  } catch (err) {
    console.error("Erreur dict :", err);
    await sock.sendMessage(from, { text: "> Knut XMD : Service dictionnaire indisponible." }, { quoted: msg });
  }
}