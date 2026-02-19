const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());
const lambdaClient = new LambdaClient();

const { createGame, linkGameToUser, queryGameByName, scanAllGames } = require('./data');
const { normalizeGameName, calculateSimilarity } = require('./lib/gameMatching');

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
            await linkGameToUser(dynamoClient, user_id, existingGame.game_id, platform, weight);
            return {
                message: 'Game added to your collection',
                game: existingGame 
            };
        }
        
        // Step 1b: Game doesn't exist, invoke AI lookup
        const gameDetails = await invokeGameLookup(game_name, additional_details);
        
        if (gameDetails.confidence > 0.8) {
            // High confidence - auto-add
            const game_id = await createGame(dynamoClient, gameDetails);
            await linkGameToUser(dynamoClient, user_id, game_id, platform, weight);
            
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

const findExistingGame = async (gameName) => {
    const normalizedName = normalizeGameName(gameName);
    
    // Try exact match first
    const exactMatch = await queryGameByName(dynamoClient, normalizedName);
    if (exactMatch) {
        return exactMatch;
    }
    
    // If no exact match, scan for similar names
    const allGames = await scanAllGames(dynamoClient);
    
    for (const game of allGames) {
        const gameId = game.PK.replace('GAME#', '');
        if (calculateSimilarity(gameId, normalizedName) > 0.85) {
            return game;
        }
    }
    
    return null;
};

const invokeGameLookup = async (gameName, additionalDetails) => {
    const params = {
        FunctionName: 'what2play-game-lookup',
        Payload: JSON.stringify({ game_name: gameName, additional_details: additionalDetails })
    };
    
    const result = await lambdaClient.send(new InvokeCommand(params));
    return JSON.parse(new TextDecoder().decode(result.Payload));
};