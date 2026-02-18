const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.usernameExists = async (dynamoClient, username) => {
    const params = {
        TableName: 'what2play',
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `USERNAME#${username.toLowerCase()}` },
    };

    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items && result.Items.length > 0;
};
