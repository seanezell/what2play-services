const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());
const lambdaClient = new LambdaClient();

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        // With AWS integration type, the body is already parsed and passed directly
        const { game_name, platform, weight = 5, additional_details, user_id } = event;
        
        // Validate required fields
        if (!game_name || !platform) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'game_name and platform are required' })
            };
        }
        
        if (!user_id) {
            return {
                statusCode: 401,
                error: 'User not authenticated'
            };
        }
        
        console.log(`Processing game: ${game_name} for user: ${user_id}`);
        
        // Step 1: Check if game exists
        const existingGame = await findExistingGame(game_name);
        
        if (existingGame) {
            // Step 1a: Game exists, just link to user
            await linkGameToUser(user_id, existingGame.game_id, platform, weight);
            return {
                message: 'Game added to your collection',
                game: existingGame 
            };
        }
        
        // Step 1b: Game doesn't exist, invoke AI lookup
        const gameDetails = await invokeGameLookup(game_name, additional_details);
        
        if (gameDetails.confidence > 0.8) {
            // High confidence - auto-add
            const game_id = await createGame(gameDetails);
            await linkGameToUser(user_id, game_id, platform, weight);
            
            return {
                message: 'New game added to collection',
                game: gameDetails 
            };
        } else {
            // Low confidence - ask for clarification
            return {
                message: 'Need more details',
                suggestions: gameDetails.suggestions,
                requires_confirmation: true
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

async function findExistingGame(gameName) {
    // Try exact match first
    const exactParams = {
        TableName: 'what2play',
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': `GAME#${normalizeGameName(gameName)}`,
            ':sk': 'METADATA'
        }
    };
    
    const exactResult = await dynamoClient.send(new QueryCommand(exactParams));
    if (exactResult.Items?.length > 0) {
        return exactResult.Items[0];
    }
    
    // If no exact match, scan for similar names
    const scanParams = {
        TableName: 'what2play',
        FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
        ExpressionAttributeValues: {
            ':prefix': 'GAME#',
            ':sk': 'METADATA'
        }
    };
    
    const scanResult = await dynamoClient.send(new ScanCommand(scanParams));
    const games = scanResult.Items || [];
    
    // Find similar game names
    const normalizedSearch = normalizeGameName(gameName);
    for (const game of games) {
        const gameId = game.PK.replace('GAME#', '');
        if (calculateSimilarity(gameId, normalizedSearch) > 0.85) {
            return game;
        }
    }
    
    return null;
}

function normalizeGameName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .trim();
}

function calculateSimilarity(str1, str2) {
    // Simple similarity calculation
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

async function linkGameToUser(userId, gameId, platform, weight) {
    const params = {
        TableName: 'what2play',
        Item: {
            PK: `USER#${userId}`,
            SK: `GAME#${gameId}`,
            platform,
            weight,
            added_date: new Date().toISOString()
        }
    };
    
    await dynamoClient.send(new PutCommand(params));
}

async function createGame(gameDetails) {
    const game_id = normalizeGameName(gameDetails.name);
    
    const params = {
        TableName: 'what2play',
        Item: {
            PK: `GAME#${game_id}`,
            SK: 'METADATA',
            game_id: game_id,
            name: gameDetails.name,
            description: gameDetails.description,
            steam_appid: gameDetails.steam_appid,
            platforms: gameDetails.platforms || ['PC'],
            genres: gameDetails.genres || [],
            developer: gameDetails.developer,
            publisher: gameDetails.publisher,
            created_date: new Date().toISOString()
        }
    };
    
    await dynamoClient.send(new PutCommand(params));
    return game_id;
}

async function invokeGameLookup(gameName, additionalDetails) {
    const params = {
        FunctionName: 'what2play-game-lookup',
        Payload: JSON.stringify({ game_name: gameName, additional_details: additionalDetails })
    };
    
    const result = await lambdaClient.send(new InvokeCommand(params));
    return JSON.parse(new TextDecoder().decode(result.Payload));
}