const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.getGameDetails = async (dynamoClient, gameId) => {
    const params = {
        TableName: 'what2play',
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': `GAME#${gameId}`,
            ':sk': 'METADATA'
        }
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items?.[0];
}