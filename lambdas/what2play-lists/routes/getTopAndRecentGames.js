const { getTopGames, getRecentGames } = require('../data');

class HttpError extends Error {
    constructor(statusCode, message, data = {}) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}

exports.getTopAndRecentGames = async (dynamoClient, queryParams) => {
    // Extract and validate query parameters
    const listType = queryParams?.type || 'top';
    const limit = Math.min(Math.max(parseInt(queryParams?.limit) || 5, 1), 100); // Ensure 1-100 range, default 5
    const lastEvaluatedKey = queryParams?.lastKey ? JSON.parse(Buffer.from(queryParams.lastKey, 'base64').toString()) : null;

    if (!['top', 'recent'].includes(listType)) {
        throw new HttpError(400, 'Invalid list type. Must be "top" or "recent".');
    }

    try {
        if (listType === 'top') {
            const result = await getTopGames(dynamoClient, limit, lastEvaluatedKey);
            return {
                list_type: 'top',
                items: result.items,
                limit: limit,
                next_page: result.lastEvaluatedKey ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64') : null
            };
        } else {
            const result = await getRecentGames(dynamoClient, limit, lastEvaluatedKey);
            return {
                list_type: 'recent',
                items: result.items,
                limit: limit,
                next_page: result.lastEvaluatedKey ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64') : null
            };
        }
    } catch (error) {
        console.error('Error fetching list:', error);
        throw new HttpError(500, 'Failed to fetch list', { error: error.message });
    }
};
