jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn(),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn(() => ({})),
    },
}));

jest.mock('./routes', () => ({
    listUserGames: jest.fn(),
    removeUserGame: jest.fn(),
    updateUserGame: jest.fn(),
}));

const routes = require('./routes');
const { handler } = require('./index');

describe('what2play-user-games handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        routes.listUserGames.mockResolvedValue({ games: [] });
        routes.removeUserGame.mockResolvedValue({ ok: true });
        routes.updateUserGame.mockResolvedValue({ ok: true });
    });

    it('returns 401 when user_id missing', async () => {
        await expect(handler({ httpMethod: 'GET' })).rejects.toBe(
            JSON.stringify({ statusCode: 401, error: 'User not authenticated' })
        );
    });

    it('GET lists user games', async () => {
        await handler({ httpMethod: 'GET', user_id: 'u1' });
        expect(routes.listUserGames).toHaveBeenCalledWith(expect.anything(), 'u1');
    });

    it('DELETE removes a game', async () => {
        await handler({
            httpMethod: 'DELETE',
            user_id: 'u1',
            game_id: 'g1',
        });
        expect(routes.removeUserGame).toHaveBeenCalled();
    });

    it('PUT updates a game', async () => {
        await handler({
            httpMethod: 'PUT',
            user_id: 'u1',
            game_id: 'g1',
            platform: 'pc',
            weight: 3,
            visibility: 'friends',
        });
        expect(routes.updateUserGame).toHaveBeenCalled();
    });
});
