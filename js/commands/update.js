import fs from 'fs-extra';
import path from 'path';
import { execSync, exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_URL = 'https://github.com/knut-sigm/KNUT-XMD-MAIN.git';

// Fichiers/dossiers à préserver (NE PAS ÉCRASER)
const preserveItems = [
  'session',
  'config.json',
  'sudo.json',
  'modeprefix.json',
  'group.json',
  'jid.json',
  'respons.json',
  '.env',
  'node_modules',
  'package-lock.json',
  'yarn.lock',
  "./knut.jpg",
  'ecosystem.config.js'
];

// Dossiers à complètement ÉCRASER avec la version GitHub
const overwriteFolders = [
  'commands',     // 👈 Le dossier commands sera COMPLÈTEMENT remplacé
  'lib',
  'plugins',
  'helpers',
  'utils',
  'scripts'
];

// Fichiers racine à préserver (ne pas écraser)
const preserveRootFiles = [
  'index.js',      // On préserve l'index.js actuel
  ...preserveItems
];

// Détection de l'environnement
function detectEnvironment() {
  const env = {
    isPterodactyl: false,
    isPM2: false,
    pm2Name: null,
    isDocker: false,
    isSystemd: false
  };

  // Détection Pterodactyl
  if (process.env.PTERODACTYL_SERVER_ID || 
      process.env.SERVER_ID || 
      fs.existsSync('/home/container')) {
    env.isPterodactyl = true;
    console.log('🏠 Environnement détecté: Pterodactyl');
  }

  // Détection Docker
  if (fs.existsSync('/.dockerenv') || process.env.DOCKER_CONTAINER) {
    env.isDocker = true;
    console.log('🐳 Environnement détecté: Docker');
  }

  // Détection PM2
  try {
    const pm2List = execSync('pm2 list', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    if (pm2List.includes('knut-xmd') || pm2List.includes('index')) {
      env.isPM2 = true;
      
      if (pm2List.includes('knut-xmd')) {
        env.pm2Name = 'knut-xmd';
      } else {
        const match = pm2List.match(/[│\s]+([^\s]+)[│\s]+.*online/);
        env.pm2Name = match ? match[1] : 'index';
      }
      console.log(`🚀 Environnement détecté: PM2 (${env.pm2Name})`);
    }
  } catch {
    // Pas de PM2
  }

  // Détection Systemd
  try {
    if (process.env.INVOCATION_ID || fs.existsSync('/run/systemd/system')) {
      env.isSystemd = true;
      console.log('⚙️ Environnement détecté: Systemd');
    }
  } catch {}

  return env;
}

// Redémarrer automatiquement selon l'environnement
async function autoRestart(env, sock, from) {
  console.log('🔄 Redémarrage automatique en cours...');

  // Envoyer message de redémarrage
  try {
    await sock.sendMessage(
      from,
      { text: '> Knut XMD : 🔄 Mises à jours installés... Cliquez sur restart dans le panel' },
      { quoted: null }
    );
  } catch (e) {
    // Ignorer erreur d'envoi
  }

  // Petit délai pour que le message soit envoyé
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 1. CAS PTERODACTYL
  if (env.isPterodactyl) {
    console.log('🔄 Redémarrage Pterodactyl...');
    
    try {
      // Méthode 1: Touch restart.txt (signal pour Pterodactyl)
      fs.writeFileSync(path.join(__dirname, 'restart.txt'), new Date().toISOString());
      console.log('✅ Signal de redémarrage envoyé (restart.txt)');
    } catch (e) {}

    // Méthode 2: Process exit (Pterodactyl redémarre automatiquement)
    setTimeout(() => {
      process.exit(0);
    }, 3000);
    
    return;
  }

  // 2. CAS PM2
  if (env.isPM2) {
    console.log(`🔄 Redémarrage PM2 (${env.pm2Name})...`);
    
    try {
      // Redémarrer via PM2
      execSync(`pm2 restart ${env.pm2Name}`, { stdio: 'inherit' });
      console.log('✅ PM2 a redémarré le processus');
      
      // Sauvegarder la config PM2
      try {
        execSync('pm2 save', { stdio: 'ignore' });
      } catch (e) {}
      
      // Le processus sera remplacé par PM2, on quitte celui-ci
      setTimeout(() => {
        process.exit(0);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erreur PM2 restart:', error.message);
      // Fallback: redémarrage simple
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    }
    
    return;
  }

  // 3. CAS DOCKER
  if (env.isDocker) {
    console.log('🐳 Redémarrage Docker...');
    
    try {
      // Dans Docker, on peut utiliser kill pour redémarrer
      process.kill(process.pid, 'SIGTERM');
    } catch (e) {
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    }
    
    return;
  }

  // 4. CAS SYSTEMD
  if (env.isSystemd) {
    console.log('⚙️ Redémarrage Systemd...');
    
    try {
      // Si le service s'appelle knut-xmd
      exec('systemctl --user restart knut-xmd 2>/dev/null || systemctl restart knut-xmd 2>/dev/null', (err) => {
        if (err) {
          // Fallback
          setTimeout(() => {
            process.exit(0);
          }, 3000);
        }
      });
    } catch (e) {
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    }
    
    return;
  }

  // 5. CAS STANDARD (auto-redémarrage)
  console.log('🔄 Redémarrage standard avec auto-relance...');
  
  try {
    // Lancer un nouveau processus avant de quitter
    const newProcess = spawn('node', ['index.js'], {
      detached: true,
      stdio: 'inherit',
      cwd: __dirname
    });
    newProcess.unref();
    console.log('✅ Nouveau processus lancé avec PID:', newProcess.pid);
    
    // Sauvegarder le PID pour référence
    fs.writeFileSync(path.join(__dirname, 'current.pid'), newProcess.pid.toString());
    
  } catch (e) {
    console.error('❌ Erreur lancement nouveau processus:', e.message);
  }

  // Quitter l'ancien processus
  setTimeout(() => {
    console.log('👋 Arrêt de l\'ancien processus...');
    process.exit(0);
  }, 3000);
}

// Créer un script de redémarrage pour Pterodactyl
function createPterodactylRestartScript() {
  const scriptPath = path.join(__dirname, 'restart.sh');
  
  if (!fs.existsSync(scriptPath)) {
    const scriptContent = `#!/bin/bash
# Script de redémarrage automatique pour Pterodactyl
echo "🔄 Redémarrage du bot KNUT XMD..."
touch restart.txt
echo "✅ Signal envoyé - Le panneau Pterodactyl va redémarrer le bot"
sleep 2
exit 0
`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, '755');
    console.log('✅ Script restart.sh créé');
  }
}

export default {
  name: 'update',
  alias: ['gitpull', 'up', 'maj', 'pull', 'actualiser', 'restart'],
  category: 'Owner',
  description: 'Mettre à jour le bot depuis GitHub (redémarrage auto)',
  usage: 'update',
  ownerOnly: true,

  async execute(sock, m, args, from, context = {}) {
    try {
      // Détecter l'environnement
      const env = detectEnvironment();
      
      // Créer script d'aide pour Pterodactyl
      if (env.isPterodactyl) {
        createPterodactylRestartScript();
      }

      // Message de début
      await sock.sendMessage(
        from,
        { text: '> Knut XMD : 🔄 Mise à jour en cours... Veuillez patienter.' },
        { quoted: m }
      );

      console.log('🔄 Mise à jour du bot...');

      // Sauvegarder l'index.js actuel
      const currentFile = __filename;
      const currentContent = fs.readFileSync(currentFile, 'utf8');
      const currentBasename = path.basename(currentFile);
      
      // Sauvegarder les fichiers de configuration
      console.log('📦 Sauvegarde des fichiers de configuration...');
      const backupDir = path.join(__dirname, '.config_backup');
      fs.ensureDirSync(backupDir);

      // Sauvegarder les fichiers à préserver
      for (const item of preserveItems) {
        const itemPath = path.join(__dirname, item);
        if (fs.existsSync(itemPath)) {
          const backupPath = path.join(backupDir, item);
          if (fs.lstatSync(itemPath).isDirectory()) {
            fs.copySync(itemPath, backupPath);
          } else {
            fs.copyFileSync(itemPath, backupPath);
          }
          console.log(`   ✅ Sauvegardé: ${item}`);
        }
      }

      // Vérifier si c'est un dépôt git
      const isGitRepo = fs.existsSync(path.join(__dirname, '.git'));
      
      if (!isGitRepo) {
        // Première installation
        console.log('📦 Premier clonage du dépôt...');
        const tempClonePath = path.join(__dirname, 'temp_clone');
        
        execSync(`git clone ${REPO_URL} ${tempClonePath}`, { stdio: 'inherit' });
        
        console.log('📋 Copie des fichiers...');
        
        // 1. D'abord, supprimer les dossiers à écraser s'ils existent
        for (const folder of overwriteFolders) {
          const folderPath = path.join(__dirname, folder);
          if (fs.existsSync(folderPath)) {
            console.log(`   🗑️ Suppression de ${folder} (sera remplacé par version GitHub)`);
            fs.removeSync(folderPath);
          }
        }
        
        // 2. Copier TOUS les fichiers du clone (y compris commands)
        const files = fs.readdirSync(tempClonePath);
        
        for (const file of files) {
          const srcPath = path.join(tempClonePath, file);
          const destPath = path.join(__dirname, file);
          
          // Ne PAS écraser les fichiers racine préservés
          if (preserveRootFiles.includes(file)) {
            console.log(`   ⏭️ Préservation de ${file} (fichier local conservé)`);
            continue;
          }
          
          // Pour tous les autres fichiers/dossiers, écraser
          if (fs.existsSync(destPath)) {
            fs.removeSync(destPath);
          }
          fs.copySync(srcPath, destPath);
          console.log(`   ✅ Copié: ${file}`);
        }
        
        // 3. Restaurer l'index.js actuel
        fs.writeFileSync(currentFile, currentContent);
        console.log(`   ✅ Restauré: ${currentBasename}`);
        
        fs.removeSync(tempClonePath);
        
      } else {
        // Mise à jour normale
        console.log('♻️ Mise à jour du dépôt existant...');
        
        try {
          // Essayer git pull normal
          execSync('git pull', { stdio: 'inherit' });
          console.log('✅ Dépôt mis à jour avec git pull');
        } catch (error) {
          console.log('⚠️ Git pull a échoué, tentative avec stash...');
          
          try {
            execSync('git stash', { stdio: 'inherit' });
            execSync('git pull origin main --no-edit', { stdio: 'inherit' });
            
            try {
              execSync('git stash pop', { stdio: 'inherit' });
            } catch (stashError) {
              console.log('⚠️ Conflits détectés, utilisation de la version distante');
              execSync('git stash drop', { stdio: 'ignore' });
            }
            
            console.log('✅ Dépôt mis à jour avec stash');
          } catch (pullError) {
            console.log('⚠️ Échec, tentative fetch reset...');
            
            execSync('git fetch --all', { stdio: 'inherit' });
            execSync('git reset --hard origin/main', { stdio: 'inherit' });
            
            console.log('✅ Dépôt réinitialisé sur origin/main');
          }
        }
        
        // Après git pull, on s'assure que les dossiers à écraser sont bien ceux de GitHub
        console.log('📋 Vérification des dossiers à synchroniser...');
        
        // Recréer un clone temporaire pour récupérer les dossiers spécifiques si nécessaire
        const tempCheckPath = path.join(__dirname, '.temp_check');
        if (!fs.existsSync(tempCheckPath)) {
          execSync(`git clone --depth 1 ${REPO_URL} ${tempCheckPath}`, { stdio: 'ignore' });
        }
        
        // Pour chaque dossier à écraser, on le remplace par la version GitHub
        for (const folder of overwriteFolders) {
          const localFolderPath = path.join(__dirname, folder);
          const githubFolderPath = path.join(tempCheckPath, folder);
          
          if (fs.existsSync(githubFolderPath)) {
            console.log(`   🔄 Mise à jour de ${folder}...`);
            if (fs.existsSync(localFolderPath)) {
              fs.removeSync(localFolderPath);
            }
            fs.copySync(githubFolderPath, localFolderPath);
            console.log(`   ✅ ${folder} mis à jour`);
          }
        }
        
        fs.removeSync(tempCheckPath);
      }

      // Restaurer les fichiers de configuration
      console.log('📋 Restauration des fichiers de configuration...');
      for (const item of preserveItems) {
        const backupPath = path.join(backupDir, item);
        const destPath = path.join(__dirname, item);
        if (fs.existsSync(backupPath)) {
          if (fs.lstatSync(backupPath).isDirectory()) {
            fs.copySync(backupPath, destPath);
          } else {
            fs.copyFileSync(backupPath, destPath);
          }
          console.log(`   ✅ Restauré: ${item}`);
        }
      }

      // Nettoyer le dossier de sauvegarde
      fs.removeSync(backupDir);

      // Installer les dépendances
      console.log('📦 Installation des dépendances...');
      try {
        execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
        console.log('✅ Dépendances installées');
      } catch (npmError) {
        console.error('❌ Erreur npm:', npmError.message);
        await sock.sendMessage(
          from,
          { text: '> Knut XMD : ⚠️ Erreur lors de l\'installation des dépendances.' },
          { quoted: m }
        );
      }

      console.log('✅ Mise à jour terminée avec succès');

      // Message de fin (simplifié car auto-restart)
      await sock.sendMessage(
        from,
        { text: '> Knut XMD : ✅ Mise à jour terminée !\n\n🔄 Redémarrage automatique en cours...' },
        { quoted: m }
      );

      console.log(`[UPDATE] Effectué par ${m.pushName || 'Owner'} - ${new Date().toLocaleString()}`);
      console.log(`📊 Environnement: ${env.isPterodactyl ? 'Pterodactyl' : env.isPM2 ? 'PM2' : 'Standard'}`);

      // REDÉMARRAGE AUTOMATIQUE
      await autoRestart(env, sock, from);

    } catch (err) {
      console.error('[UPDATE ERROR]', err.message);

      // Nettoyer
      const dirsToClean = ['.config_backup', 'temp_clone', '.temp_check'];
      for (const dir of dirsToClean) {
        if (fs.existsSync(path.join(__dirname, dir))) {
          fs.removeSync(path.join(__dirname, dir));
        }
      }

      let reason = 'Impossible de mettre à jour le bot.';
      if (err.message?.includes('git')) reason = 'Échec Git. Vérifiez votre connexion.';
      else if (err.message?.includes('permission')) reason = 'Permission refusée.';
      else if (err.message?.includes('ENOSPC')) reason = 'Espace disque insuffisant.';

      await sock.sendMessage(
        from,
        { text: `> Knut XMD : ❌ ${reason}` },
        { quoted: m }
      );
    }
  }
};
