const { addFriendship } = require('../data/addFriendship');
const { queryUserFriends } = require('../data/queryUserFriends');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.addFriend = async (dynamoClient, userId, friendUserId) => {
    if (!friendUserId) {
        throw new HttpError(400, 'friend_user_id is required');
    }
    
    if (userId === friendUserId) {
        throw new HttpError(400, 'Cannot add yourself as a friend');
    }
    
    const existingFriends = await queryUserFriends(dynamoClient, userId);
    const alreadyFriends = existingFriends.some(f => f.friend_user_id === friendUserId);
    
    if (alreadyFriends) {
        throw new HttpError(409, 'Already friends with this user');
    }
    
    try {
        const friendship = await addFriendship(dynamoClient, userId, friendUserId);
        
        return {
            message: 'Friend added successfully',
            friend: {
                user_id: friendship.friend_user_id,
                username: friendship.friend_username,
                added_date: friendship.added_date
            }
        };
    } catch (error) {
        if (error.message === 'Friend user not found') {
            throw new HttpError(404, 'User not found');
        }
        throw error;
    }
};
