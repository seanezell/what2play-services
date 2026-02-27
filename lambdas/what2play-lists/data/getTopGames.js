const { QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

exports.getTopGames = async (dynamoClient, limit = 5, lastEvaluatedKey = null) => {
    // Query all games with metadata
    const params = {
        TableName: 'what2play',
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        ExpressionAttributeValues: {
            ':gsi1pk': 'GAME#METADATA'
        },
        ProjectionExpression: 'game_id, #name, description, steam_appid, platforms, genres, developer, publisher, pick_count, created_date'
    };

    // Add name to expression attribute names since "name" is a reserved word
    params.ExpressionAttributeNames = {
        '#name': 'name'
    };

    try {
        const result = await dynamoClient.send(new QueryCommand(params));
        
        let games = result.Items || [];
        
        // Sort by pick_count descending (highest first)
        games.sort((a, b) => (b.pick_count || 0) - (a.pick_count || 0));
        
        // Calculate pagination
        const startIndex = lastEvaluatedKey ? parseInt(lastEvaluatedKey.startIndex) : 0;
        const endIndex = startIndex + limit;
        const paginatedItems = games.slice(startIndex, endIndex);
        
        return {
            items: paginatedItems,
            lastEvaluatedKey: endIndex < games.length ? { startIndex: endIndex.toString() } : null
        };
    } catch (error) {
        console.error('Error querying top games:', error);
        throw error;
    }
};
