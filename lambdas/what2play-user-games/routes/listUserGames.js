const { getUserGames, getGameDetails } = require('../data');

exports.listUserGames = async (dynamoClient, userId) => {
    const userGames = await getUserGames(dynamoClient, userId);
    
    const gamesWithDetails = await Promise.all(
        userGames.map(async (userGame) => {
            const gameId = userGame.SK.replace('GAME#', '');
            const gameDetails = await getGameDetails(dynamoClient, gameId);
            
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