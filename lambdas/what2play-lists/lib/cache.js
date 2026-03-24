const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const getCacheKey = (queryParams) => {
    const type = queryParams?.type || 'top';
    const limit = queryParams?.limit || '5';
    const lastKey = queryParams?.lastKey || 'none';
    return `${type}:${limit}:${lastKey}`;
};

const getCachedResult = (cacheKey) => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
        console.log('Cache hit for key:', cacheKey);
        return cached.data;
    }
    if (cached) {
        cache.delete(cacheKey);
    }
    return null;
};

const setCachedResult = (cacheKey, data) => {
    cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
    });
    console.log('Cache set for key:', cacheKey, 'TTL: 5 minutes');
};

/** For tests only — clears in-memory cache between cases */
const clearCache = () => cache.clear();

module.exports = {
    CACHE_TTL_MS,
    getCacheKey,
    getCachedResult,
    setCachedResult,
    clearCache,
};
