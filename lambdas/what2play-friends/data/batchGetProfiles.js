const { BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

exports.batchGetProfiles = async (dynamoClient, userIds) => {
    if (!userIds.length) return {};

    const keys = userIds.map(id => ({ PK: `USER#${id}`, SK: 'PROFILE' }));

    const result = await dynamoClient.send(new BatchGetCommand({
        RequestItems: {
            'what2play': { Keys: keys }
        }
    }));

    const profiles = result.Responses?.what2play || [];
    return profiles.reduce((acc, p) => {
        const userId = p.PK.replace('USER#', '');
        acc[userId] = {
            avatar_url: p.avatar_url || null,
            preferred_platform: p.preferred_platform || null,
            real_name: p.real_name || null
        };
        return acc;
    }, {});
};
