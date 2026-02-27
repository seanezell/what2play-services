const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.getRecentGames = async (dynamoClient, limit = 5, lastEvaluatedKey = null) => {
    // Query picks in reverse chronological order (most recent first)
    const params = {
        TableName: 'what2play-picks',
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': 'PICKS'
        },
        // Sort by SK (timestamp) descending (most recent first)
        ScanIndexForward: false,
        Limit: limit,
        ProjectionExpression: 'game_id, game_name, group_name, picked_date, #ts'
    };

    // Add pagination
    if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
    }

    // Add timestamp to expression attribute names since it might conflict
    params.ExpressionAttributeNames = {
        '#ts': 'SK'
    };

    try {
        const result = await dynamoClient.send(new QueryCommand(params));
        
        // Extract game metadata for each recent pick
        const items = (result.Items || []).map(item => ({
            game_id: item.game_id,
            game_name: item.game_name,
            group_name: item.group_name,
            picked_date: item.picked_date
        }));
        
        return {
            items: items,
            lastEvaluatedKey: result.LastEvaluatedKey || null
        };
    } catch (error) {
        console.error('Error querying recent games:', error);
        throw error;
    }
};
