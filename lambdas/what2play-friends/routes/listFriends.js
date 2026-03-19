const { queryUserFriends } = require('../data/queryUserFriends');
const { getFriendGames } = require('../data/queryFriendGames');
const { batchGetProfiles } = require('../data/batchGetProfiles');

exports.listFriends = async (dynamoClient, userId) => {
    const friends = await queryUserFriends(dynamoClient, userId);

    const friendIds = friends.map(f => f.friend_user_id);
    const profiles = await batchGetProfiles(dynamoClient, friendIds);

    let response = {
        friends: friends.map(f => ({
            user_id: f.friend_user_id,
            username: f.friend_username,
            added_date: f.added_date,
            avatar_url: profiles[f.friend_user_id]?.avatar_url || null,
            preferred_platform: profiles[f.friend_user_id]?.preferred_platform || null,
            real_name: profiles[f.friend_user_id]?.real_name || null
        }))
    };

    for (const friend in response.friends) {
        const friendGames = await getFriendGames(dynamoClient, response.friends[friend].user_id);
        response.friends[friend].game_count = friendGames.length;
    }

    return response;
};