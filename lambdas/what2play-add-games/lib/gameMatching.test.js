const { normalizeGameName, calculateSimilarity } = require('./gameMatching');

describe('normalizeGameName', () => {
    it('lowercases and replaces spaces with hyphens', () => {
        expect(normalizeGameName('Hello World!')).toBe('hello-world');
    });

    it('strips punctuation', () => {
        expect(normalizeGameName("Elden Ring: DLC")).toBe('elden-ring-dlc');
    });
});

describe('calculateSimilarity', () => {
    it('returns 1 for identical strings', () => {
        expect(calculateSimilarity('abc', 'abc')).toBe(1);
    });

    it('returns lower score when prefix has long extra content', () => {
        const s = calculateSimilarity('short', 'shortandthenlotsofextra');
        expect(s).toBeLessThan(0.85);
    });
});
