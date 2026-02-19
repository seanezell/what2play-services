const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');

exports.removeFriendship = async (dynamoClient, userId, friendUserId) => {
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${userId}`,
            SK: `FRIEND#${friendUserId}`
        }
    };
    
    await dynamoClient.send(new DeleteCommand(params));
};
