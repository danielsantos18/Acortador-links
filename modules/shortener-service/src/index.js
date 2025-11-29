const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { nanoid } = require('nanoid');

const TABLE_NAME = process.env.TABLE_NAME || 'UrlShortenerTable';
const DOMAIN_NAME = process.env.DOMAIN_NAME || 'https://example.com'; // This will be replaced by API Gateway URL or Custom Domain

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const originalUrl = body.url;

    if (!originalUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    const shortCode = nanoid(6);
    const createdAt = new Date().toISOString();

    const item = {
      shortCode: shortCode,
      originalUrl: originalUrl,
      createdAt: createdAt,
      visits: 0,
      dailyVisits: {}
    };

    await dynamoDb.put({
      TableName: TABLE_NAME,
      Item: item,
    }).promise();

    const shortUrl = `${DOMAIN_NAME}/${shortCode}`;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify({ shortUrl, shortCode, originalUrl }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
