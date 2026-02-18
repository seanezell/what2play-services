const { PutCommand } = require('@aws-sdk/lib-dynamodb');

exports.linkGameToUser = async (dynamoClient, userId, gameId, platform, weight) => {
    const params = {
        TableName: 'what2play',
        Item: {
            PK: `USER#${userId}`,
            SK: `GAME#${gameId}`,
            platform,
            weight,
            added_date: new Date().toISOString()
        }
    };
    
    await dynamoClient.send(new PutCommand(params));
};