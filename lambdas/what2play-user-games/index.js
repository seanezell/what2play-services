const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { listUserGames, removeUserGame, updateUserGame } = require('./routes');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.handler = async (event) => {
    try {
        const { user_id, httpMethod, game_id, platform, weight, visibility } = event;
        
        if (!user_id) {
            throw new HttpError(401, 'User not authenticated');
        }
        
        switch (httpMethod) {
            case 'GET':
                return await listUserGames(dynamoClient, user_id);
            case 'DELETE':
                return await removeUserGame(dynamoClient, user_id, game_id);
            case 'PUT':
                return await updateUserGame(dynamoClient, user_id, game_id, platform, weight, visibility);
            default:
                throw new HttpError(405, 'Method not allowed');
        }
        
    } catch (error) {
        console.error('Lambda error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        throw JSON.stringify({ statusCode, error: message });
    }
};