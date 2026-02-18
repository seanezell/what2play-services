const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

exports.scanAllGames = async (dynamoClient) => {
    const params = {
        TableName: 'what2play',
        FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
        ExpressionAttributeValues: {
            ':prefix': 'GAME#',
            ':sk': 'METADATA'
        }
    };
    
    const result = await dynamoClient.send(new ScanCommand(params));
    return result.Items || [];
};
