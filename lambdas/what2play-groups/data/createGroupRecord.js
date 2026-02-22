const { PutCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('node:crypto');

exports.createGroupRecord = async (dynamoClient, ownerId, groupName, memberIds) => {
    const now = new Date().toISOString();
    const groupId = crypto.randomUUID();
    
    // Create sorted member hash for duplicate detection
    const allMembers = [ownerId, ...memberIds].sort((a, b) => a.localeCompare(b));
    const memberHash = crypto.createHash('sha256').update(allMembers.join(',')).digest('hex');
    
    // Get member profiles for usernames
    const profileParams = {
        RequestItems: {
            'what2play': {
                Keys: memberIds.map(id => ({ PK: `USER#${id}`, SK: 'PROFILE' }))
            }
        }
    };
    
    const profileResult = await dynamoClient.send(new BatchGetCommand(profileParams));
    const profiles = profileResult.Responses?.what2play || [];
    
    const members = memberIds.map(id => {
        const profile = profiles.find(p => p.PK === `USER#${id}`);
        return {
            user_id: id,
            username: profile?.username || 'Unknown'
        };
    });
    
    const params = {
        TableName: 'what2play',
        Item: {
            PK: `USER#${ownerId}`,
            SK: `GROUP#${groupId}`,
            group_id: groupId,
            group_name: groupName,
            owner_id: ownerId,
            members,
            member_hash: memberHash,
            created_date: now,
            pick_history: []
        },
        ConditionExpression: 'attribute_not_exists(PK) OR attribute_not_exists(SK)'
    };
    
    await dynamoClient.send(new PutCommand(params));
    return params.Item;
};
