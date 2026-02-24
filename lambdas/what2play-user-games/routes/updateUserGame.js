const { updateUserGame } = require('../data');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.updateUserGame = async (dynamoClient, userId, gameId, platform, weight) => {
    if (!gameId) {
        throw new HttpError(400, 'game_id is required');
    }
    
    const result = await updateUserGame(dynamoClient, userId, gameId, platform, weight);
    
    return {
        message: 'Game updated successfully',
        game: result.Attributes
    };
};