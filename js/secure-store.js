// KNUT XMD — Secure Store
import fs from 'node:fs';
import path from 'path';

export function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonAtomic(file, value, mode = 0o600) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2), { mode });
  fs.chmodSync(temp, mode);
  fs.renameSync(temp, file);
  try { fs.chmodSync(file, mode); } catch {}
}

export function normalizeNumber(value) {
  return String(value || '').replace(/[^0-9]/g, '').slice(0, 20);
}

export function redact(value) {
  return String(value || '')
    .replace(/(apikey|api_key|token|password|secret)=([^&\s]+)/gi, '$1=[redacted]')
    .replace(/\b\d{8,20}\b/g, (match) => `${match.slice(0, 3)}…${match.slice(-2)}`);
}
