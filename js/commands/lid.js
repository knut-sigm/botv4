export const name = "lid";
export const aliases = ["jid", "id"];
export async function execute(sock, m, args) {
  try {
    let userJid;
    let userName = "Utilisateur";
    
    // Si un utilisateur est mentionné
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentions.length > 0) {
      // Utiliser la première mention
      userJid = mentions[0];
      
      // Essayer de récupérer le nom du contact mentionné
      try {
        const contact = await sock.onWhatsApp(userJid);
        if (contact && contact[0] && contact[0].name) {
          userName = contact[0].name;
        }
      } catch (e) {
        // Garder "Utilisateur" par défaut
      }
    } 
    // Si un argument est fourni (numéro)
    else if (args.length > 0) {
      let input = args[0].trim();
      
      // Si c'est une mention via @
      if (input.startsWith('@')) {
        const mentionedNumber = input.substring(1);
        userJid = `${mentionedNumber}@s.whatsapp.net`;
      } 
      // Si c'est un numéro
      else {
        // Nettoyer le numéro
        const cleanedNumber = input.replace(/[^0-9]/g, '');
        userJid = `${cleanedNumber}@s.whatsapp.net`;
      }
      
      // Essayer de récupérer le nom
      try {
        const contact = await sock.onWhatsApp(userJid);
        if (contact && contact[0] && contact[0].name) {
          userName = contact[0].name;
        }
      } catch (e) {
        // Garder "Utilisateur" par défaut
      }
    } 
    // Si aucun argument, utiliser l'expéditeur du message
    else {
      userJid = m.key.participant || m.key.remoteJid;
      
      // Récupérer le nom de l'expéditeur
      try {
        const contact = await sock.onWhatsApp(userJid);
        if (contact && contact[0] && contact[0].name) {
          userName = contact[0].name;
        }
      } catch (e) {
        // Garder "Utilisateur" par défaut
      }
    }

    // Format simple et direct
    const numéro = userJid.split('@')[0];
    const message = `> Knut XMD : ${userName} + ${numéro}\nLID: ${userJid}`;

    await sock.sendMessage(
      m.key.remoteJid,
      { text: message },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `❌ Erreur : ${e.message}` },
      { quoted: m }
    );
  }
}