const { filterBaseGames, findBestMatch } = require('./lib/gameMatching');
const { searchSteam, getSteamDetails } = require('./sources/steam');

exports.handler = async (event) => {
    const { game_name } = event;
    
    try {
        
        // Step 1: Search Steam API
        const steamResults = await searchSteam(game_name);
        
        if (steamResults.length === 0) {
            return {
                confidence: 0.1,
                source: 'steam',
                message: 'No games found on Steam',
                suggestions: []
            };
        }
        
        // Filter out DLC, cosmetics, and upgrades
        const baseGames = filterBaseGames(steamResults, game_name);
        
        if (baseGames.length === 1) {
            // Single base game match - high confidence
            const gameDetails = await getSteamDetails(baseGames[0].id);
            return {
                confidence: 0.9,
                source: 'steam',
                ...gameDetails
            };
        }
        
        // Check for exact or very close matches
        const exactMatch = findBestMatch(baseGames, game_name);
        if (exactMatch && exactMatch.confidence > 0.8) {
            const gameDetails = await getSteamDetails(exactMatch.game.id);
            return {
                confidence: exactMatch.confidence,
                source: 'steam',
                ...gameDetails
            };
        }
        
        // Multiple matches - return filtered suggestions
        return {
            confidence: 0.3,
            source: 'steam',
            message: 'Multiple games found',
            suggestions: baseGames.slice(0, 3).map(game => ({
                name: game.name,
                steam_appid: game.id
            }))
        };
        
    } catch (error) {
        console.error('Error in game lookup:', error);
        return {
            confidence: 0,
            error: error.message
        };
    }
};