const { PutCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

exports.addFriendship = async (dynamoClient, userId, friendUserId) => {
    const now = new Date().toISOString();
    
    // Get friend's profile to store their username
    const profileParams = {
        RequestItems: {
            'what2play': {
                Keys: [
                    { PK: `USER#${friendUserId}`, SK: 'PROFILE' }
                ]
            }
        }
    };
    
    const profileResult = await dynamoClient.send(new BatchGetCommand(profileParams));
    const friendProfile = profileResult.Responses?.what2play?.[0];
    
    if (!friendProfile) {
        throw new Error('Friend user not found');
    }
    
    // Create friendship record
    const params = {
        TableName: 'what2play',
        Item: {
            PK: `USER#${userId}`,
            SK: `FRIEND#${friendUserId}`,
            friend_user_id: friendUserId,
            friend_username: friendProfile.username,
            added_date: now
        }
    };
    
    await dynamoClient.send(new PutCommand(params));
    return params.Item;
};
