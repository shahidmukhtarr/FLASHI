import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 900, // 15 minutes default
  checkperiod: 120,
  useClones: false
});

export function getCached(key) {
  return cache.get(key);
}

export function setCache(key, value, ttl) {
  return cache.set(key, value, ttl);
}

export function generateCacheKey(type, query) {
  return `${type}:${query.toLowerCase().trim().replace(/\s+/g, '_')}`;
}

export function clearCache() {
  cache.flushAll();
}

export function getCacheStats() {
  return cache.getStats();
}

export default { getCached, setCache, generateCacheKey, clearCache, getCacheStats };
