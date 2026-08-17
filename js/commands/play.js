import axios from 'axios';
import yts from 'yt-search';

// Configuration
const API_KEYS = { 
    YOUTUBE: process.env.YOUTUBE_API_KEY || "AIzaSyDV11sdmCCdyyToNU-XRFMbKgAA4IEDOS0" 
};
const APIS = {
    FASTAPI: "https://api.danscot.dev/api",
    IZUMI: "https://izumiiiiiiii.dpdns.org/downloader",
    OKATSU: "https://okatsu-rolezapiiz.vercel.app/downloader",
    KEITH: "https://apis-keith.vercel.app/download",
    DAVID: "https://apis.davidcyril.name.ng/download/ytmp3"
};
const AXIOS_DEFAULTS = { 
    timeout: 60000, 
    headers: { 
        'User-Agent': 'Mozilla/5.0', 
        Accept: 'application/json' 
    } 
};

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let i = 1; i <= attempts; i++) {
        try { 
            return await getter(); 
        } catch (e) { 
            lastError = e; 
            if (i < attempts) await new Promise(r => setTimeout(r, i * 1000)); 
        }
    }
    throw lastError;
}

async function searchYouTube(query) {
    // Essayer d'abord avec YouTube API si disponible
    if (API_KEYS.YOUTUBE) {
        try {
            const { data } = await axios.get("https://www.googleapis.com/youtube/v3/search", { 
                params: { 
                    part: "snippet", 
                    q: query, 
                    type: "video", 
                    maxResults: 1, 
                    key: API_KEYS.YOUTUBE 
                } 
            });
            
            if (data.items?.length) {
                return { 
                    url: `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`, 
                    title: data.items[0].snippet.title, 
                    thumbnail: data.items[0].snippet.thumbnails.high?.url,
                    author: data.items[0].snippet.channelTitle,
                    duration: "N/A"
                };
            }
        } catch (e) {
            console.log("YouTube API failed, falling back to yt-search");
        }
    }
    
    // Fallback sur yt-search
    const search = await yts(query);
    if (search.videos?.length) {
        return { 
            url: search.videos[0].url, 
            title: search.videos[0].title, 
            thumbnail: search.videos[0].thumbnail,
            author: search.videos[0].author?.name || "Inconnu",
            duration: search.videos[0].timestamp || "N/A"
        };
    }
    
    throw new Error("Aucune vidéo trouvée");
}

async function downloadAudio(videoUrl, title = "") {
    const errors = [];
    
    // Liste de tous les services à essayer
    const services = [
        // Service David Cyril
        async () => {
            try {
                const { data } = await axios.get(`${APIS.DAVID}?url=${encodeURIComponent(videoUrl)}`);
                if (data.success && data.result?.download_url) {
                    return { 
                        url: data.result.download_url, 
                        title: data.result.title || title || "Audio",
                        service: "DAVID"
                    };
                }
                throw new Error('David API failed');
            } catch (e) {
                errors.push(`David: ${e.message}`);
                throw e;
            }
        },
        
        // Service FastAPI
        async () => {
            try {
                const { data } = await tryRequest(() => 
                    axios.get(`${APIS.FASTAPI}/youtube/downl/?url=${encodeURIComponent(videoUrl)}&fmt=mp3`, AXIOS_DEFAULTS)
                );
                if (data.status === 'ok' && data.results?.download_url) {
                    return { 
                        url: data.results.download_url, 
                        title: data.results.title || title || "Audio",
                        service: "FASTAPI"
                    };
                }
                throw new Error('FastAPI failed');
            } catch (e) {
                errors.push(`FastAPI: ${e.message}`);
                throw e;
            }
        },
        
        // Service Izumi
        async () => {
            try {
                const { data } = await tryRequest(() => 
                    axios.get(`${APIS.IZUMI}/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3`, AXIOS_DEFAULTS)
                );
                if (data.result?.download) {
                    return { 
                        url: data.result.download, 
                        title: data.result.title || title || "Audio",
                        service: "IZUMI"
                    };
                }
                throw new Error('Izumi failed');
            } catch (e) {
                errors.push(`Izumi: ${e.message}`);
                throw e;
            }
        },
        
        // Service Keith
        async () => {
            try {
                const { data } = await tryRequest(() => 
                    axios.get(`${APIS.KEITH}/dlmp3?url=${encodeURIComponent(videoUrl)}`, AXIOS_DEFAULTS)
                );
                if (data.status && data.result?.downloadUrl) {
                    return { 
                        url: data.result.downloadUrl, 
                        title: data.result.title || title || "Audio",
                        service: "KEITH"
                    };
                }
                throw new Error('Keith failed');
            } catch (e) {
                errors.push(`Keith: ${e.message}`);
                throw e;
            }
        },
        
        // Service Okatsu
        async () => {
            try {
                const { data } = await tryRequest(() => 
                    axios.get(`${APIS.OKATSU}/ytmp3?url=${encodeURIComponent(videoUrl)}`, AXIOS_DEFAULTS)
                );
                if (data.dl) {
                    return { 
                        url: data.dl, 
                        title: data.title || title || "Audio",
                        service: "OKATSU"
                    };
                }
                throw new Error('Okatsu failed');
            } catch (e) {
                errors.push(`Okatsu: ${e.message}`);
                throw e;
            }
        }
    ];
    
    // Essayer chaque service jusqu'à ce qu'un fonctionne
    for (const service of services) {
        try {
            const result = await service();
            console.log(`✅ Téléchargement réussi avec ${result.service}`);
            return result;
        } catch (e) {
            console.log(`❌ Échec: ${e.message}`);
            // Continuer avec le service suivant
        }
    }
    
    // Si tous les services ont échoué
    console.error("Tous les services ont échoué:", errors);
    throw new Error("Tous les services de téléchargement ont échoué");
}

export const name = "play";
export const aliases = ["song", "music", "audio", "ytmp3"];

export async function execute(sock, msg, args) {
    try {
        const from = msg.key.remoteJid;
        const query = args.join(" ");

        // Vérification des arguments
        if (!args.length) {
            return await sock.sendMessage(from, { 
                text: "> ⚠️ KNUT XMD: Utilisation : .play <titre ou lien YouTube>" 
            }, { quoted: msg });
        }

        // Message de recherche
        const searchMsg = await sock.sendMessage(from, { 
            text: "> 🔍 KNUT XMD: Recherche en cours..." 
        }, { quoted: msg });

        // Recherche de la vidéo
        const video = await searchYouTube(query);

        // Envoi des informations de la vidéo
        const infoText = `🎵 *Titre:* ${video.title}\n` +
                        `👤 *Auteur:* ${video.author || "Inconnu"}\n` +
                        `⏱ *Durée:* ${video.duration}\n\n` +
                        `> ⬇️ KNUT XMD: Téléchargement en cours...`;

        if (video.thumbnail) {
            await sock.sendMessage(from, {
                image: { url: video.thumbnail },
                caption: infoText
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { 
                text: infoText 
            }, { quoted: msg });
        }

        // Téléchargement de l'audio
        const audio = await downloadAudio(video.url, video.title);

        // Envoi du fichier audio
        await sock.sendMessage(from, {
            audio: { url: audio.url },
            mimetype: 'audio/mpeg',
            fileName: `${audio.title.replace(/[^\w\s]/gi, '')}.mp3`,
            ptt: false
        }, { quoted: msg });

        // Message de confirmation avec le service utilisé
        await sock.sendMessage(from, { 
            text: `> ✅ KNUT XMD: Télechargement terminé` 
        }, { quoted: msg });

    } catch (err) {
        console.error("❌ Erreur play :", err);
        
        let errorMsg = "> ⚠️ KNUT XMD: ";
        
        if (err.message.includes("Aucune vidéo")) {
            errorMsg += "Aucune vidéo trouvée pour votre recherche.";
        } else if (err.message.includes("tous les services")) {
            errorMsg += "Impossible de télécharger l'audio pour le moment. Veuillez réessayer plus tard.";
        } else {
            errorMsg += `Erreur: ${err.message}`;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: errorMsg
        }, { quoted: msg });
    }
};