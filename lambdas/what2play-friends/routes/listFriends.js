const { queryUserFriends } = require('../data/queryUserFriends');
const { getFriendGames } = require('../data/queryFriendGames');

exports.listFriends = async (dynamoClient, userId) => {
    const friends = await queryUserFriends(dynamoClient, userId);
    
    let response = {
        friends: friends.map(f => ({
            user_id: f.friend_user_id,
            username: f.friend_username,
            added_date: f.added_date
        }))
    };

    for ( const friend in response.friends ) {
        const friendGames = await getFriendGames(dynamoClient, response.friends[friend].user_id);
        response.friends[friend].game_count = friendGames.length;
    }

    return response;
};