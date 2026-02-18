const { deleteUserGame } = require('../data/deleteUserGame');

exports.removeUserGame = async (dynamoClient, userId, gameId) => {
    if (!gameId) {
        return {
            statusCode: 400,
            error: 'game_id is required'
        };
    }
    
    await deleteUserGame(dynamoClient, userId, gameId);
    
    return {
        message: 'Game removed from collection'
    };
}