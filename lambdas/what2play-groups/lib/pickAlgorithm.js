exports.pickGameForGroup = (gamesByUser, pickHistory = []) => {
    const userIds = Object.keys(gamesByUser);
    
    if (userIds.length === 0) {
        return null;
    }
    
    // Find games common to all users
    const firstUserGames = new Set(gamesByUser[userIds[0]]);
    const commonGames = [...firstUserGames].filter(gameId =>
        userIds.every(userId => gamesByUser[userId].includes(gameId))
    );
    
    if (commonGames.length === 0) {
        return null;
    }
    
    // Filter out recently picked games
    const recentlyPicked = new Set(
        pickHistory.slice(-5).map(pick => pick.game_id)
    );
    
    const availableGames = commonGames.filter(gameId => !recentlyPicked.has(gameId));
    
    // If all common games were recently picked, use all common games
    const gamesToPickFrom = availableGames.length > 0 ? availableGames : commonGames;
    
    // Random selection
    const randomIndex = Math.floor(Math.random() * gamesToPickFrom.length);
    return gamesToPickFrom[randomIndex];
};
