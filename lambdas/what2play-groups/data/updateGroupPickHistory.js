const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');

exports.updateGroupPickHistory = async (dynamoClient, ownerId, groupId, pickedGame) => {
    const now = new Date().toISOString();
    
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${ownerId}`,
            SK: `GROUP#${groupId}`
        },
        UpdateExpression: 'SET pick_history = list_append(if_not_exists(pick_history, :empty), :pick)',
        ExpressionAttributeValues: {
            ':pick': [{
                game_id: pickedGame.game_id,
                game_name: pickedGame.game_name,
                picked_date: now
            }],
            ':empty': []
        },
        ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoClient.send(new UpdateCommand(params));
    return result.Attributes;
};
