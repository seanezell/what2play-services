const { deleteGroupRecord } = require('../data');

exports.deleteGroup = async (dynamoClient, user_id, group_id) => {
    try {
        await deleteGroupRecord(dynamoClient, user_id, group_id);
        
        return {
            message: 'Group deleted successfully'
        };
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 404,
                error: 'Group not found'
            };
        }
        throw error;
    }
};