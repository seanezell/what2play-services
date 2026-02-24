const { getGroupById } = require('../data');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.getGroupDetails = async (dynamoClient, user_id, group_id) => {
    const group = await getGroupById(dynamoClient, user_id, group_id);
    
    if (!group) {
        throw new HttpError(404, 'Group not found');
    }
    
    return {
        group_id: group.group_id,
        group_name: group.group_name,
        owner_id: group.owner_id,
        members: group.members,
        created_date: group.created_date,
        pick_history: group.pick_history || []
    };
};