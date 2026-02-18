const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { normalizeGameName } = require('../lib/gameMatching');

exports.createGame = async (dynamoClient, gameDetails) => {
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