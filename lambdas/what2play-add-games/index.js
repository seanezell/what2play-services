const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());
const lambdaClient = new LambdaClient();

exports.handler = async (event) => {
    try {
        const { game_name, platform, weight = 5, additional_details } = JSON.parse(event.body);
        const user_id = event.requestContext.authorizer.claims.sub; // Cognito user ID
        
        // Step 1: Check if game exists
        const existingGame = await findExistingGame(game_name);
        
        if (existingGame) {
            // Step 1a: Game exists, just link to user
            await linkGameToUser(user_id, existingGame.game_id, platform, weight);
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Game added to your collection',
                    game: existingGame 
                })
            };
        }
        
        // Step 1b: Game doesn't exist, invoke AI lookup
        const gameDetails = await invokeGameLookup(game_name, additional_details);
        
        if (gameDetails.confidence > 0.8) {
            // High confidence - auto-add
            const game_id = await createGame(gameDetails);
            await linkGameToUser(user_id, game_id, platform, weight);
            
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'New game added to collection',
                    game: gameDetails 
                })
            };
        } else {
            // Low confidence - ask for clarification
            return {
                statusCode: 202,
                body: JSON.stringify({
                    message: 'Need more details',
                    suggestions: gameDetails.suggestions,
                    requires_confirmation: true
                })
            };
        }
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function findExistingGame(gameName) {
    const params = {
        TableName: 'what2play',
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': `GAME#${gameName.toLowerCase()}`
        }
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items?.[0];
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
    const game_id = gameDetails.name.toLowerCase().replace(/\s+/g, '-');
    
    const params = {
        TableName: 'what2play',
        Item: {
            PK: `GAME#${game_id}`,
            SK: 'METADATA',
            name: gameDetails.name,
            description: gameDetails.description,
            min_players: gameDetails.min_players,
            max_players: gameDetails.max_players,
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