const { updateUserGame } = require('../data/updateUserGame');

exports.updateUserGame = async (dynamoClient, userId, gameId, platform, weight) => {
    if (!gameId) {
        return {
            statusCode: 400,
            error: 'game_id is required'
        };
    }
    
    const result = await updateUserGame(dynamoClient, userId, gameId, platform, weight);
    
    return {
        message: 'Game updated successfully',
        game: result.Attributes
    };
};