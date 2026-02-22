const { getGroupById } = require('../data');

exports.getGroupDetails = async (dynamoClient, user_id, group_id) => {
    const group = await getGroupById(dynamoClient, user_id, group_id);
    
    if (!group) {
        return {
            statusCode: 404,
            error: 'Group not found'
        };
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            group_id: group.group_id,
            group_name: group.group_name,
            owner_id: group.owner_id,
            members: group.members,
            created_date: group.created_date,
            pick_history: group.pick_history || []
        })
    };
};