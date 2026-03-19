const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { createGroup, listGroups, getGroupDetails, deleteGroup, pickGameForGroup, updateGroup } = require('./routes');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { user_id, httpMethod, group_id, group_name, member_ids, members } = event;
        
        if (!user_id) {
            throw new HttpError(401, 'User not authenticated');
        }
        
        switch (httpMethod) {
            case 'POST':
                if (event.path.includes('/create')) {
                    return await createGroup(dynamoClient, user_id, group_name, member_ids);
                } else {
                    return await pickGameForGroup(dynamoClient, user_id, group_id);
                }
            case 'GET':
                if (event.path.includes('/list')) {
                    return await listGroups(dynamoClient, user_id);
                } else {
                    return await getGroupDetails(dynamoClient, user_id, group_id);
                }
            case 'DELETE':
                return await deleteGroup(dynamoClient, user_id, group_id);
            case 'PUT':
                return await updateGroup(dynamoClient, user_id, group_id, { group_name, members });
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