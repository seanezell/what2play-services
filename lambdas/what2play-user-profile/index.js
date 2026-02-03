const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { getUserProfile } = require('./routes/getUserProfile');
const { updateUserProfile } = require('./routes/updateUserProfile');
const { validateUsername } = require('./routes/validateUsername');

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
                return await getUserProfile(dynamoClient, user_id);
            case 'PUT':
                return await updateUserProfile(dynamoClient, user_id, event);
            case 'POST':
                return await validateUsername(dynamoClient, event.username);
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