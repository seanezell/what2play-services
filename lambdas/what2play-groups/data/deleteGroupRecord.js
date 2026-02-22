const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');

exports.deleteGroupRecord = async (dynamoClient, ownerId, groupId) => {
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${ownerId}`,
            SK: `GROUP#${groupId}`
        },
        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
    };
    
    await dynamoClient.send(new DeleteCommand(params));
};
