const { GetCommand } = require('@aws-sdk/lib-dynamodb');

exports.loadUserProfile = async (dynamoClient, userId) => {
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${userId}`,
            SK: 'PROFILE'
        }
    };
    
    const result = await dynamoClient.send(new GetCommand(params));

    return result.Item ?? null;
};