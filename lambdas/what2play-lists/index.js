const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { getTopAndRecentGames } = require('./routes');

// In-memory cache with TTL (5 minutes per list type)
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const getCacheKey = (queryParams) => {
    const type = queryParams?.type || 'top';
    const limit = queryParams?.limit || '5';
    const lastKey = queryParams?.lastKey || 'none';
    return `${type}:${limit}:${lastKey}`;
};

const getCachedResult = (cacheKey) => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
        console.log('Cache hit for key:', cacheKey);
        return cached.data;
    }
    if (cached) {
        cache.delete(cacheKey);
    }
    return null;
};

const setCachedResult = (cacheKey, data) => {
    cache.set(cacheKey, {
        data: data,
        expiresAt: Date.now() + CACHE_TTL_MS
    });
    console.log('Cache set for key:', cacheKey, 'TTL: 5 minutes');
};

exports.handler = async (event) => {
    try {
        const { httpMethod, query } = event;
        
        // GET only endpoint
        if (httpMethod !== 'GET') {
            throw new HttpError(405, 'Method not allowed');
        }

        // Extract query parameters
        const queryParams = query || {};

        // Check cache first
        const cacheKey = getCacheKey(queryParams);
        const cachedResult = getCachedResult(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        // Fetch from database
        const result = await getTopAndRecentGames(dynamoClient, queryParams);

        // Cache the result
        setCachedResult(cacheKey, result);

        return result;
        
    } catch (error) {
        console.error('Lambda error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        throw JSON.stringify({ statusCode, error: message });
    }
};
