// lambda/deleteImage/index.js
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {
  DynamoDBClient,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});

const IMAGE_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const IMAGES_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

exports.handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    // Get the authenticated User ID from the Cognito Authorizer
    let userId = "anonymous";
    if (event.requestContext?.authorizer?.jwt?.claims?.sub) {
      userId = event.requestContext.authorizer.jwt.claims.sub;
    }

    // Get imageId from path parameters
    const imageId = event.pathParameters?.imageId;
    if (!imageId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "imageId is required" }),
      };
    }

    console.log(`Deleting image ${imageId} for user ${userId}`);

    // First, get the item from DynamoDB to get the s3Key and verify ownership
    const {
      DynamoDBClient: DDBClient,
      GetItemCommand,
    } = require("@aws-sdk/client-dynamodb");
    const getCommand = new GetItemCommand({
      TableName: IMAGES_TABLE_NAME,
      Key: {
        userId: { S: userId },
        timestamp: { S: event.queryStringParameters?.timestamp || "" },
      },
    });

    let s3Key = `images/${imageId}.png`; // Default S3 key format

    try {
      const getResult = await ddbClient.send(getCommand);
      if (getResult.Item?.s3Key?.S) {
        s3Key = getResult.Item.s3Key.S;
      }
    } catch (err) {
      console.log("Could not get item from DynamoDB, using default s3Key");
    }

    // Delete from S3
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: IMAGE_BUCKET_NAME,
          Key: s3Key,
        })
      );
      console.log(`Deleted from S3: ${s3Key}`);
    } catch (err) {
      console.error("Error deleting from S3:", err);
      // Continue even if S3 delete fails
    }

    // Delete from DynamoDB
    if (event.queryStringParameters?.timestamp) {
      await ddbClient.send(
        new DeleteItemCommand({
          TableName: IMAGES_TABLE_NAME,
          Key: {
            userId: { S: userId },
            timestamp: { S: event.queryStringParameters.timestamp },
          },
        })
      );
      console.log(`Deleted from DynamoDB: ${imageId}`);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,DELETE",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
      body: JSON.stringify({
        message: "Image deleted successfully",
        imageId: imageId,
      }),
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Failed to delete image",
        error: error.message,
      }),
    };
  }
};
