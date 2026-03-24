jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn(),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn(() => ({})),
    },
}));

jest.mock('./routes', () => ({
    createGroup: jest.fn(),
    listGroups: jest.fn(),
    getGroupDetails: jest.fn(),
    deleteGroup: jest.fn(),
    pickGameForGroup: jest.fn(),
    updateGroup: jest.fn(),
}));

const routes = require('./routes');
const { handler } = require('./index');

describe('what2play-groups handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        routes.createGroup.mockResolvedValue({ id: 'g1' });
        routes.listGroups.mockResolvedValue([]);
        routes.getGroupDetails.mockResolvedValue({});
        routes.deleteGroup.mockResolvedValue({ ok: true });
        routes.pickGameForGroup.mockResolvedValue({ game_id: 'x' });
        routes.updateGroup.mockResolvedValue({ ok: true });
    });

    it('requires user_id', async () => {
        await expect(handler({ httpMethod: 'GET', path: '/groups/list' })).rejects.toBe(
            JSON.stringify({ statusCode: 401, error: 'User not authenticated' })
        );
    });

    it('POST /create creates a group', async () => {
        await handler({
            httpMethod: 'POST',
            path: '/groups/create',
            user_id: 'u1',
            group_name: 'Squad',
            member_ids: ['a', 'b'],
        });
        expect(routes.createGroup).toHaveBeenCalled();
    });

    it('GET /list lists groups', async () => {
        await handler({ httpMethod: 'GET', path: '/groups/list', user_id: 'u1' });
        expect(routes.listGroups).toHaveBeenCalled();
    });
});
