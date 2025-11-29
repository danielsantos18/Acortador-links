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

        const originalUrl = result.Item.originalUrl;

        // Update stats asynchronously (fire and forget or wait, here we wait for simplicity)
        const today = new Date().toISOString().split('T')[0];

        await dynamoDb.update({
            TableName: TABLE_NAME,
            Key: { shortCode: code },
            UpdateExpression: "SET visits = visits + :inc, dailyVisits.#date = if_not_exists(dailyVisits.#date, :zero) + :inc",
            ExpressionAttributeNames: {
                "#date": today
            },
            ExpressionAttributeValues: {
                ":inc": 1,
                ":zero": 0
            }
        }).promise();

        // Return 302 Redirect
        return {
            statusCode: 302,
            headers: {
                Location: originalUrl,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
