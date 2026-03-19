const { getGroupById } = require('../data');
const { updateGroupRecord } = require('../data/updateGroupRecord');

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.updateGroup = async (dynamoClient, userId, groupId, updates) => {
    const group = await getGroupById(dynamoClient, userId, groupId);

    if (!group) {
        throw new HttpError(404, 'Group not found');
    }

    if (group.owner_id !== userId) {
        throw new HttpError(403, 'Only the group owner can update this group');
    }

    const sanitized = {};

    if (updates.group_name !== undefined) {
        if (!updates.group_name.trim()) {
            throw new HttpError(400, 'group_name cannot be empty');
        }
        sanitized.group_name = updates.group_name.trim();
    }

    if (updates.members !== undefined) {
        const ownerInMembers = updates.members.some(m => m.user_id === userId);
        if (!ownerInMembers) {
            throw new HttpError(400, 'Owner must remain in the members list');
        }
        sanitized.members = updates.members;
    }

    await updateGroupRecord(dynamoClient, userId, groupId, sanitized);

    return {
        group_id: group.group_id,
        group_name: sanitized.group_name ?? group.group_name,
        owner_id: group.owner_id,
        members: sanitized.members ?? group.members,
        created_date: group.created_date,
        pick_history: group.pick_history || []
    };
};
