import { getDevice } from "baileys";

export const name = "devicegc";
export const aliases = ["devices", "statsdevice"];

// Cache pour éviter de scanner plusieurs fois les mêmes messages
const deviceCache = new Map();

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifier que c'est bien un groupe
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(
      from,
      { text: "> Knut XMD : Cette commande fonctionne uniquement dans les groupes." },
      { quoted: msg }
    );
    return;
  }

  try {
    await sock.sendMessage(
      from,
      { text: "> 📱 Knut XMD : Analyse des appareils en cours...\nRécupération des 1000 derniers messages... ⏳" },
      { quoted: msg }
    );

    // Récupérer les infos du groupe
    const groupInfo = await sock.groupMetadata(from);
    const participants = groupInfo.participants;
    
    // Objets pour stocker les statistiques
    const deviceStats = {
      ios: { count: 0, users: [] },
      android: { count: 0, users: [] },
      web: { count: 0, users: [] },
      desktop: { count: 0, users: [] },
      unknown: { count: 0, users: [] }
    };

    // Nouvelle méthode: Analyser les 1000 derniers messages du groupe
    const allMessages = await fetchLastMessages(sock, from, 1000);
    
    // Dictionnaire pour stocker le dernier appareil détecté par utilisateur
    const userLastDevice = new Map();
    
    // Analyser chaque message
    for (const message of allMessages) {
      try {
        const sender = message.key.participant || message.key.remoteJid;
        if (!sender) continue;
        
        // Obtenir le device de ce message
        const device = getDevice(message.key.id);
        
        if (device) {
          // Normaliser le nom du device
          const normalizedDevice = normalizeDevice(device);
          
          // Mettre à jour le dernier appareil connu pour cet utilisateur
          userLastDevice.set(sender, normalizedDevice);
        }
        
      } catch (error) {
        console.log("Erreur analyse message:", error.message);
      }
    }
    
    // Compiler les statistiques finales
    for (const participant of participants) {
      const userId = participant.id;
      const lastDevice = userLastDevice.get(userId);
      
      if (lastDevice && deviceStats[lastDevice]) {
        deviceStats[lastDevice].count++;
        deviceStats[lastDevice].users.push(userId.split('@')[0]);
      } else {
        deviceStats.unknown.count++;
        deviceStats.unknown.users.push(userId.split('@')[0]);
      }
    }

    // Nettoyer le cache périodiquement
    cleanupDeviceCache();

    // Calculer les pourcentages
    const totalAnalyzed = participants.length;
    const percentages = {};
    Object.keys(deviceStats).forEach(key => {
      percentages[key] = totalAnalyzed > 0 ? 
        ((deviceStats[key].count / totalAnalyzed) * 100).toFixed(1) : '0.0';
    });

    // Générer le rapport
    const report = generateDeviceReport(deviceStats, percentages, totalAnalyzed, allMessages.length);
    
    await sock.sendMessage(from, { text: report }, { quoted: msg });

    // Envoyer un graphique ASCII simple
    await sendAsciiChart(sock, from, deviceStats, percentages);

    // Envoyer des détails supplémentaires
    if (args.includes("details") || args.includes("détails")) {
      await sendUserDetails(sock, from, deviceStats);
    }

  } catch (error) {
    console.error("Erreur devicegc:", error);
    await sock.sendMessage(
      from,
      { text: "> ❌ Knut XMD : Erreur lors de l'analyse des appareils.\n" + error.message },
      { quoted: msg }
    );
  }
}

// Fonction pour récupérer les N derniers messages
async function fetchLastMessages(sock, groupId, limit = 1000) {
  const allMessages = [];
  let lastMessageId = null;
  let batchSize = 200; // Taille de chaque lot de messages
  
  try {
    await sock.sendMessage(
      groupId,
      { text: `> 📊 Récupération des messages : 0/${limit}` }
    );
    
    while (allMessages.length < limit) {
      try {
        // Récupérer un lot de messages
        const messages = await sock.loadMessages(groupId, batchSize, {
          before: lastMessageId
        });
        
        if (!messages || messages.length === 0) {
          break;
        }
        
        // Ajouter les messages au tableau
        allMessages.push(...messages);
        
        // Mettre à jour l'ID du dernier message pour la prochaine itération
        lastMessageId = messages[messages.length - 1]?.key?.id;
        
        // Mettre à jour le message de progression
        if (allMessages.length % 500 === 0) {
          await sock.sendMessage(
            groupId,
            { text: `> 📊 Récupération des messages : ${allMessages.length}/${limit}` }
          );
        }
        
        // Si nous avons récupéré moins de messages que demandé, c'est qu'il n'y en a plus
        if (messages.length < batchSize) {
          break;
        }
        
      } catch (error) {
        console.error("Erreur récupération messages:", error);
        break;
      }
    }
    
    // Limiter au nombre demandé
    return allMessages.slice(0, limit);
    
  } catch (error) {
    console.error("Erreur fetchLastMessages:", error);
    return [];
  }
}

// Normaliser les noms de devices
function normalizeDevice(deviceName) {
  const device = deviceName.toLowerCase();
  
  if (device.includes('ios') || device.includes('iphone') || device.includes('ipad') || device.includes('mac')) {
    return 'ios';
  } else if (device.includes('android') || device.includes('samsung') || device.includes('xiaomi') || 
             device.includes('google') || device.includes('huawei') || device.includes('oneplus')) {
    return 'android';
  } else if (device.includes('web') || device.includes('chrome') || device.includes('firefox') || device.includes('safari')) {
    return 'web';
  } else if (device.includes('desktop') || device.includes('windows') || device.includes('macos') || device.includes('linux')) {
    return 'desktop';
  }
  
  return 'unknown';
}

// Fonction pour générer le rapport amélioré
function generateDeviceReport(stats, percentages, totalMembers, totalMessages) {
  let report = `📱 *ANALYSE DÉTAILLÉE DES APPAREILS*\n\n`;
  report += `📊 *STATISTIQUES GÉNÉRALES*\n`;
  report += `👥 Membres du groupe : ${totalMembers}\n`;
  report += `💬 Messages analysés : ${totalMessages}\n`;
  report += `📅 Période : Derniers 1000 messages\n\n`;
  
  report += `📈 *RÉPARTITION DES APPAREILS*\n`;
  
  // iOS
  if (stats.ios.count > 0) {
    const sampleUsers = stats.ios.users.slice(0, 3).join(', ');
    report += `🍎 iOS (Apple) : ${stats.ios.count} membre(s) - ${percentages.ios}%\n`;
    if (stats.ios.users.length > 0) {
      report += `   Exemples : ${sampleUsers}${stats.ios.users.length > 3 ? '...' : ''}\n`;
    }
  }
  
  // Android
  if (stats.android.count > 0) {
    const sampleUsers = stats.android.users.slice(0, 3).join(', ');
    report += `🤖 Android : ${stats.android.count} membre(s) - ${percentages.android}%\n`;
    if (stats.android.users.length > 0) {
      report += `   Exemples : ${sampleUsers}${stats.android.users.length > 3 ? '...' : ''}\n`;
    }
  }
  
  // Web
  if (stats.web.count > 0) {
    const sampleUsers = stats.web.users.slice(0, 3).join(', ');
    report += `🌐 Web : ${stats.web.count} membre(s) - ${percentages.web}%\n`;
    if (stats.web.users.length > 0) {
      report += `   Exemples : ${sampleUsers}${stats.web.users.length > 3 ? '...' : ''}\n`;
    }
  }
  
  // Desktop
  if (stats.desktop.count > 0) {
    const sampleUsers = stats.desktop.users.slice(0, 3).join(', ');
    report += `💻 Desktop : ${stats.desktop.count} membre(s) - ${percentages.desktop}%\n`;
    if (stats.desktop.users.length > 0) {
      report += `   Exemples : ${sampleUsers}${stats.desktop.users.length > 3 ? '...' : ''}\n`;
    }
  }
  
  // Inconnu
  if (stats.unknown.count > 0) {
    report += `❓ Inconnu : ${stats.unknown.count} membre(s) - ${percentages.unknown}%\n`;
  }
  
  // Analyse des tendances
  report += `\n📊 *ANALYSE DES TENDANCES*\n`;
  
  const devices = ['ios', 'android', 'web', 'desktop'];
  const deviceNames = {
    ios: 'Apple iOS',
    android: 'Android',
    web: 'WhatsApp Web',
    desktop: 'WhatsApp Desktop'
  };
  
  // Trouver le device dominant
  let dominantDevice = null;
  let maxCount = 0;
  
  for (const device of devices) {
    if (stats[device].count > maxCount) {
      maxCount = stats[device].count;
      dominantDevice = device;
    }
  }
  
  if (dominantDevice) {
    report += `🏆 Plateforme dominante : ${deviceNames[dominantDevice]} (${percentages[dominantDevice]}%)\n`;
  }
  
  // Calculer le ratio iOS/Android
  const iosCount = stats.ios.count;
  const androidCount = stats.android.count;
  if (iosCount > 0 && androidCount > 0) {
    const ratio = (iosCount / androidCount).toFixed(2);
    report += `📱 Ratio iOS/Android : 1:${ratio}\n`;
  }
  
  // Conseils
  report += `\n💡 *CONSEILS*\n`;
  if (percentages.web > 20) {
    report += `• Beaucoup d'utilisateurs Web : privilégiez les messages texte\n`;
  }
  if (percentages.ios > 60) {
    report += `• Majorité iOS : les fonctionnalités Apple fonctionneront bien\n`;
  }
  if (percentages.android > 60) {
    report += `• Majorité Android : bonne compatibilité avec toutes les fonctionnalités\n`;
  }
  
  report += `\n⚠️ *INFORMATIONS TECHNIQUES*\n`;
  report += `• Analyse basée sur les 1000 derniers messages\n`;
  report += `• Les utilisateurs inactifs peuvent ne pas être détectés\n`;
  report += `• Certains clients peuvent être mal identifiés\n`;
  report += `• Utilisez !devicegc details pour plus d'informations`;
  
  return report;
}

// Fonction pour envoyer un graphique ASCII
async function sendAsciiChart(sock, groupId, stats, percentages) {
  const maxWidth = 30;
  const devices = ['ios', 'android', 'web', 'desktop'];
  
  // Trouver le maximum pour l'échelle
  const maxCount = Math.max(...devices.map(d => stats[d].count));
  
  let chart = `📊 *GRAPHIQUE DES APPAREILS*\n\n`;
  
  for (const device of devices) {
    if (stats[device].count > 0) {
      const barWidth = Math.round((stats[device].count / maxCount) * maxWidth);
      const bar = '█'.repeat(Math.max(1, barWidth));
      
      const emoji = {
        ios: '🍎',
        android: '🤖',
        web: '🌐',
        desktop: '💻'
      }[device];
      
      const name = {
        ios: 'iOS',
        android: 'Android',
        web: 'Web',
        desktop: 'Desktop'
      }[device];
      
      chart += `${emoji} ${name} : ${bar} ${stats[device].count} (${percentages[device]}%)\n`;
    }
  }
  
  await sock.sendMessage(groupId, { text: chart });
}

// Fonction pour envoyer les détails par utilisateur
async function sendUserDetails(sock, groupId, stats) {
  let details = `👤 *DÉTAILS PAR UTILISATEUR*\n\n`;
  
  const devices = ['ios', 'android', 'web', 'desktop'];
  let hasDetails = false;
  
  for (const device of devices) {
    if (stats[device].users.length > 0) {
      hasDetails = true;
      const deviceName = {
        ios: '🍎 iOS',
        android: '🤖 Android',
        web: '🌐 Web',
        desktop: '💻 Desktop'
      }[device];
      
      details += `${deviceName} (${stats[device].count} utilisateurs):\n`;
      details += stats[device].users.slice(0, 15).map(user => `  +${user}`).join('\n');
      if (stats[device].users.length > 15) {
        details += `\n  ... et ${stats[device].users.length - 15} autres`;
      }
      details += `\n\n`;
    }
  }
  
  if (hasDetails) {
    await sock.sendMessage(groupId, { text: details });
  }
}

// Nettoyer le cache
function cleanupDeviceCache() {
  const now = Date.now();
  for (const [key, value] of deviceCache.entries()) {
    if (now - value.timestamp > 3600000) { // 1 heure
      deviceCache.delete(key);
    }
  }
}