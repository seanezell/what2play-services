const { queryUserGroups } = require('../data');

exports.listGroups = async (dynamoClient, user_id) => {
    const groups = await queryUserGroups(dynamoClient, user_id);
    
    return {
        groups: groups.map(g => ({
            group_id: g.group_id,
            group_name: g.group_name,
            members: g.members,
            created_date: g.created_date,
            last_pick: g.pick_history?.slice(-1)[0] || null
        }))
    };
};