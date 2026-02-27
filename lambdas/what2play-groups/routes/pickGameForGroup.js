const { getGroupById, getUserGames, updateGroupPickHistory } = require('../data');
const { pickGameForGroup: pickAlgorithm } = require('../lib/pickAlgorithm');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

class HttpError extends Error {
    constructor(statusCode, message, data = {}) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}

exports.pickGameForGroup = async (dynamoClient, user_id, group_id) => {
    const group = await getGroupById(dynamoClient, user_id, group_id);
    
    if (!group) {
        throw new HttpError(404, 'Group not found');
    }
    
    // Get games for all members including owner
    const allUserIds = [group.owner_id, ...group.members.map(m => m.user_id)];
    const gamesByUser = await getUserGames(dynamoClient, allUserIds);
    
    // Run pick algorithm
    const pickedGameId = pickAlgorithm(gamesByUser, group.pick_history);
    
    if (!pickedGameId) {
        throw new HttpError(404, 'No common games found among all members');
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
    const gameName = gameResult.Item?.name || 'Unknown Game';
    
    // Update pick history
    await updateGroupPickHistory(dynamoClient, user_id, group_id, {
        game_id: pickedGameId,
        game_name: gameName
    }, group.group_name);
    
    return {
        game_id: pickedGameId,
        game_name: gameName
    };
};