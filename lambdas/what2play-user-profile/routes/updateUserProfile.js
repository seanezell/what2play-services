const { DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const { isValidUsername, containsProfanity } = require('../lib/usernameValidation');
const { loadUserProfile } = require('../data/loadUserProfile');
const { validateUsername } = require('./validateUsername');

exports.updateUserProfile = async (dynamoClient, userId, event) => {
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
    if (await containsProfanity(username)) {
        return {
            statusCode: 400,
            error: 'Username contains inappropriate content'
        };
    }
    
    // Get current profile
    const currentProfile = await loadUserProfile(dynamoClient, userId);
    if (!currentProfile) {
        return {
            statusCode: 404,
            error: 'Profile not found'
        };
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
};

const updateUsernameIndex = async (userId, oldUsername, newUsername) => {
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
};