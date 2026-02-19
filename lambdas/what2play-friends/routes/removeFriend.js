const { removeFriendship } = require('../data/removeFriendship');

exports.removeFriend = async (dynamoClient, userId, friendUserId) => {
    // Validate friend_user_id
    if (!friendUserId) {
        return {
            statusCode: 400,
            error: 'friend_user_id is required'
        };
    }
    
    await removeFriendship(dynamoClient, userId, friendUserId);
    
    return {
        message: 'Friend removed successfully'
    };
};
