const { UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

exports.updateGroupPickHistory = async (dynamoClient, ownerId, groupId, pickedGame, groupName) => {
    const now = new Date().toISOString();
    
    // Update group's pick history
    const groupParams = {
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
                group_name: groupName,
                picked_date: now
            }],
            ':empty': []
        },
        ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoClient.send(new UpdateCommand(groupParams));

    // Write to picks table for recent picks query
    const pickParams = {
        TableName: 'what2play-picks',
        Item: {
            PK: 'PICKS',
            SK: `${now}#${ownerId}#${groupId}#${pickedGame.game_id}`,
            game_id: pickedGame.game_id,
            game_name: pickedGame.game_name,
            group_name: groupName,
            user_id: ownerId,
            group_id: groupId,
            picked_date: now
        }
    };

    await dynamoClient.send(new PutCommand(pickParams));

    // Increment game's pick counter
    const gameCounterParams = {
        TableName: 'what2play',
        Key: {
            PK: `GAME#${pickedGame.game_id}`,
            SK: 'METADATA'
        },
        UpdateExpression: 'SET pick_count = if_not_exists(pick_count, :zero) + :inc, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk',
        ExpressionAttributeValues: {
            ':zero': 0,
            ':inc': 1,
            ':gsi1pk': 'GAME#METADATA',
            ':gsi1sk': 'GAME#METADATA'
        }
    };

    await dynamoClient.send(new UpdateCommand(gameCounterParams));

    return result.Attributes;
};
