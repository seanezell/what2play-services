const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');

exports.updateGroupRecord = async (dynamoClient, userId, groupId, updates) => {
    const expressions = [];
    const names = {};
    const values = {};

    if (updates.group_name !== undefined) {
        expressions.push('#gn = :group_name');
        names['#gn'] = 'group_name';
        values[':group_name'] = updates.group_name;
    }

    if (updates.members !== undefined) {
        expressions.push('#m = :members');
        names['#m'] = 'members';
        values[':members'] = updates.members;
    }

    if (!expressions.length) return;

    await dynamoClient.send(new UpdateCommand({
        TableName: 'what2play',
        Key: {
            PK: `USER#${userId}`,
            SK: `GROUP#${groupId}`
        },
        UpdateExpression: `SET ${expressions.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
    }));
};
