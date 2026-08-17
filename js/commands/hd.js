import axios from 'axios';

export const name = "hd";
export const aliases = ["enhance", "upscale", "quality"];
export const description = "Améliore une image en qualité HD avec IA";
export const category = "image";
export const cooldown = 30;

// Configuration API (remplacez par votre clé)
const DEENIO_API = 'https://api.deenio.com/upscale';
const API_KEY = 'VOTRE_CLE_API_ICI'; // À remplacer

export async function execute(sock, msg, args) {
  let sentMsg = null;
  
  try {
    const from = msg.key.remoteJid;
    
    // Message de traitement
    sentMsg = await sock.sendMessage(from, {
      text: "> Knut XMD: ⚡ Amélioration HD en cours..."
    }, { quoted: msg });
    
    const startTime = Date.now();
    
    // Vérifier la clé API
    if (API_KEY === 'VOTRE_CLE_API_ICI') {
      await sock.sendMessage(from, {
        text: "> Knut XMD: ⚠️ API non configurée !\n> Obtenez une clé sur deenio.com et modifiez API_KEY",
        edit: sentMsg.key
      });
      return;
    }
    
    let imageUrl;
    
    // Si URL fournie
    if (args.length > 0) {
      const url = args.join(' ');
      try {
        new URL(url);
        imageUrl = url;
      } catch {
        await sock.sendMessage(from, {
          text: "> Knut XMD: ❌ URL invalide !\n> Utilisez: .hd <url> ou répondez à une image",
          edit: sentMsg.key
        });
        return;
      }
    } else {
      // Vérifier si c'est une réponse à une image
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = msg.message.extendedTextMessage.contextInfo;
        
        if (quoted.quotedMessage?.imageMessage) {
          try {
            imageUrl = await downloadImageUrl(sock, quoted.quotedMessage.imageMessage, from);
          } catch (e) {
            console.error("❌ Erreur téléchargement image:", e);
          }
        }
      }
      
      // Vérifier si le message contient une image
      if (!imageUrl && msg.message?.imageMessage) {
        try {
          imageUrl = await downloadImageUrl(sock, msg.message.imageMessage, from);
        } catch (e) {
          console.error("❌ Erreur téléchargement image:", e);
        }
      }
      
      if (!imageUrl) {
        await sock.sendMessage(from, {
          text: "> Knut XMD: ❌ Aucune image trouvée !\n> Répondez à une image ou fournissez une URL",
          edit: sentMsg.key
        });
        return;
      }
    }
    
    // Appel API Deenio
    let response;
    try {
      response = await axios.post(DEENIO_API, {
        api_key: API_KEY,
        image_url: imageUrl,
        scale: 2
      }, {
        responseType: 'arraybuffer',
        timeout: 45000
      });
    } catch (apiErr) {
      console.error("❌ Erreur API Deenio:", apiErr);
      
      let errorMsg = "> Knut XMD: ❌ Échec de l'amélioration HD";
      
      if (apiErr.response?.status === 429) {
        errorMsg += "\n> ⚠️ Limite de requêtes atteinte";
      } else if (apiErr.response?.status === 401) {
        errorMsg += "\n> 🔧 Clé API invalide";
      } else if (apiErr.code === 'ECONNABORTED') {
        errorMsg += "\n> ⏱️ Délai dépassé";
      } else {
        errorMsg += `\n> 📝 ${apiErr.message?.substring(0, 40)}...`;
      }
      
      await sock.sendMessage(from, {
        text: errorMsg,
        edit: sentMsg.key
      });
      return;
    }
    
    // Vérifier la réponse
    if (!response.headers['content-type']?.includes('image')) {
      await sock.sendMessage(from, {
        text: "> Knut XMD: ❌ L'API n'a pas retourné d'image valide",
        edit: sentMsg.key
      });
      return;
    }
    
    const imageBuffer = Buffer.from(response.data);
    
    if (imageBuffer.length === 0) {
      await sock.sendMessage(from, {
        text: "> Knut XMD: ❌ Image vide reçue",
        edit: sentMsg.key
      });
      return;
    }
    
    // Calcul des statistiques
    const latency = Date.now() - startTime;
    const fileSizeMB = imageBuffer.length / (1024 * 1024);
    const status = latency < 5000 ? "🟢" : latency < 15000 ? "🟡" : "🔴";
    
    // Envoyer l'image améliorée
    await sock.sendMessage(from, {
      image: imageBuffer,
      caption: `> Knut XMD: ✅ Image HD améliorée\n> ⚡ ${latency}ms ${status}\n> 📦 ${fileSizeMB.toFixed(1)}MB\n> ✨ Qualité 2x`
    });
    
    // Message bilan final
    await sock.sendMessage(from, {
      text: `> Knut XMD: ✅ Traitement terminé\n> ⚡ ${latency}ms ${status}\n> 📦 ${fileSizeMB.toFixed(1)}MB`,
      edit: sentMsg.key
    });
    
  } catch (err) {
    console.error("❌ Erreur hd :", err);
    
    const errorMsg = `> Knut XMD: ❌ Erreur inattendue\n> 📝 ${err.message?.substring(0, 50) || "Erreur technique"}`;
    
    if (sentMsg) {
      try {
        await sock.sendMessage(msg.key.remoteJid, {
          text: errorMsg,
          edit: sentMsg.key
        });
      } catch (e) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: errorMsg
        }, { quoted: msg });
      }
    } else {
      await sock.sendMessage(msg.key.remoteJid, {
        text: errorMsg
      }, { quoted: msg });
    }
  }
}

/**
 * Télécharge une image WhatsApp et retourne une URL temporaire
 */
async function downloadImageUrl(sock, imageMessage, from) {
  return new Promise((resolve, reject) => {
    // Pour WhatsApp Web, vous pouvez obtenir l'URL directement
    if (imageMessage.url) {
      resolve(imageMessage.url);
    } else {
      // Sinon, télécharger le buffer
      sock.downloadMediaMessage(imageMessage)
        .then(async (buffer) => {
          if (!buffer) {
            reject(new Error("Buffer vide"));
            return;
          }
          
          // Ici vous devriez uploader le buffer vers un service d'hébergement
          // Pour l'exemple, on retourne une fausse URL
          // En production, utilisez un service comme imgur, telegraph, etc.
          reject(new Error("Upload vers hébergeur requis"));
        })
        .catch(reject);
    }
  });
}

/**
 * Fonction alternative pour télécharger l'image
 */
async function downloadImageBuffer(sock, imageMessage) {
  try {
    const buffer = await sock.downloadMediaMessage(imageMessage);
    if (!buffer || buffer.length === 0) {
      throw new Error("Image vide");
    }
    return buffer;
  } catch (error) {
    throw new Error(`Téléchargement échoué: ${error.message}`);
  }
}

// Version simplifiée si vous voulez accepter seulement les URLs
export async function executeSimple(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  // Message de traitement
  const sentMsg = await sock.sendMessage(from, {
    text: "> Knut XMD: ⚡ Amélioration HD en cours..."
  }, { quoted: msg });
  
  const startTime = Date.now();
  
  // Vérifier l'URL
  if (args.length === 0) {
    await sock.sendMessage(from, {
      text: "> Knut XMD: ❌ URL requise !\n> Usage: .hd <url-image>",
      edit: sentMsg.key
    });
    return;
  }
  
  const url = args.join(' ');
  
  try {
    new URL(url);
  } catch {
    await sock.sendMessage(from, {
      text: "> Knut XMD: ❌ URL invalide !",
      edit: sentMsg.key
    });
    return;
  }
  
  try {
    const response = await axios.post(DEENIO_API, {
      api_key: API_KEY,
      image_url: url,
      scale: 2
    }, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const latency = Date.now() - startTime;
    const imageBuffer = Buffer.from(response.data);
    const fileSizeMB = imageBuffer.length / (1024 * 1024);
    const status = latency < 5000 ? "🟢" : latency < 15000 ? "🟡" : "🔴";
    
    // Envoyer l'image
    await sock.sendMessage(from, {
      image: imageBuffer,
      caption: `> Knut XMD: ✅ Image HD améliorée\n> ⚡ ${latency}ms ${status}\n> 📦 ${fileSizeMB.toFixed(1)}MB`
    });
    
    // Bilan final
    await sock.sendMessage(from, {
      text: `> Knut XMD: ✅ Traitement terminé\n> ⚡ ${latency}ms ${status}\n> 📦 ${fileSizeMB.toFixed(1)}MB`,
      edit: sentMsg.key
    });
    
  } catch (err) {
    console.error("❌ Erreur hd :", err);
    
    let errorMsg = "> Knut XMD: ❌ Échec de l'amélioration";
    if (err.response?.status === 429) {
      errorMsg += "\n> ⚠️ Trop de requêtes";
    }
    
    await sock.sendMessage(from, {
      text: errorMsg,
      edit: sentMsg.key
    });
  }
}