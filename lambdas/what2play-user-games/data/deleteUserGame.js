const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');

exports.deleteUserGame = async (dynamoClient, userId, gameId) => {
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${userId}`,
            SK: `GAME#${gameId}`
        }
    };
    
    await dynamoClient.send(new DeleteCommand(params));

    return {
        message: 'Game removed from collection'
    };
};