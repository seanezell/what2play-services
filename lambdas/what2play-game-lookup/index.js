const https = require('https');

exports.handler = async (event) => {
    const { game_name, additional_details } = event;
    
    try {
        console.log(`Searching for game: ${game_name}`);
        
        // Step 1: Search Steam API
        const steamResults = await searchSteam(game_name);
        console.log(`Found ${steamResults.length} Steam results`);
        
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
        console.log(`After filtering: ${baseGames.length} base games`);
        
        if (baseGames.length === 1) {
            // Single base game match - high confidence
            console.log(`Single base game found: ${baseGames[0].name}`);
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
            console.log(`High confidence match: ${exactMatch.game.name}`);
            const gameDetails = await getSteamDetails(exactMatch.game.id);
            return {
                confidence: exactMatch.confidence,
                source: 'steam',
                ...gameDetails
            };
        }
        
        // Multiple matches - return filtered suggestions
        console.log(`Multiple matches found, returning filtered suggestions`);
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

function filterBaseGames(games, searchTerm) {
    const dlcKeywords = [
        'dlc', 'expansion', 'season pass', 'upgrade', 'deluxe edition',
        'cosmetic', 'skin', 'pack', 'bundle', 'soundtrack', 'ost',
        'digital deluxe', 'gold edition', 'premium', 'collector',
        'bonus', 'content pack', 'add-on', 'addon'
    ];
    
    return games.filter(game => {
        const gameName = game.name.toLowerCase();
        
        // Filter out obvious DLC/cosmetics
        const isDLC = dlcKeywords.some(keyword => gameName.includes(keyword));
        if (isDLC) return false;
        
        // Filter out games that contain hyphens followed by descriptors (likely DLC)
        if (gameName.includes(' - ') && !searchTerm.toLowerCase().includes(' - ')) {
            return false;
        }
        
        return true;
    });
}

function findBestMatch(games, searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    
    for (const game of games) {
        const gameLower = game.name.toLowerCase().trim();
        
        // Exact match
        if (gameLower === searchLower) {
            return { game, confidence: 0.95 };
        }
        
        // Very close match (allowing for minor differences)
        if (calculateSimilarity(gameLower, searchLower) > 0.85) {
            return { game, confidence: 0.9 };
        }
    }
    
    return null;
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

async function searchSteam(gameName) {
    return new Promise((resolve, reject) => {
        const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&l=english&cc=US`;
        
        console.log(`Calling Steam API: ${url}`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response.items || []);
                } catch (parseError) {
                    console.error('Error parsing Steam search response:', parseError);
                    resolve([]);
                }
            });
        }).on('error', (error) => {
            console.error('Steam API search error:', error);
            reject(error);
        });
    });
}

async function getSteamDetails(appid) {
    return new Promise((resolve, reject) => {
        const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
        
        console.log(`Getting Steam details for appid: ${appid}`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    const gameInfo = response[appid];
                    
                    if (!gameInfo || !gameInfo.success) {
                        resolve({
                            name: 'Unknown Game',
                            description: 'Details not available',
                            steam_appid: appid
                        });
                        return;
                    }
                    
                    const gameData = gameInfo.data;
                    resolve({
                        name: gameData.name,
                        description: gameData.short_description || gameData.detailed_description?.substring(0, 200) || 'No description available',
                        steam_appid: appid,
                        platforms: Object.keys(gameData.platforms || {}).filter(p => gameData.platforms[p]),
                        genres: gameData.genres?.map(g => g.description) || [],
                        release_date: gameData.release_date?.date || 'Unknown',
                        developer: gameData.developers?.[0] || 'Unknown',
                        publisher: gameData.publishers?.[0] || 'Unknown'
                    });
                } catch (parseError) {
                    console.error('Error parsing Steam details response:', parseError);
                    resolve({
                        name: 'Parse Error',
                        description: 'Could not parse game details',
                        steam_appid: appid
                    });
                }
            });
        }).on('error', (error) => {
            console.error('Steam API details error:', error);
            reject(error);
        });
    });
}