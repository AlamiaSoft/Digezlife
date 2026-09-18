/**
 * High-Performance Stale-While-Revalidate (SWR) Client Cache
 * Enables instant 0ms screen rendering with silent background revalidation.
 */

const memoryCache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const swrCache = {
  /**
   * Get cached data or execute fetcher with automatic SWR background update.
   * @param {string} key - Cache identifier
   * @param {Function} fetcher - Async function returning fresh data
   * @param {Object} options - { ttl, onUpdate, forceFresh }
   * @returns {Promise<{ data: any, isStale: boolean }>}
   */
  async get(key, fetcher, options = {}) {
    const { ttl = DEFAULT_TTL, onUpdate, forceFresh = false } = options;
    const cached = this.read(key);
    const now = Date.now();

    // If cache is fresh and not forced, return immediately
    if (!forceFresh && cached && (now - cached.timestamp) < ttl) {
      return { data: cached.data, isStale: false };
    }

    // If stale cache exists, trigger background fetch and return stale data immediately (0ms)
    if (!forceFresh && cached) {
      // Revalidate in background
      Promise.resolve().then(async () => {
        try {
          const freshData = await fetcher();
          if (freshData !== undefined && freshData !== null) {
            const hasChanged = JSON.stringify(cached.data) !== JSON.stringify(freshData);
            this.write(key, freshData);
            if (hasChanged && typeof onUpdate === 'function') {
              onUpdate(freshData);
            }
          }
        } catch (e) {
          // Network background fail, keep using stale
        }
      });
      return { data: cached.data, isStale: true };
    }

    // No cache exists: fetch synchronously
    try {
      const freshData = await fetcher();
      if (freshData !== undefined && freshData !== null) {
        this.write(key, freshData);
      }
      return { data: freshData, isStale: false };
    } catch (err) {
      if (cached) return { data: cached.data, isStale: true };
      throw err;
    }
  },

  read(key) {
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    try {
      const raw = localStorage.getItem(`digez_swr_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryCache.set(key, parsed);
        return parsed;
      }
    } catch (e) {}
    return null;
  },

  write(key, data) {
    const record = { data, timestamp: Date.now() };
    memoryCache.set(key, record);
    try {
      localStorage.setItem(`digez_swr_${key}`, JSON.stringify(record));
    } catch (e) {}
  },

  invalidate(pattern) {
    if (!pattern) {
      memoryCache.clear();
      return;
    }
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
        try {
          localStorage.removeItem(`digez_swr_${key}`);
        } catch (e) {}
      }
    }
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('digez_swr_') && k.includes(pattern)) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}
  },
};
