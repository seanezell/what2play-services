const https = require('node:https');

exports.searchSteam = async (gameName) => {
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
};

exports.getSteamDetails = async (appid) => {
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
                    
                    if (!gameInfo?.success) {
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
};