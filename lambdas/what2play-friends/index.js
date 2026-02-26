const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { listFriends, addFriend, removeFriend, searchUsers, getFriendGames } = require('./routes');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { httpMethod, user_id } = event;
        
        if (!user_id) {
            throw new HttpError(401, 'User not authenticated');
        }

        switch (httpMethod) {
            case 'GET':
                if (event.path.includes('/search')) {
                    return await searchUsers(dynamoClient, user_id, event.query);
                } else if (event.path.includes('/games')) {
                    return await getFriendGames(dynamoClient, user_id, event.friend_user_id);
                } else {
                    return await listFriends(dynamoClient, user_id);
                }
            case 'POST':
                return await addFriend(dynamoClient, user_id, event.friend_user_id);
            case 'DELETE':
                return await removeFriend(dynamoClient, user_id, event.friend_user_id);
            default:
                throw new HttpError(405, 'Method not allowed');
        }
    }
    catch (error) {
        console.error('Lambda error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        throw JSON.stringify({ statusCode, error: message });
    }
};