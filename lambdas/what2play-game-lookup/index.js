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
        
        if (steamResults.length === 1) {
            // Single match - high confidence
            console.log(`Single match found: ${steamResults[0].name}`);
            const gameDetails = await getSteamDetails(steamResults[0].id);
            return {
                confidence: 0.9,
                source: 'steam',
                ...gameDetails
            };
        }
        
        // Multiple matches - return suggestions for now
        console.log(`Multiple matches found, returning suggestions`);
        return {
            confidence: 0.3,
            source: 'steam',
            message: 'Multiple games found',
            suggestions: steamResults.slice(0, 5).map(game => ({
                name: game.name,
                steam_appid: game.id,
                price: game.price
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