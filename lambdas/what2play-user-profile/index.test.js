jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn(),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn(() => ({})),
    },
}));

jest.mock('./routes', () => ({
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    validateUsername: jest.fn(),
    generateAvatarUploadUrl: jest.fn(),
}));

const routes = require('./routes');
const { handler } = require('./index');

describe('what2play-user-profile handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        routes.getUserProfile.mockResolvedValue({ user_id: 'u1' });
        routes.updateUserProfile.mockResolvedValue({ ok: true });
        routes.validateUsername.mockResolvedValue({ valid: true });
        routes.generateAvatarUploadUrl.mockResolvedValue({ uploadUrl: 'https://example.com' });
    });

    it('requires user_id', async () => {
        await expect(handler({ httpMethod: 'GET' })).rejects.toBe(
            JSON.stringify({ statusCode: 401, error: 'User not authenticated' })
        );
    });

    it('GET returns profile', async () => {
        await handler({ httpMethod: 'GET', user_id: 'u1' });
        expect(routes.getUserProfile).toHaveBeenCalledWith(expect.anything(), 'u1');
    });

    it('POST /avatar requests upload URL', async () => {
        await handler({
            httpMethod: 'POST',
            path: '/user/profile/avatar',
            user_id: 'u1',
        });
        expect(routes.generateAvatarUploadUrl).toHaveBeenCalledWith('u1');
    });

    it('POST without avatar path validates username', async () => {
        await handler({
            httpMethod: 'POST',
            path: '/user/validate',
            user_id: 'u1',
            username: 'bob',
        });
        expect(routes.validateUsername).toHaveBeenCalled();
    });
});
