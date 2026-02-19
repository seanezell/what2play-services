const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { listFriends, addFriend, removeFriend, searchUsers } = require('./routes');

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { httpMethod, user_id } = event;
        
        if (!user_id) {
            return {
                statusCode: 401,
                error: 'User not authenticated'
            };
        }

        switch (httpMethod) {
            case 'GET':
                // Check path to determine which GET operation
                if (event.path.includes('/search')) {
                    return await searchUsers(dynamoClient, user_id, event.query);
                } else {
                    return await listFriends(dynamoClient, user_id);
                }
            case 'POST':
                return await addFriend(dynamoClient, user_id, event.friend_user_id);
            case 'DELETE':
                return await removeFriend(dynamoClient, user_id, event.friend_user_id);
            default:
                return { statusCode: 405, error: 'Method not allowed' };
        }
    }
    catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};