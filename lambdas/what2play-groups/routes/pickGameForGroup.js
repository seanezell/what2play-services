const { getGroupById, getUserGames, updateGroupPickHistory } = require('../data');
const { pickGameForGroup: pickAlgorithm } = require('../lib/pickAlgorithm');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

exports.pickGameForGroup = async (dynamoClient, user_id, group_id) => {
    const group = await getGroupById(dynamoClient, user_id, group_id);
    
    if (!group) {
        return {
            statusCode: 404,
            error: 'Group not found'
        };
    }
    
    // Get games for all members including owner
    const allUserIds = [group.owner_id, ...group.members.map(m => m.user_id)];
    const gamesByUser = await getUserGames(dynamoClient, allUserIds);
    
    // Run pick algorithm
    const pickedGameId = pickAlgorithm(gamesByUser, group.pick_history);
    
    if (!pickedGameId) {
        return {
            statusCode: 404,
            error: 'No common games found among all members'
        };
    }
    
    // Get game metadata
    const gameParams = {
        TableName: 'what2play',
        Key: {
            PK: `GAME#${pickedGameId}`,
            SK: 'METADATA'
        }
    };
    
    const gameResult = await dynamoClient.send(new GetCommand(gameParams));
    const gameName = gameResult.Item?.game_name || 'Unknown Game';
    
    // Update pick history
    await updateGroupPickHistory(dynamoClient, user_id, group_id, {
        game_id: pickedGameId,
        game_name: gameName
    });
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            game_id: pickedGameId,
            game_name: gameName
        })
    };
};