const { searchUsersByUsername } = require('../data/searchUsersByUsername');

exports.searchUsers = async (dynamoClient, userId, query) => {
    if (!query || query.length < 2) {
        return {
            statusCode: 400,
            error: 'Query must be at least 2 characters'
        };
    }
    
    const results = await searchUsersByUsername(dynamoClient, query);
    
    // Filter out current user from results
    const filteredResults = results.filter(r => {
        const userIdFromSK = r.SK?.replace('USER#', '');
        return userIdFromSK !== userId;
    });
    
    return {
        users: filteredResults.map(r => ({
            user_id: r.SK?.replace('USER#', ''),
            username: r.GSI1PK?.replace('USERNAME#', '')
        }))
    };
};
