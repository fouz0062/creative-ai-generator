// lambda/listImages/index.js
const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

const ddbClient = new DynamoDBClient({});
const IMAGES_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

exports.handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    // Get the authenticated User ID from the Cognito Authorizer
    let userId = "anonymous";
    if (event.requestContext?.authorizer?.jwt?.claims?.sub) {
      userId = event.requestContext.authorizer.jwt.claims.sub;
    }
    console.log(`Fetching images for User ID: ${userId}`);

    // Query DynamoDB for user's images
    const queryCommand = new QueryCommand({
      TableName: IMAGES_TABLE_NAME,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
      ScanIndexForward: false, // Sort by timestamp descending (newest first)
      Limit: 50, // Limit to 50 most recent images
    });

    const result = await ddbClient.send(queryCommand);

    // Transform DynamoDB items to simple objects
    const images =
      result.Items?.map((item) => ({
        imageId: item.imageId?.S || "",
        prompt: item.prompt?.S || "",
        imageUrl: item.imageUrl?.S || "",
        timestamp: item.timestamp?.S || "",
        s3Key: item.s3Key?.S || "",
      })) || [];

    console.log(`Found ${images.length} images for user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
      body: JSON.stringify({
        images: images,
        count: images.length,
      }),
    };
  } catch (error) {
    console.error("Error fetching images:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Failed to fetch images.",
        error: error.message,
      }),
    };
  }
};
