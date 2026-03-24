const {
    getCacheKey,
    getCachedResult,
    setCachedResult,
    clearCache,
    CACHE_TTL_MS,
} = require('./cache');

describe('lists cache', () => {
    beforeEach(() => {
        clearCache();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('builds stable keys from query params', () => {
        expect(getCacheKey({})).toBe('top:5:none');
        expect(getCacheKey({ type: 'recent', limit: '10', lastKey: 'abc' })).toBe('recent:10:abc');
    });

    it('returns null on miss', () => {
        expect(getCachedResult('top:5:none')).toBeNull();
    });

    it('returns data before TTL expires', () => {
        const key = 'top:5:none';
        setCachedResult(key, { games: [1] });
        expect(getCachedResult(key)).toEqual({ games: [1] });
    });

    it('drops expired entries', () => {
        const key = 'top:5:none';
        setCachedResult(key, { x: 1 });
        jest.advanceTimersByTime(CACHE_TTL_MS + 1);
        expect(getCachedResult(key)).toBeNull();
    });
});
