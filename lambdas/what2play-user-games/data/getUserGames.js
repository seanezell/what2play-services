const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.getUserGames = async (dynamoClient, userId) => {
    const params = {
        TableName: 'what2play',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk_prefix': 'GAME#'
        }
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items || [];
};