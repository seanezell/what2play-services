const { queryUserFriends } = require('../data/queryUserFriends');

exports.listFriends = async (dynamoClient, userId) => {
    const friends = await queryUserFriends(dynamoClient, userId);
    
    return {
        friends: friends.map(f => ({
            user_id: f.friend_user_id,
            username: f.friend_username,
            added_date: f.added_date
        }))
    };
};
