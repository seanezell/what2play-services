exports.filterBaseGames = (games, searchTerm) => {
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
};

exports.findBestMatch = (games, searchTerm) => {
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
};

const calculateSimilarity = (str1, str2) => {
    // Simple similarity calculation
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
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
};