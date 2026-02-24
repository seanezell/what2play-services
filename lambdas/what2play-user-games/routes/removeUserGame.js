const { deleteUserGame } = require('../data');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.removeUserGame = async (dynamoClient, userId, gameId) => {
    if (!gameId) {
        throw new HttpError(400, 'game_id is required');
    }
    
    await deleteUserGame(dynamoClient, userId, gameId);
    
    return {
        message: 'Game removed from collection'
    };
}