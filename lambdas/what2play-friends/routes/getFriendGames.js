const { queryUserFriends } = require('../data/queryUserFriends');
const { getFriendGames } = require('../data/queryFriendGames');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.getFriendGames = async (dynamoClient, userId, friendUserId) => {
    if (!friendUserId) {
        throw new HttpError(400, 'user_id query parameter is required');
    }
    
    // Check if they are friends
    const friends = await queryUserFriends(dynamoClient, userId);
    const isFriend = friends.some(f => f.friend_user_id === friendUserId);
    
    // Get friend's games
    const games = await getFriendGames(dynamoClient, friendUserId);
    
    // Filter by visibility
    const filteredGames = games.filter(game => {
        const visibility = game.visibility || 'friends';
        if (visibility === 'public') return true;
        if (visibility === 'friends' && isFriend) return true;
        return false;
    });
    
    return {
        games: filteredGames.map(g => ({
            game_id: g.SK.replace('GAME#', ''),
            platform: g.platform,
            weight: g.weight,
            visibility: g.visibility || 'friends',
            added_date: g.added_date
        }))
    };
};
