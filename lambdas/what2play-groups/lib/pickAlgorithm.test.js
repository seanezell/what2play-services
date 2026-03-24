const { pickGameForGroup } = require('./pickAlgorithm');

describe('pickGameForGroup', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns null when there are no users', () => {
        expect(pickGameForGroup({})).toBeNull();
    });

    it('returns null when users have no common games', () => {
        const out = pickGameForGroup({
            u1: [{ game_id: 'a', weight: 5 }],
            u2: [{ game_id: 'b', weight: 5 }],
        });
        expect(out).toBeNull();
    });

    it('returns a common game id when all users share at least one game', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const gamesByUser = {
            u1: [{ game_id: 'g1', weight: 5 }],
            u2: [{ game_id: 'g1', weight: 5 }],
        };
        expect(pickGameForGroup(gamesByUser, [])).toBe('g1');
    });

    it('excludes last five picks from history when alternatives exist', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const gamesByUser = {
            u1: [
                { game_id: 'a', weight: 5 },
                { game_id: 'b', weight: 5 },
            ],
            u2: [
                { game_id: 'a', weight: 5 },
                { game_id: 'b', weight: 5 },
            ],
        };
        const history = [{ game_id: 'a' }, { game_id: 'x' }, { game_id: 'y' }, { game_id: 'z' }, { game_id: 'w' }];
        const pick = pickGameForGroup(gamesByUser, history);
        expect(pick).toBe('b');
    });
});
