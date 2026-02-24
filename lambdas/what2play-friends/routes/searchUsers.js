const { searchUsersByUsername } = require('../data/searchUsersByUsername');
const { queryUserFriends } = require('../data/queryUserFriends');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.searchUsers = async (dynamoClient, userId, query) => {
    if (!query || query.length < 2) {
        throw new HttpError(400, 'Query must be at least 2 characters');
    }
    
    // Get search results and current friends list
    const [results, friends] = await Promise.all([
        searchUsersByUsername(dynamoClient, query),
        queryUserFriends(dynamoClient, userId)
    ]);
    
    // Create set of friend user IDs for fast lookup
    const friendIds = new Set(friends.map(f => f.friend_user_id));
    
    // Filter out current user and existing friends
    const filteredResults = results.filter(r => {
        const userIdFromSK = r.SK?.replace('USER#', '');
        return userIdFromSK !== userId && !friendIds.has(userIdFromSK);
    });
    
    return {
        users: filteredResults.map(r => ({
            user_id: r.SK?.replace('USER#', ''),
            username: r.PK?.replace('USERNAME#', '')
        }))
    };
};
