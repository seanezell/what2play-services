const { removeFriendship } = require('../data/removeFriendship');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.removeFriend = async (dynamoClient, userId, friendUserId) => {
    if (!friendUserId) {
        throw new HttpError(400, 'friend_user_id is required');
    }
    
    await removeFriendship(dynamoClient, userId, friendUserId);
    
    return {
        message: 'Friend removed successfully'
    };
};
