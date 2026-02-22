const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.getUserGames = async (dynamoClient, userIds) => {
    const gamesByUser = {};
    
    for (const userId of userIds) {
        const params = {
            TableName: 'what2play',
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'GAME#'
            }
        };
        
        const result = await dynamoClient.send(new QueryCommand(params));
        gamesByUser[userId] = (result.Items || []).map(item => item.game_id);
    }
    
    return gamesByUser;
};
