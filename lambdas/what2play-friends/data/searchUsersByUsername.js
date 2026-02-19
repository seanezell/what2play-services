const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.searchUsersByUsername = async (dynamoClient, query) => {
    const params = {
        TableName: 'what2play',
        IndexName: 'GSI1',
        KeyConditionExpression: 'begins_with(GSI1PK, :pk)',
        ExpressionAttributeValues: {
            ':pk': `USERNAME#${query.toLowerCase()}`
        },
        Limit: 10
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    return result.Items || [];
};
