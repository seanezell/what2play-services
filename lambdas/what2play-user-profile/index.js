const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const { httpMethod, user_id } = event;
        
        if (!user_id) {
            return {
                statusCode: 401,
                error: 'User not authenticated'
            };
        }
        
        switch (httpMethod) {
            case 'GET':
                return await getUserProfile(user_id);
            case 'PUT':
                return await updateUserProfile(user_id, event);
            case 'POST':
                return await validateUsername(event.username);
            default:
                return {
                    statusCode: 405,
                    error: 'Method not allowed'
                };
        }
        
    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};

async function getUserProfile(userId) {
    const params = {
        TableName: 'what2play',
        Key: {
            PK: `USER#${userId}`,
            SK: 'PROFILE'
        }
    };
    
    const result = await dynamoClient.send(new GetCommand(params));
    
    if (!result.Item) {
        return {
            statusCode: 404,
            error: 'Profile not found'
        };
    }
    
    return {
        profile: result.Item
    };
}

async function updateUserProfile(userId, event) {
    const { username, real_name, preferred_platform } = event;
    
    // Validate required fields
    if (!username) {
        return {
            statusCode: 400,
            error: 'Username is required'
        };
    }
    
    // Validate username format
    if (!isValidUsername(username)) {
        return {
            statusCode: 400,
            error: 'Username must be 3-20 characters, alphanumeric with underscores/dashes only'
        };
    }
    
    // Check profanity
    if (containsProfanity(username)) {
        return {
            statusCode: 400,
            error: 'Username contains inappropriate content'
        };
    }
    
    // Get current profile
    const currentProfile = await getUserProfile(userId);
    if (currentProfile.statusCode) {
        return currentProfile;
    }
    
    const oldUsername = currentProfile.profile.username;
    
    // Check if username changed and if new username is available
    if (username.toLowerCase() !== oldUsername.toLowerCase()) {
        const usernameCheck = await validateUsername(username);
        if (!usernameCheck.available) {
            return {
                statusCode: 409,
                error: 'Username already taken',
                suggestions: usernameCheck.suggestions
            };
        }
        
        // Update username index
        await updateUsernameIndex(userId, oldUsername, username);
    }
    
    // Update profile
    const now = new Date().toISOString();
    const params = {
        TableName: 'what2play',
        Item: {
            ...currentProfile.profile,
            username: username,
            real_name: real_name || currentProfile.profile.real_name,
            preferred_platform: preferred_platform || currentProfile.profile.preferred_platform,
            profile_complete: true,
            updated_date: now
        }
    };
    
    await dynamoClient.send(new PutCommand(params));
    
    return {
        message: 'Profile updated successfully',
        profile: params.Item
    };
}

async function validateUsername(username) {
    if (!username || !isValidUsername(username)) {
        return {
            available: false,
            error: 'Invalid username format'
        };
    }
    
    if (containsProfanity(username)) {
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
}

async function updateUsernameIndex(userId, oldUsername, newUsername) {
    // Delete old username record
    const deleteParams = {
        TableName: 'what2play',
        Key: {
            PK: `USERNAME#${oldUsername.toLowerCase()}`,
            SK: `USER#${userId}`
        }
    };
    
    // Create new username record
    const putParams = {
        TableName: 'what2play',
        Item: {
            PK: `USERNAME#${newUsername.toLowerCase()}`,
            SK: `USER#${userId}`,
            GSI1PK: `USERNAME#${newUsername.toLowerCase()}`,
            GSI1SK: `USER#${userId}`,
            created_date: new Date().toISOString()
        }
    };
    
    await Promise.all([
        dynamoClient.send(new DeleteCommand(deleteParams)),
        dynamoClient.send(new PutCommand(putParams))
    ]);
}

function isValidUsername(username) {
    const regex = /^[a-zA-Z0-9_-]{3,20}$/;
    return regex.test(username);
}

function containsProfanity(username) {
    const profanityList = [
        'admin', 'api', 'root', 'system', 'null', 'undefined',
        // Add more as needed
    ];
    
    const lowerUsername = username.toLowerCase();
    return profanityList.some(word => lowerUsername.includes(word));
}

async function generateUsernameSuggestions(baseUsername) {
    const suggestions = [];
    const base = baseUsername.toLowerCase();
    
    // Try with numbers
    for (let i = 1; i <= 5; i++) {
        const suggestion = `${base}${i}`;
        const check = await validateUsername(suggestion);
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
            const check = await validateUsername(suggestion);
            if (check.available) {
                suggestions.push(suggestion);
            }
        }
    }
    
    return suggestions.slice(0, 5);
}