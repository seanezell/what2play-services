const { deleteGroupRecord } = require('../data');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.deleteGroup = async (dynamoClient, user_id, group_id) => {
    try {
        await deleteGroupRecord(dynamoClient, user_id, group_id);
        return { message: 'Group deleted successfully' };
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            throw new HttpError(404, 'Group not found');
        }
        throw error;
    }
};