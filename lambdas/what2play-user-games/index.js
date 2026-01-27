const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { user_id, http_method, game_id, platform, weight } = event;
        
        if (!user_id) {
            return {
                statusCode: 401,
                error: 'User not authenticated'
            };
        }
        
        switch (http_method) {
            case 'GET':
                return await listUserGames(user_id);
            case 'DELETE':
                return await removeUserGame(user_id, game_id);
            case 'PUT':
                return await updateUserGame(user_id, game_id, platform, weight);
            default:
                return {
                    statusCode: 405,
                    error: 'Method not allowed'
                };
        }
        
    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};

async function listUserGames(userId) {
    const userGames = await getUserGames(userId);
    
    const gamesWithDetails = await Promise.all(
        userGames.map(async (userGame) => {
            const gameId = userGame.SK.replace('GAME#', '');
            const gameDetails = await getGameDetails(gameId);
            
            return {
                game_id: gameId,
                name: gameDetails?.name || 'Unknown Game',
                description: gameDetails?.description || '',
                platform: userGame.platform,
                weight: userGame.weight,
                added_date: userGame.added_date,
                steam_appid: gameDetails?.steam_appid,
                genres: gameDetails?.genres || []
            };
        })
    );
    
    return {
        games: gamesWithDetails,
        total: gamesWithDetails.length
    };
}

async function removeUserGame(userId, gameId) {
    if (!gameId) {
        return {
            statusCode: 400,
            error: 'game_id is required'
        };
    }
    
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${userId}`,
            SK: `GAME#${gameId}`
        }
    };
    
    await dynamoClient.send(new DeleteCommand(params));
    
    return {
        message: 'Game removed from collection'
    };
}

async function updateUserGame(userId, gameId, platform, weight) {
    if (!gameId) {
        return {
            statusCode: 400,
            error: 'game_id is required'
        };
    }
    
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
}

async function getUserGames(userId) {
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
}

async function getGameDetails(gameId) {
    const params = {
        TableName: 'what2play',
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': `GAME#${gameId}`,
            ':sk': 'METADATA'
        }
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items?.[0];
}