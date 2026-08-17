// KNUT XMD — API Fallback Router
// Les URLs et clés restent dans l’environnement ; aucun secret n’est codé en dur.
import { CircuitBreaker, retry, sanitizeError } from './runtime-guard.js';

const breakers = new Map();
const getBreaker = (key) => {
  if (!breakers.has(key)) breakers.set(key, new CircuitBreaker({ failures: 3, cooldownMs: 30_000 }));
  return breakers.get(key);
};

const provider = (name, urlEnv, keyEnv = null) => ({
  name,
  url: process.env[urlEnv] || '',
  key: keyEnv ? process.env[keyEnv] || '' : ''
});

export const API_PROVIDERS = Object.freeze({
  youtube: [provider('knut-youtube', 'KNUT_API_YOUTUBE_PRIMARY_URL', 'KNUT_API_YOUTUBE_PRIMARY_KEY'), provider('reference-youtube', 'KNUT_API_YOUTUBE_FALLBACK_URL', 'KNUT_API_YOUTUBE_FALLBACK_KEY')],
  tiktok: [provider('knut-tiktok', 'KNUT_API_TIKTOK_PRIMARY_URL', 'KNUT_API_TIKTOK_PRIMARY_KEY'), provider('reference-tiktok', 'KNUT_API_TIKTOK_FALLBACK_URL', 'KNUT_API_TIKTOK_FALLBACK_KEY')],
  translate: [provider('knut-translate', 'KNUT_API_TRANSLATE_PRIMARY_URL', 'KNUT_API_TRANSLATE_PRIMARY_KEY'), provider('reference-translate', 'KNUT_API_TRANSLATE_FALLBACK_URL', 'KNUT_API_TRANSLATE_FALLBACK_KEY')],
  image: [provider('knut-image', 'KNUT_API_IMAGE_PRIMARY_URL', 'KNUT_API_IMAGE_PRIMARY_KEY'), provider('reference-image', 'KNUT_API_IMAGE_FALLBACK_URL', 'KNUT_API_IMAGE_FALLBACK_KEY')]
});

function validResponse(value) {
  return value !== null && value !== undefined && value !== false && !(typeof value === 'string' && !value.trim());
}

export async function callWithFallback(type, request, { timeoutMs = 20_000, attempts = 2, validate = validResponse } = {}) {
  const candidates = (API_PROVIDERS[type] || []).filter(item => item.url);
  if (!candidates.length) throw new Error(`${type}_provider_not_configured`);
  let lastError;
  for (const item of candidates) {
    const breaker = getBreaker(item.name);
    try {
      const result = await retry(
        () => request(item),
        { attempts, timeoutMs, label: `${type}_${item.name}`, breaker, shouldRetry: error => !/4\d\d/.test(String(error?.message || '')) }
      );
      if (!validate(result)) throw new Error(`${item.name}_invalid_response`);
      return { provider: item.name, data: result };
    } catch (error) {
      lastError = error;
      console.warn(`[KNUT API] ${type}/${item.name}: ${sanitizeError(error)}`);
    }
  }
  throw lastError || new Error(`${type}_all_providers_failed`);
}

export function publicProviderStatus() {
  return Object.fromEntries(Object.entries(API_PROVIDERS).map(([type, list]) => [
    type,
    list.map(({ name, url }) => ({ name, configured: Boolean(url), circuit: getBreaker(name).state }))
  ]));
}
