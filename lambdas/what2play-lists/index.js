const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { getTopAndRecentGames } = require('./routes');
const { getCacheKey, getCachedResult, setCachedResult } = require('./lib/cache');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.handler = async (event) => {
    try {
        const { httpMethod, query } = event;

        if (httpMethod !== 'GET') {
            throw new HttpError(405, 'Method not allowed');
        }

        const queryParams = query || {};
        const cacheKey = getCacheKey(queryParams);
        const cachedResult = getCachedResult(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const result = await getTopAndRecentGames(dynamoClient, queryParams);
        setCachedResult(cacheKey, result);

        return result;
    } catch (error) {
        console.error('Lambda error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        throw JSON.stringify({ statusCode, error: message });
    }
};
