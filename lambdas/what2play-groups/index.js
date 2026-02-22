const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

const { createGroup, listGroups, getGroupDetails, deleteGroup, pickGameForGroup } = require('./routes');

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { user_id, http_method, group_id, group_name, member_ids } = event;
        
        if (!user_id) {
            return {
                statusCode: 401,
                error: 'User not authenticated'
            };
        }
        
        switch (http_method) {
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