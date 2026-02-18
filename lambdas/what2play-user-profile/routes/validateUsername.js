const { isValidUsername, containsProfanity } = require('../lib/usernameValidation');
const { usernameExists } = require('../data/checkUsernameExists');

exports.validateUsername = async (dynamoClient, username) => {
    if (!username || !isValidUsername(username)) {
        return { available: false, error: 'Invalid username format' };
    }

    if (await containsProfanity(username)) {
        return { available: false, error: 'Username contains inappropriate content' };
    }

    if (await usernameExists(dynamoClient, username)) {
        const suggestions = await generateUsernameSuggestions(dynamoClient, username);
        return { available: false, suggestions };
    }

    return { available: true };
};

const generateUsernameSuggestions = async (dynamoClient, baseUsername) => {
    const suggestions = [];
    const base = baseUsername.toLowerCase();

    // Try numeric suffixes first
    for (let i = 1; i <= 5; i++) {
        const suggestion = `${base}${i}`;
        if (!(await usernameExists(dynamoClient, suggestion))) {
        suggestions.push(suggestion);
        }
    }

    // Try common gamer suffixes
    const suffixes = ['_gamer', '_player', '_pro', '_x', '_99'];
    for (const suffix of suffixes) {
        if (suggestions.length >= 5) break;
        const suggestion = `${base}${suffix}`;
        if (suggestion.length <= 20 && !(await usernameExists(dynamoClient, suggestion))) {
        suggestions.push(suggestion);
        }
    }

    return suggestions.slice(0, 5);
};