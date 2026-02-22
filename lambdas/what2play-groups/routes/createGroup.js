const { createGroupRecord, queryUserGroups } = require('../data');
const crypto = require('node:crypto');

exports.createGroup = async (dynamoClient, user_id, group_name, member_ids) => {
    // Check for duplicate group by member_hash
    const existingGroups = await queryUserGroups(dynamoClient, user_id);
    const allMembers = [user_id, ...member_ids].sort((a, b) => a.localeCompare(b));
    const memberHash = crypto.createHash('sha256').update(allMembers.join(',')).digest('hex');
    
    const duplicate = existingGroups.find(g => g.member_hash === memberHash);
    if (duplicate) {
        return {
            statusCode: 409,
            error: 'Group with these members already exists',
            existing_group_id: duplicate.group_id
        };
    }
    
    const group = await createGroupRecord(dynamoClient, user_id, group_name, member_ids);
    
    return {
        message: 'Group created successfully',
        group: {
            group_id: group.group_id,
            group_name: group.group_name,
            members: group.members,
            created_date: group.created_date
        }
    };
};