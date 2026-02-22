const { GetCommand } = require('@aws-sdk/lib-dynamodb');

exports.getGroupById = async (dynamoClient, ownerId, groupId) => {
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${ownerId}`,
            SK: `GROUP#${groupId}`
        }
    };
    
    const result = await dynamoClient.send(new GetCommand(params));
    return result.Item;
};
