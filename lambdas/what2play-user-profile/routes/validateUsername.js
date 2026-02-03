const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

const { isValidUsername, containsProfanity } = require('../lib/usernameValidation');

exports.validateUsername = async (dynamoClient, username) => {
    if (!username || !isValidUsername(username)) {
        return {
            available: false,
            error: 'Invalid username format'
        };
    }
    
    if (await containsProfanity(username)) {
        return {
            available: false,
            error: 'Username contains inappropriate content'
        };
    }
    
    // Check if username exists
    const params = {
        TableName: 'what2play',
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
            ':pk': `USERNAME#${username.toLowerCase()}`
        }
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    
    if (result.Items && result.Items.length > 0) {
        // Username taken, generate suggestions
        const suggestions = await generateUsernameSuggestions(username);
        return {
            available: false,
            suggestions: suggestions
        };
    }
    
    return {
        available: true
    };
};

const generateUsernameSuggestions = async (baseUsername) => {
    const suggestions = [];
    const base = baseUsername.toLowerCase();
    
    // Try with numbers
    for (let i = 1; i <= 5; i++) {
        const suggestion = `${base}${i}`;
        const check = await validateUsername(dynamoClient, suggestion);
        if (check.available) {
            suggestions.push(suggestion);
        }
    }
    
    // Try with random suffixes
    const suffixes = ['_gamer', '_player', '_pro', '_x', '_99'];
    for (const suffix of suffixes) {
        if (suggestions.length >= 5) break;
        const suggestion = `${base}${suffix}`;
        if (suggestion.length <= 20) {
            const check = await validateUsername(dynamoClient, suggestion);
            if (check.available) {
                suggestions.push(suggestion);
            }
        }
    }
    
    return suggestions.slice(0, 5);
};