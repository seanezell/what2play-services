const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { getTopAndRecentGames } = require('./routes');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { httpMethod, user_id, query } = event;

        if (!user_id) {
            throw new HttpError(401, 'User not authenticated');
        }
        
        // GET only endpoint
        if (httpMethod !== 'GET') {
            throw new HttpError(405, 'Method not allowed');
        }

        // Extract query parameters
        const queryParams = query || {};

        return await getTopAndRecentGames(dynamoClient, queryParams);
        
    } catch (error) {
        console.error('Lambda error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        throw JSON.stringify({ statusCode, error: message });
    }
};
