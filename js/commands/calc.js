export const name = "calc";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    
    if (!args.length) {
      return await sock.sendMessage(from, { 
        text: "> ⚠️ KNUT XMD: Veuillez fournir une expression.\nExemple: `!calc 2+2*5` ou `!calc sin(45)`" 
      }, { quoted: msg });
    }

    const expression = args.join(" ");
    
    // Message de traitement
    const processingMsg = await sock.sendMessage(from, { 
      text: "> ⏳ KNUT XMD: Calcul en cours..." 
    }, { quoted: msg });

    // Nettoyer et évaluer l'expression mathématique
    const result = safeEvaluate(expression);
    
    if (result.error) {
      await sock.sendMessage(from, { 
        text: `> ❌ KNUT XMD: Erreur de calcul\nExpression: ${expression}\nErreur: ${result.message}` 
      }, { quoted: processingMsg });
      return;
    }

    // Réponse stylisée
    const reply = `> 🧮 KNUT XMD: Calculatrice\n━━━━━━━━━━━━━━━━━━\n📝 Expression: ${expression}\n✅ Résultat: ${result.value}\n━━━━━━━━━━━━━━━━━━\n🔢 Format: ${result.format}`;
    
    await sock.sendMessage(from, { text: reply }, { quoted: processingMsg });

  } catch (err) {
    console.error("❌ Erreur calc :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "> ⚠️ KNUT XMD: Erreur lors du calcul."
    }, { quoted: msg });
  }
};

// Fonction d'évaluation sécurisée
function safeEvaluate(expression) {
  try {
    // Nettoyer l'expression (sécurité)
    let cleanExpr = expression
      .replace(/[^0-9+\-*/().,%π√^!&|<>=\s]/g, '')
      .replace(/π/g, 'Math.PI')
      .replace(/√/g, 'Math.sqrt')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/\^/g, '**');
    
    // Vérifier les expressions dangereuses
    const dangerousPatterns = [
      /process\./i,
      /require\(/i,
      /eval\(/i,
      /Function\(/i,
      /while\(/i,
      /for\(/i,
      /import\(/i,
      /exports\./i,
      /module\./i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(cleanExpr)) {
        return { error: true, message: "Expression non autorisée" };
      }
    }
    
    // Évaluer l'expression
    let value = eval(cleanExpr);
    
    // Formater le résultat
    let format = "Nombre décimal";
    
    // Vérifier si c'est un entier
    if (Number.isInteger(value)) {
      format = "Entier";
    }
    
    // Vérifier si c'est un nombre scientifique
    if (Math.abs(value) >= 1e6 || (Math.abs(value) <= 1e-6 && value !== 0)) {
      value = value.toExponential(4);
      format = "Notation scientifique";
    } else {
      // Arrondir à 6 décimales max
      value = Math.round(value * 1e6) / 1e6;
    }
    
    // Formater avec séparateurs de milliers
    if (!isNaN(value) && Math.abs(value) >= 1000 && format !== "Notation scientifique") {
      value = value.toLocaleString('fr-FR');
      format = "Nombre formaté";
    }
    
    // Conversions supplémentaires
    let conversions = "";
    if (!isNaN(value) && value > 0) {
      const binary = Math.round(value).toString(2);
      const hex = Math.round(value).toString(16).toUpperCase();
      if (binary.length <= 16) {
        conversions = `\n🔣 Binaire: ${binary}\n🔶 Hexadécimal: ${hex}`;
      }
    }
    
    return { 
      error: false, 
      value: value,
      format: format + conversions
    };
    
  } catch (err) {
    return { 
      error: true, 
      message: "Expression mathématique invalide" 
    };
  }
}