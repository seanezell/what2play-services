const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');

exports.updateUserGame = async (dynamoClient, userId, gameId, platform, weight) => {
    const updateExpression = [];
    const expressionAttributeValues = {};
    
    if (platform) {
        updateExpression.push('platform = :platform');
        expressionAttributeValues[':platform'] = platform;
    }
    
    if (weight !== undefined) {
        updateExpression.push('weight = :weight');
        expressionAttributeValues[':weight'] = weight;
    }
    
    if (updateExpression.length === 0) {
        return {
            statusCode: 400,
            error: 'At least one field (platform or weight) must be provided'
        };
    }

    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${userId}`,
            SK: `GAME#${gameId}`
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoClient.send(new UpdateCommand(params));
    
    return {
        message: 'Game updated successfully',
        game: result.Attributes
    };
};