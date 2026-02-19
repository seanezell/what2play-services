const { addFriendship } = require('../data/addFriendship');
const { queryUserFriends } = require('../data/queryUserFriends');

exports.addFriend = async (dynamoClient, userId, friendUserId) => {
    // Validate friend_user_id
    if (!friendUserId) {
        return {
            statusCode: 400,
            error: 'friend_user_id is required'
        };
    }
    
    // Can't add yourself as a friend
    if (userId === friendUserId) {
        return {
            statusCode: 400,
            error: 'Cannot add yourself as a friend'
        };
    }
    
    // Check if already friends
    const existingFriends = await queryUserFriends(dynamoClient, userId);
    const alreadyFriends = existingFriends.some(f => f.friend_user_id === friendUserId);
    
    if (alreadyFriends) {
        return {
            statusCode: 409,
            error: 'Already friends with this user'
        };
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
            return {
                statusCode: 404,
                error: 'User not found'
            };
        }
        throw error;
    }
};
