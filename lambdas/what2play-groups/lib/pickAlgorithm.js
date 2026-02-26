exports.pickGameForGroup = (gamesByUser, pickHistory = []) => {
    const userIds = Object.keys(gamesByUser);
    
    if (userIds.length === 0) {
        return null;
    }
    
    // Find games common to all users
    const firstUserGameIds = new Set(gamesByUser[userIds[0]].map(g => g.game_id));
    const commonGameIds = [...firstUserGameIds].filter(gameId =>
        userIds.every(userId => gamesByUser[userId].some(g => g.game_id === gameId))
    );
    
    if (commonGameIds.length === 0) {
        return null;
    }
    
    // Filter out recently picked games
    const recentlyPicked = new Set(
        pickHistory.slice(-5).map(pick => pick.game_id)
    );
    
    const availableGameIds = commonGameIds.filter(gameId => !recentlyPicked.has(gameId));
    const gameIdsToPickFrom = availableGameIds.length > 0 ? availableGameIds : commonGameIds;
    
    // Calculate weighted selection
    const weightedGames = gameIdsToPickFrom.map(gameId => {
        const totalWeight = userIds.reduce((sum, userId) => {
            const game = gamesByUser[userId].find(g => g.game_id === gameId);
            return sum + (game?.weight || 5);
        }, 0);
        return { game_id: gameId, totalWeight };
    });
    
    const totalWeightSum = weightedGames.reduce((sum, g) => sum + g.totalWeight, 0);
    let random = Math.random() * totalWeightSum;
    
    for (const game of weightedGames) {
        random -= game.totalWeight;
        if (random <= 0) {
            return game.game_id;
        }
    }
    
    return weightedGames[0].game_id;
};
