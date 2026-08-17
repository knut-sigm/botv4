import axios from 'axios';

export const name = "tiktok";
export const aliases = ["tt", "tik", "tiktokdl"];

export async function execute(sock, msg, args) {
    try {
        const from = msg.key.remoteJid;

        // Vérification des arguments
        if (!args.length) {
            return await sock.sendMessage(from, { 
                text: "> ⚠️ KNUT XMD: Utilisation : .tiktok <url>\n> .tiktok audio <url>" 
            }, { quoted: msg });
        }

        // Déterminer le mode (audio ou vidéo)
        let mode = "video";
        let url = args[0];

        if (args[0].toLowerCase() === "audio" && args[1]) {
            mode = "audio";
            url = args[1];
        }

        // Vérification de l'URL TikTok
        if (!url.includes("tiktok.com")) {
            return await sock.sendMessage(from, { 
                text: "> ❌ KNUT XMD: URL TikTok invalide." 
            }, { quoted: msg });
        }

        // Début du téléchargement
        const start = Date.now();
        
        const sentMsg = await sock.sendMessage(from, { 
            text: `> ⏳ KNUT XMD: Téléchargement (${mode})...` 
        }, { quoted: msg });

        let mediaSent = false;
        let sourceUsed = "";

        // ===== API 1 — DANSCOT =====
        try {
            const apiUrl = `https://api.danscot.dev/api/tiktok/download?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 20000 });

            if (data.status === "ok" && data.results?.length) {
                let result;

                if (mode === "audio") {
                    result = data.results.find(r => r.type === "music");
                    if (result) {
                        await sock.sendMessage(from, {
                            audio: { url: result.url },
                            mimetype: "audio/mp4"
                        }, { quoted: sentMsg });
                    }
                } else {
                    result = data.results.find(r => r.type === "hd") ||
                            data.results.find(r => r.type === "mp4") ||
                            data.results[0];

                    if (result) {
                        await sock.sendMessage(from, {
                            video: { url: result.url },
                            mimetype: "video/mp4"
                        }, { quoted: sentMsg });
                    }
                }

                if (result) {
                    mediaSent = true;
                    sourceUsed = "Danscot";
                }
            }
        } catch (e) {
            console.log("API Danscot failed:", e.message);
        }

        // ===== API 2 — TIKWM (fallback) =====
        if (!mediaSent) {
            try {
                const { data } = await axios.post("https://www.tikwm.com/api/", 
                    { url }, 
                    { timeout: 20000 }
                );

                if (data.data) {
                    if (mode === "audio") {
                        await sock.sendMessage(from, {
                            audio: { url: data.data.music },
                            mimetype: "audio/mp4"
                        }, { quoted: sentMsg });
                    } else {
                        await sock.sendMessage(from, {
                            video: { url: data.data.play },
                            mimetype: "video/mp4"
                        }, { quoted: sentMsg });
                    }

                    mediaSent = true;
                    sourceUsed = "TikWM";
                }
            } catch (e) {
                console.log("API TikWM failed:", e.message);
            }
        }

        // ===== API 3 — TikDown (deuxième fallback) =====
        if (!mediaSent) {
            try {
                const { data } = await axios.get(`https://tikdown.org/api?url=${encodeURIComponent(url)}`, { 
                    timeout: 20000 
                });

                if (data.video_url) {
                    if (mode === "audio" && data.audio_url) {
                        await sock.sendMessage(from, {
                            audio: { url: data.audio_url },
                            mimetype: "audio/mp4"
                        }, { quoted: sentMsg });
                    } else {
                        await sock.sendMessage(from, {
                            video: { url: data.video_url },
                            mimetype: "video/mp4"
                        }, { quoted: sentMsg });
                    }

                    mediaSent = true;
                    sourceUsed = "TikDown";
                }
            } catch (e) {
                console.log("API TikDown failed:", e.message);
            }
        }

        // Vérification si le téléchargement a réussi
        if (!mediaSent) {
            throw new Error("Toutes les API ont échoué");
        }

        // Calcul de la latence
        const latency = Date.now() - start;

        // Message de confirmation
        const reply = `> ✅ KNUT XMD: Téléchargement réussi\n` +
                     `> Mode : ${mode}\n` +
                     `> Temps : ${latency} ms`;

        await sock.sendMessage(from, { text: reply }, { quoted: sentMsg });

    } catch (err) {
        console.error("❌ Erreur tiktok :", err);
        
        let errorMsg = "> ⚠️ KNUT XMD: ";
        
        if (err.message.includes("Toutes les API")) {
            errorMsg += "Impossible de télécharger la vidéo. Veuillez réessayer plus tard.";
        } else {
            errorMsg += `Erreur: ${err.message}`;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: errorMsg
        }, { quoted: msg });
    }
};