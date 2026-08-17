// KNUT XMD — Runtime Guard
// Protection commune pour commandes et fournisseurs externes.

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class CircuitBreaker {
  constructor({ failures = 3, cooldownMs = 30_000 } = {}) {
    this.failuresLimit = failures;
    this.cooldownMs = cooldownMs;
    this.failures = 0;
    this.openedAt = 0;
  }

  get state() {
    if (!this.openedAt) return 'closed';
    if (Date.now() - this.openedAt >= this.cooldownMs) return 'half-open';
    return 'open';
  }

  allow() { return this.state !== 'open'; }

  success() { this.failures = 0; this.openedAt = 0; }

  failure() {
    this.failures += 1;
    if (this.failures >= this.failuresLimit) this.openedAt = Date.now();
  }
}

export function withTimeout(task, timeoutMs = 20_000, label = 'operation') {
  return Promise.race([
    Promise.resolve().then(task),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label}_timeout`)), timeoutMs))
  ]);
}

export async function retry(task, {
  attempts = 3,
  baseDelayMs = 500,
  maxDelayMs = 8_000,
  timeoutMs = 20_000,
  label = 'operation',
  shouldRetry = () => true,
  breaker = null
} = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (breaker && !breaker.allow()) throw new Error(`${label}_circuit_open`);
    try {
      const value = await withTimeout(task, timeoutMs, label);
      breaker?.success();
      return value;
    } catch (error) {
      lastError = error;
      breaker?.failure();
      if (attempt >= attempts || !shouldRetry(error)) break;
      const jitter = Math.floor(Math.random() * 250);
      await sleep(Math.min(maxDelayMs, baseDelayMs * (2 ** (attempt - 1))) + jitter);
    }
  }
  throw lastError || new Error(`${label}_failed`);
}

export function createLimiter(maxConcurrent = 4) {
  let active = 0;
  const queue = [];
  const drain = () => {
    while (active < maxConcurrent && queue.length) {
      const { task, resolve, reject } = queue.shift();
      active += 1;
      Promise.resolve().then(task).then(resolve, reject).finally(() => {
        active -= 1;
        drain();
      });
    }
  };
  return (task) => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    drain();
  });
}

export function sanitizeError(error) {
  return String(error?.message || error || 'unknown_error')
    .replace(/([?&](?:apikey|api_key|token|access_token|password)=)[^&\s]+/gi, '$1[redacted]')
    .slice(0, 240);
}
