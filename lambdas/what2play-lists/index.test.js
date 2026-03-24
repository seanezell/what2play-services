jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn(),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn(() => ({})),
    },
}));

jest.mock('./routes', () => ({
    getTopAndRecentGames: jest.fn(),
}));

const routes = require('./routes');
const { clearCache } = require('./lib/cache');
const { handler } = require('./index');

describe('what2play-lists handler', () => {
    beforeEach(() => {
        clearCache();
        jest.clearAllMocks();
        routes.getTopAndRecentGames.mockResolvedValue({ top: [], recent: [] });
    });

    it('rejects non-GET', async () => {
        await expect(handler({ httpMethod: 'POST', query: {} })).rejects.toBe(
            JSON.stringify({ statusCode: 405, error: 'Method not allowed' })
        );
    });

    it('GET fetches and caches lists', async () => {
        const r1 = await handler({ httpMethod: 'GET', query: { type: 'top' } });
        const r2 = await handler({ httpMethod: 'GET', query: { type: 'top' } });
        expect(r1).toEqual({ top: [], recent: [] });
        expect(r2).toEqual(r1);
        expect(routes.getTopAndRecentGames).toHaveBeenCalledTimes(1);
    });
});
