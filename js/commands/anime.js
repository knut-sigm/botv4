export const name = 'anime';
export const description = 'Get 5 random Naruto/anime images';
export const category = 'Anime';

export async function execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const botname = 'KNUT XMD'; // Ajustez selon votre configuration

    try {
        // Message d'attente
        const sentMsg = await sock.sendMessage(from, {
            text: '🌀 *KNUT XMD* - Preparing 5 images...'
        }, { quoted: msg });

        // Tableau pour stocker les URLs des images
        const imageUrls = [];
        const apiUrl = 'https://api.waifu.pics/sfw/waifu'; // API fiable et gratuite

        // Récupérer 5 URLs d'images
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (data && data.url) {
                    imageUrls.push(data.url);
                } else {
                    console.warn(`L'API n'a pas retourné d'URL pour l'image ${i+1}`);
                }
                // Petite pause pour ne pas surcharger l'API
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (fetchErr) {
                console.error(`Erreur lors de la récupération de l'image ${i+1}:`, fetchErr.message);
            }
        }

        if (imageUrls.length === 0) {
            throw new Error('Could not fetch any images from the API.');
        }

        // Envoi d'un message de statut
        let statusMsg = await sock.sendMessage(from, {
            text: `📊 Status: 0/${imageUrls.length} images sent`
        }, { quoted: sentMsg });

        // Envoyer chaque image une par une
        for (let i = 0; i < imageUrls.length; i++) {
            try {
                await sock.sendMessage(from, {
                    image: { url: imageUrls[i] },
                    caption: `🖼️ Image ${i+1}/${imageUrls.length} - ${botname}`
                });
                // Mettre à jour le statut
                await sock.sendMessage(from, {
                    text: `📊 Status: ${i+1}/${imageUrls.length} images sent ✅`
                }, { quoted: statusMsg });
                // **Délai CRITIQUE** : Attendre 1.5 à 2 secondes entre chaque envoi pour éviter
                // que WhatsApp ne considère le bot comme un spammeur et ne le bloque.
                if (i < imageUrls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            } catch (sendErr) {
                console.error(`Failed to send image ${i+1}:`, sendErr);
                await sock.sendMessage(from, {
                    text: `⚠️ Failed to send image ${i+1}. Skipping.`
                }, { quoted: statusMsg });
            }
        }

        // Message final
        await sock.sendMessage(from, {
            text: `✅ *${botname}*: All ${imageUrls.length} images have been sent!`
        }, { quoted: statusMsg });

    } catch (err) {
        console.error('❌ Naruto command error:', err);
        await sock.sendMessage(from, {
            text: `❌ *${botname}*: An error occurred while processing the command.\nError: ${err.message}`
        }, { quoted: msg });
    }
}