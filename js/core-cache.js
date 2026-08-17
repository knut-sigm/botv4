// Knut XMD — caches partagés et bornés
const groupCaches = new WeakMap();

export async function getCachedGroupMetadata(sock, groupId, ttlMs = 10_000) {
  if (!sock || !groupId) throw new Error('invalid_group_metadata_request');
  let cache = groupCaches.get(sock);
  if (!cache) {
    cache = new Map();
    groupCaches.set(sock, cache);
  }
  const cached = cache.get(groupId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const value = await sock.groupMetadata(groupId);
  cache.set(groupId, { value, expiresAt: Date.now() + ttlMs });
  if (cache.size > 512) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  return value;
}

export class BoundedTtlSet {
  constructor({ max = 4096, ttlMs = 60_000 } = {}) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.items = new Map();
  }

  has(key) {
    const expiresAt = this.items.get(key);
    if (!expiresAt) return false;
    if (expiresAt <= Date.now()) { this.items.delete(key); return false; }
    return true;
  }

  add(key) {
    if (this.items.size >= this.max && !this.items.has(key)) {
      const first = this.items.keys().next().value;
      if (first) this.items.delete(first);
    }
    this.items.set(key, Date.now() + this.ttlMs);
    return this;
  }

  delete(key) { return this.items.delete(key); }
  clear() { this.items.clear(); }
}
