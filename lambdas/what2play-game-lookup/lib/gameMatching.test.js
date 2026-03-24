const { filterBaseGames, findBestMatch } = require('./gameMatching');

describe('filterBaseGames', () => {
    it('filters out DLC-like titles', () => {
        const games = [
            { id: 1, name: 'Some Game' },
            { id: 2, name: 'Some Game - Season Pass DLC' },
            { id: 3, name: 'Cosmetic Pack' },
        ];
        const out = filterBaseGames(games, 'Some Game');
        expect(out.map((g) => g.id)).toEqual([1]);
    });

    it('keeps base games when search term includes hyphen pattern', () => {
        const games = [{ id: 1, name: 'Half-Life 2' }];
        const out = filterBaseGames(games, 'Half-Life 2');
        expect(out).toHaveLength(1);
    });
});

describe('findBestMatch', () => {
    it('returns exact match with high confidence', () => {
        const games = [{ id: 1, name: 'Portal 2' }];
        const r = findBestMatch(games, 'Portal 2');
        expect(r.game).toEqual(games[0]);
        expect(r.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('returns null when no games', () => {
        expect(findBestMatch([], 'x')).toBeNull();
    });
});
