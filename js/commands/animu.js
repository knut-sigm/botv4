import axios from "axios";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import webp from "node-webpmux";
import crypto from "crypto";

const ANIMU_BASE = "https://api.some-random-api.com/animu";

function normalizeType(input) {
  const lower = (input || "").toLowerCase();
  if (lower === "facepalm" || lower === "face_palm") return "face-palm";
  if (lower === "quote" || lower === "animuquote") return "quote";
  return lower;
}

export const name = "animu";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  const supported = [
    "nom", "poke", "cry", "kiss", "pat",
    "hug", "wink", "face-palm", "quote"
  ];

  const sub = normalizeType(args[0]);

  if (!sub) {
    return sock.sendMessage(
      from,
      { text: `> ⚠️ KNUT XMD: Utilisation → .animu <type>\nTypes: ${supported.join(", ")}` },
      { quoted: msg }
    );
  }

  if (!supported.includes(sub)) {
    return sock.sendMessage(
      from,
      { text: `> ❌ KNUT XMD: Type invalide.\nTypes: ${supported.join(", ")}` },
      { quoted: msg }
    );
  }

  try {
    await sock.sendMessage(
      from,
      { text: "> 🎌 KNUT XMD charge l'animu..." },
      { quoted: msg }
    );

    const { data } = await axios.get(`${ANIMU_BASE}/${sub}`, { timeout: 15000 });

    if (data?.link) {
      const link = data.link.toLowerCase();
      const isGif = link.endsWith(".gif");

      try {
        const media = await axios.get(data.link, {
          responseType: "arraybuffer",
          timeout: 15000,
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        const stickerBuffer = await convertToSticker(
          Buffer.from(media.data),
          isGif
        );

        return sock.sendMessage(
          from,
          { sticker: stickerBuffer },
          { quoted: msg }
        );

      } catch {
        return sock.sendMessage(
          from,
          { image: { url: data.link }, caption: `anime: ${sub}` },
          { quoted: msg }
        );
      }
    }

    if (data?.quote) {
      return sock.sendMessage(
        from,
        { text: `> 🎌 KNUT XMD\n\n${data.quote}` },
        { quoted: msg }
      );
    }

    return sock.sendMessage(
      from,
      { text: "> ❌ KNUT XMD: Impossible de récupérer l'animu." },
      { quoted: msg }
    );

  } catch (error) {
    console.error("ANIMU Error:", error);

    return sock.sendMessage(
      from,
      { text: "> ⚠️ KNUT XMD: Une erreur est survenue." },
      { quoted: msg }
    );
  }
}

/* ================= STICKER CONVERTER ================= */

async function convertToSticker(buffer, isAnimated) {
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const input = path.join(tmpDir, `animu_${Date.now()}.${isAnimated ? "gif" : "jpg"}`);
  const output = path.join(tmpDir, `animu_${Date.now()}.webp`);

  fs.writeFileSync(input, buffer);

  const cmd = isAnimated
    ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -c:v libwebp -loop 0 -pix_fmt yuva420p "${output}"`
    : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -pix_fmt yuva420p "${output}"`;

  await new Promise((resolve, reject) =>
    exec(cmd, (err) => (err ? reject(err) : resolve()))
  );

  let webpBuffer = fs.readFileSync(output);

  const img = new webp.Image();
  await img.load(webpBuffer);

  const json = {
    "sticker-pack-id": crypto.randomBytes(16).toString("hex"),
    "sticker-pack-name": "Knut XMD Anime",
    "emojis": ["🎌"]
  };

  const exifAttr = Buffer.from([
    0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ]);

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);

  img.exif = exif;

  const finalBuffer = await img.save(null);

  try { fs.unlinkSync(input); } catch {}
  try { fs.unlinkSync(output); } catch {}

  return finalBuffer;
}