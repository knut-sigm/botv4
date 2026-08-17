// KNUT XMD — Optional Performance Cache
// Additif : aucune commande existante n’est modifiée automatiquement.
export class TTLCache {
  constructor({ max = 256, ttlMs = 30_000 } = {}) {
    this.max = Math.max(1, max);
    this.ttlMs = Math.max(100, ttlMs);
    this.items = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  _purgeExpired() {
    const now = Date.now();
    for (const [key, item] of this.items) if (item.expiresAt <= now) this.items.delete(key);
  }

  get(key) {
    const item = this.items.get(String(key));
    if (!item || item.expiresAt <= Date.now()) {
      if (item) this.items.delete(String(key));
      this.misses += 1;
      return undefined;
    }
    this.items.delete(String(key));
    this.items.set(String(key), item);
    this.hits += 1;
    return item.value;
  }

  set(key, value, ttlMs = this.ttlMs) {
    const normalized = String(key);
    this.items.delete(normalized);
    this.items.set(normalized, { value, expiresAt: Date.now() + Math.max(100, ttlMs) });
    this._purgeExpired();
    while (this.items.size > this.max) this.items.delete(this.items.keys().next().value);
    return value;
  }

  delete(key) { return this.items.delete(String(key)); }
  clear() { this.items.clear(); }
  stats() { this._purgeExpired(); return { size: this.items.size, max: this.max, hits: this.hits, misses: this.misses }; }
}

export function memoizeAsync(fn, { cache = new TTLCache(), key = (...args) => JSON.stringify(args) } = {}) {
  return async (...args) => {
    const cacheKey = key(...args);
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;
    const value = await fn(...args);
    cache.set(cacheKey, value);
    return value;
  };
}
