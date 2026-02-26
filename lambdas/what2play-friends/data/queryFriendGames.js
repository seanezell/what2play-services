const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.getFriendGames = async (dynamoClient, userId) => {
    const params = {
        TableName: 'what2play',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': 'GAME#'
        }
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items || [];
};
