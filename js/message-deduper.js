// KNUT XMD — Optional Message Deduper
export class MessageDeduper {
  constructor({ max = 2048, ttlMs = 45_000 } = {}) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.seen = new Map();
  }

  accept(message) {
    const key = message?.key?.id || message?.id;
    if (!key) return true;
    const now = Date.now();
    for (const [id, expiresAt] of this.seen) if (expiresAt <= now) this.seen.delete(id);
    if (this.seen.has(key)) return false;
    this.seen.set(key, now + this.ttlMs);
    while (this.seen.size > this.max) this.seen.delete(this.seen.keys().next().value);
    return true;
  }

  clear() { this.seen.clear(); }
  size() { return this.seen.size; }
}
