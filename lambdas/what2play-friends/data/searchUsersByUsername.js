const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.searchUsersByUsername = async (dynamoClient, query) => {
    const params = {
        TableName: 'what2play',
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk AND begins_with(GSI2SK, :query)',
        ExpressionAttributeValues: {
            ':pk': 'USERS',
            ':query': query.toLowerCase()
        },
        Limit: 10
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    const allUsernames = result.Items || [];
    
    // Debug logging
    console.log(`[searchUsersByUsername] Query returned ${allUsernames.length} items`);
    console.log(`[searchUsersByUsername] Items returned:`, allUsernames.map(u => u.GSI2SK));
    
    return allUsernames;
};
