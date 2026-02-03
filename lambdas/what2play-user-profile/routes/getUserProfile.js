const { loadUserProfile } = require('../data/loadUserProfile');

exports.getUserProfile = async (dynamoClient, userId) => {
    const profile = await loadUserProfile(dynamoClient, userId);
    
    if (!profile) {
        return {
            statusCode: 404,
            error: 'Profile not found'
        };
    }
    
    return { profile };
};