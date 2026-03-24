jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn(),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn(() => ({})),
    },
}));

jest.mock('./routes', () => ({
    listFriends: jest.fn(),
    addFriend: jest.fn(),
    removeFriend: jest.fn(),
    searchUsers: jest.fn(),
    getFriendGames: jest.fn(),
}));

const routes = require('./routes');
const { handler } = require('./index');

describe('what2play-friends handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        routes.listFriends.mockResolvedValue([]);
        routes.addFriend.mockResolvedValue({ ok: true });
        routes.removeFriend.mockResolvedValue({ ok: true });
        routes.searchUsers.mockResolvedValue([]);
        routes.getFriendGames.mockResolvedValue({ games: [] });
    });

    it('requires user_id', async () => {
        await expect(handler({ httpMethod: 'GET', path: '/friends' })).rejects.toBe(
            JSON.stringify({ statusCode: 401, error: 'User not authenticated' })
        );
    });

    it('GET /search calls searchUsers', async () => {
        await handler({
            httpMethod: 'GET',
            path: '/friends/search',
            user_id: 'u1',
            query: { q: 'bob' },
        });
        expect(routes.searchUsers).toHaveBeenCalled();
    });

    it('GET /games calls getFriendGames', async () => {
        await handler({
            httpMethod: 'GET',
            path: '/friends/games',
            user_id: 'u1',
            friend_user_id: 'f1',
        });
        expect(routes.getFriendGames).toHaveBeenCalled();
    });

    it('GET default lists friends', async () => {
        await handler({ httpMethod: 'GET', path: '/friends', user_id: 'u1' });
        expect(routes.listFriends).toHaveBeenCalled();
    });
});
