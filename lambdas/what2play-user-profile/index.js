const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { getUserProfile, updateUserProfile, validateUsername, generateAvatarUploadUrl } = require('./routes');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.handler = async (event) => {
    try {
        const { httpMethod, user_id } = event;
        
        if (!user_id) {
            throw new HttpError(401, 'User not authenticated');
        }
        
        switch (httpMethod) {
            case 'GET':
                return await getUserProfile(dynamoClient, user_id);
            case 'PUT':
                return await updateUserProfile(dynamoClient, user_id, event);
            case 'POST':
                if (event.path.includes('/avatar')) {
                    return await generateAvatarUploadUrl(user_id);
                } else {
                    return await validateUsername(dynamoClient, event.username);
                }
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