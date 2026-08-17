// KNUT XMD — Optional Optimization Suite
// Importable progressivement par une commande ou un module sans régression implicite.
import { TTLCache } from './performance-cache.js';
import { MessageDeduper } from './message-deduper.js';
import { Metrics } from './performance-metrics.js';
import { createLimiter, sanitizeError, withTimeout } from './runtime-guard.js';

export function createOptimizationSuite(options = {}) {
  const cache = new TTLCache(options.cache || {});
  const deduper = new MessageDeduper(options.dedupe || {});
  const metrics = new Metrics(options.metrics || {});
  const limit = createLimiter(options.maxConcurrent || 4);

  return Object.freeze({
    cache,
    deduper,
    metrics,
    limit,
    acceptMessage: message => deduper.accept(message),
    cached: async (key, task, ttlMs) => {
      const existing = cache.get(key);
      if (existing !== undefined) return existing;
      const value = await limit(() => withTimeout(task, options.timeoutMs || 20_000, 'optimization_task'));
      cache.set(key, value, ttlMs);
      return value;
    },
    timed: (name, task) => metrics.wrap(name, task),
    safeError: sanitizeError,
    snapshot: () => ({ cache: cache.stats(), dedupeSize: deduper.size(), metrics: metrics.snapshot() })
  });
}
