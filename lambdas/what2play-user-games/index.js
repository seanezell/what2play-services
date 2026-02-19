const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { listUserGames, removeUserGame, updateUserGame } = require('./routes');

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { user_id, http_method, game_id, platform, weight } = event;
        
        if (!user_id) {
            return {
                statusCode: 401,
                error: 'User not authenticated'
            };
        }
        
        switch (http_method) {
            case 'GET':
                return await listUserGames(dynamoClient, user_id);
            case 'DELETE':
                return await removeUserGame(dynamoClient, user_id, game_id);
            case 'PUT':
                return await updateUserGame(dynamoClient, user_id, game_id, platform, weight);
            default:
                return {
                    statusCode: 405,
                    error: 'Method not allowed'
                };
        }
        
    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};