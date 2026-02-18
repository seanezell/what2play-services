const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.queryGameByName = async (dynamoClient, normalizedGameName) => {
    const params = {
        TableName: 'what2play',
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': `GAME#${normalizedGameName}`,
            ':sk': 'METADATA'
        }
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items?.[0] || null;
};
