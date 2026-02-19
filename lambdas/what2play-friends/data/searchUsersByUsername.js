const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

exports.searchUsersByUsername = async (dynamoClient, query) => {
    const params = {
        TableName: 'what2play',
        FilterExpression: 'begins_with(PK, :prefix) AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':prefix': 'USERNAME#',
            ':sk': 'USER#'
        },
        Limit: 50  // Get more results to filter client-side
    };
    
    const result = await dynamoClient.send(new ScanCommand(params));
    const allUsernames = result.Items || [];
    
    // Filter for usernames that contain the query (case-insensitive)
    const queryLower = query.toLowerCase();
    return allUsernames.filter(item => {
        const username = item.PK?.replace('USERNAME#', '').toLowerCase();
        return username.includes(queryLower);
    }).slice(0, 10);
};
