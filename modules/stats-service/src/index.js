const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME || 'UrlShortenerTable';

exports.handler = async (event) => {
    try {
        const code = event.pathParameters.code;

        if (!code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Code is required' }),
            };
        }

        const result = await dynamoDb.get({
            TableName: TABLE_NAME,
            Key: { shortCode: code },
        }).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'URL not found' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
