export const name = "phonecheck";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
  
  if (!quotedMsg) {
    await sock.sendMessage(from, {
      text: "📱 *Utilisation* :\nRéponds à un message avec !phonecheck\n\nExemple : Réponds à un message et écris !phonecheck"
    }, { quoted: msg });
    return;
  }
  
  const targetJid = msg.message.extendedTextMessage.contextInfo.participant;
  
  if (!targetJid) {
    await sock.sendMessage(from, {
      text: "❌ Impossible de détecter l'expéditeur du message"
    }, { quoted: msg });
    return;
  }
  
  try {
    await sock.sendMessage(from, {
      text: "🔍 Analyse du téléphone en cours...\nVérification des données techniques ⚙️"
    }, { quoted: msg });
    
    // Collecte des données en parallèle pour plus de vitesse
    const [profilePic, statusInfo, presenceInfo, userInfo] = await Promise.allSettled([
      sock.profilePictureUrl(targetJid, 'image').catch(() => null),
      sock.fetchStatus(targetJid).catch(() => null),
      sock.presenceSubscribe(targetJid).then(() => sock.getPresence(targetJid)).catch(() => null),
      sock.fetchBlocklist().catch(() => null) // Pour détecter certains patterns
    ]);
    
    // Analyse des métadonnées du message
    const messageTimestamp = msg.messageTimestamp;
    const messageType = Object.keys(quotedMsg)[0];
    const hasMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(messageType);
    
    // Détection basée sur les patterns connus
    let detectedBrand = "Inconnu";
    let confidence = "Faible";
    let details = [];
    let indicators = [];
    
    // 1. Analyse de la qualité de la photo de profil
    if (profilePic.value) {
      details.push("✅ Photo de profil disponible");
      // WhatsApp Web/Desktop a souvent des photos plus grandes
      indicators.push("Photo HD");
    } else {
      details.push("❌ Pas de photo de profil");
    }
    
    // 2. Analyse du type de message
    if (hasMedia) {
      const mediaMessage = quotedMsg[messageType];
      
      // Détection par type de fichier et qualité
      if (messageType === 'imageMessage') {
        details.push(`📸 Image: ${mediaMessage.width}x${mediaMessage.height}`);
        
        // iPhone envoie souvent des HEIC/HEIF
        if (mediaMessage.mimetype?.includes('heic') || mediaMessage.mimetype?.includes('heif')) {
          detectedBrand = "Apple (iPhone)";
          confidence = "Élevée";
          indicators.push("Format HEIC");
        }
        // Images haute résolution (>12MP)
        else if (mediaMessage.width * mediaMessage.height > 12000000) {
          detectedBrand = "Samsung/Google Pixel";
          confidence = "Moyenne";
          indicators.push("Haute résolution");
        }
      }
      else if (messageType === 'videoMessage') {
        details.push(`🎥 Vidéo: ${Math.round(mediaMessage.seconds)}s`);
        
        // Vidéos 4K/60fps
        if (mediaMessage.width >= 3840 || mediaMessage.height >= 2160) {
          detectedBrand = "iPhone/Samsung Galaxy S/Note";
          confidence = "Moyenne";
          indicators.push("4K");
        }
      }
    }
    
    // 3. Analyse du statut
    if (statusInfo.value?.status) {
      const statusLength = statusInfo.value.status.length;
      details.push(`📝 Bio: ${statusLength} caractères`);
      
      // Longs statuts souvent sur Android (pas de limite)
      if (statusLength > 100) {
        detectedBrand = "Android (divers)";
        confidence = "Moyenne";
        indicators.push("Bio longue");
      }
    }
    
    // 4. Analyse des horaires d'activité (pattern simplifié)
    const hour = new Date(messageTimestamp * 1000).getHours();
    if (hour >= 23 || hour <= 6) {
      indicators.push("Utilisation nocturne");
    }
    
    // 5. Détection par user-agent (basé sur certaines APIs)
    // Note: Pas directement accessible, mais on peut faire des suppositions
    
    // 6. Détection par le format du JID (pour les multi-appareils)
    if (targetJid.includes(':') && targetJid.includes('@')) {
      const deviceId = targetJid.split(':')[1]?.split('@')[0];
      if (deviceId) {
        details.push(`📱 Appareil ID: ${deviceId}`);
        
        // Certains IDs correspondent à des patterns d'appareils
        if (['0', '1', '2'].includes(deviceId)) {
          indicators.push("Multi-appareils");
          detectedBrand = "WhatsApp Multi-Device";
          confidence = "Moyenne";
        }
      }
    }
    
    // 7. Analyse de fréquence des messages (très basique)
    const messageDate = new Date(messageTimestamp * 1000);
    const dayOfWeek = messageDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      indicators.push("Weekend");
    }
    
    // Logique de détection finale
    if (detectedBrand === "Inconnu") {
      // Algorithmes de détection basés sur des statistiques
      const phoneStats = [
        { brand: "Apple (iPhone)", probability: 35 },
        { brand: "Samsung", probability: 25 },
        { brand: "Xiaomi", probability: 15 },
        { brand: "Google Pixel", probability: 8 },
        { brand: "OnePlus", probability: 5 },
        { brand: "Huawei", probability: 4 },
        { brand: "Autre Android", probability: 8 }
      ];
      
      // Utiliser l'ID comme seed pour une prédiction "stable"
      const userId = targetJid.split('@')[0];
      const seed = parseInt(userId.slice(-2)) || 0;
      const randomValue = (seed * 13) % 100;
      
      let cumulative = 0;
      for (const stat of phoneStats) {
        cumulative += stat.probability;
        if (randomValue < cumulative) {
          detectedBrand = stat.brand;
          confidence = "Faible (statistique)";
          break;
        }
      }
    }
    
    // Construction du rapport
    let report = `📱 *DÉTECTION DE MARQUE*\n`;
    report += `👤 Cible: ${targetJid.split('@')[0]}\n`;
    report += `🔍 Marque détectée: *${detectedBrand}*\n`;
    report += `📊 Confiance: ${confidence}\n\n`;
    
    report += `📈 *INDICATEURS*\n`;
    if (indicators.length > 0) {
      report += indicators.map(i => `• ${i}`).join('\n');
    } else {
      report += `Aucun indicateur fort détecté`;
    }
    
    report += `\n\n📋 *DONNÉES ANALYSÉES*\n`;
    report += details.join('\n');
    
    report += `\n\n⚠️ *REMARQUES*\n`;
    report += `• Cette analyse est indicative\n`;
    report += `• Basée sur des patterns techniques\n`;
    report += `• La marque exacte peut varier`;
    
    // Ajouter des emojis selon la marque détectée
    const brandEmojis = {
      "Apple": "🍎",
      "Samsung": "📱",
      "Xiaomi": "⚡",
      "Google": "🔍",
      "OnePlus": "⚡",
      "Huawei": "🇨🇳",
      "Android": "🤖"
    };
    
    for (const [key, emoji] of Object.entries(brandEmojis)) {
      if (detectedBrand.includes(key)) {
        report = `${emoji} ${report}`;
        break;
      }
    }
    
    await sock.sendMessage(from, {
      text: report
    }, { quoted: msg });
    
    // Suggestions supplémentaires
    if (confidence === "Faible") {
      setTimeout(async () => {
        await sock.sendMessage(from, {
          text: `💡 *Pour améliorer la détection:*\n` +
                `1. Demandez une photo prise par l'appareil\n` +
                `2. Vérifiez les métadonnées EXIF (si partagées)\n` +
                `3. Demandez le modèle directement 😉`
        });
      }, 1000);
    }
    
  } catch (error) {
    console.error("Erreur phonecheck:", error);
    
    await sock.sendMessage(from, {
      text: `❌ Erreur d'analyse\n` +
            `Détail: ${error.message || 'Inconnu'}\n\n` +
            `Vérifiez que:\n` +
            `• Le message cité est valide\n` +
            `• L'utilisateur n'a pas bloqué ses infos\n` +
            `• Vous avez les permissions nécessaires`
    }, { quoted: msg });
  }
}