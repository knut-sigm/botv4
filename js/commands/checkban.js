const cache = new Map();

export const name = "checkban";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  // Extraction rapide
  const raw = args[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (!raw) return sock.sendMessage(from, { text: "📱 Format: !checkban 0612345678" }, { quoted: msg });
  
  const num = raw.replace(/\D/g, '')
    .replace(/^0(\d{9})$/, '33$1')
    .replace(/^(\d{9})$/, '33$1');
  
  if (num.length < 10) return sock.sendMessage(from, { text: "❌ Format invalide" }, { quoted: msg });
  
  const jid = `${num}@s.whatsapp.net`;
  const cacheKey = `check_${num}`;
  
  // Vérification cache (5 minutes)
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < 300000) {
    return sock.sendMessage(from, { text: cached.result }, { quoted: msg });
  }
  
  try {
    // Requête unique + timeout
    const exists = await Promise.race([
      sock.onWhatsApp(jid).then(r => r?.[0]?.exists),
      new Promise(resolve => setTimeout(() => resolve(null), 5000))
    ]);
    
    let result;
    if (exists === null) {
      result = `⚠️ *+${num}* - TIMEOUT\nVérification impossible`;
    } else if (!exists) {
      result = `🔴 *+${num}* - BANNI/SUPPRIMÉ\nLe numéro n'est pas sur WhatsApp`;
    } else {
      // Vérification rapide photo seulement
      const hasPic = await sock.profilePictureUrl(jid, 'image')
        .then(() => '✅').catch(() => '❌');
      
      result = `🟢 *+${num}* - ACTIF\n` +
               `Photo: ${hasPic}\n` +
               `Statut: Compte WhatsApp valide`;
    }
    
    // Cache le résultat
    cache.set(cacheKey, { time: Date.now(), result });
    
    await sock.sendMessage(from, { text: result }, { quoted: msg });
    
  } catch (e) {
    const result = `❌ *+${num}* - ERREUR\n` +
                   `Impossible de vérifier: ${e.message?.split(':')[0] || 'Inconnue'}`;
    
    await sock.sendMessage(from, { text: result }, { quoted: msg });
  }
}

// Nettoyage automatique du cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.time > 300000) cache.delete(key);
  }
}, 60000);