/**
 * Tiny in-memory promise cache for read-only requests that multiple
 * components on the same page would otherwise re-fire (e.g. likes
 * per ProductCard, merchant profiles for cart merchant labels).
 *
 * - Caches for `ttl` ms.
 * - In-flight calls are deduped (parallel callers share the same promise).
 * - Browser-only (the module is loaded only from "use client" code).
 *
 * We don't persist this to disk; a hard reload is fine to refetch.
 */
const store = new Map(); // key -> { expires, promise, value }

export function memoGet(key, fetcher, { ttl = 60_000 } = {}) {
  const now = Date.now();
  const cached = store.get(key);
  if (cached) {
    if (cached.expires > now) {
      return cached.promise;
    }
    // Expired — drop and refetch.
    store.delete(key);
  }
  const p = Promise.resolve()
    .then(fetcher)
    .then((value) => {
      const entry = store.get(key);
      // Only overwrite the cache if this is still the active call.
      if (!entry || entry.promise === p) {
        store.set(key, { expires: Date.now() + ttl, promise: p, value });
      }
      return value;
    })
    .catch((err) => {
      // On error, evict so callers can retry.
      store.delete(key);
      throw err;
    });
  store.set(key, { expires: now + ttl, promise: p });
  return p;
}

export function memoClear(key) {
  if (key === undefined) store.clear();
  else store.delete(key);
}

export default { memoGet, memoClear };
