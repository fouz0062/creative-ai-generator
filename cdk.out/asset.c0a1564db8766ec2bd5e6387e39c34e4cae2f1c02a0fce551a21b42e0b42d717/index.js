// lambda/generateImage/index.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

// Initialize AWS SDK clients
const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

// Environment variables (passed from CDK stack)
const IMAGE_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const IMAGES_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

exports.handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    // 1. Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Request body is missing." }),
      };
    }

    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Prompt is required." }),
      };
    }

    console.log(`Received prompt: "${prompt}"`);

    // 2. Generate a placeholder image (mock for testing - replace with real Bedrock call when model is available)
    console.log("Generating placeholder image for prompt:", prompt);

    // Create a simple colored square as placeholder (1x1 pixel PNG, scaled up)
    // This is a valid PNG image in base64
    const imageBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const imageId = uuidv4();
    const s3Key = `images/${imageId}.png`; // Store as PNG

    // 3. Upload image to S3
    if (!IMAGE_BUCKET_NAME) {
      throw new Error("IMAGE_BUCKET_NAME environment variable not set.");
    }
    await s3Client.send(
      new PutObjectCommand({
        Bucket: IMAGE_BUCKET_NAME,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: "image/png",
      })
    );

    const imageUrl = `https://${IMAGE_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    console.log(`Image uploaded to S3: ${imageUrl}`);

    // 4. Store image metadata in DynamoDB
    if (!IMAGES_TABLE_NAME) {
      throw new Error("IMAGES_TABLE_NAME environment variable not set.");
    }
    await ddbClient.send(
      new PutItemCommand({
        TableName: IMAGES_TABLE_NAME,
        Item: {
          id: { S: imageId },
          prompt: { S: prompt },
          imageUrl: { S: imageUrl },
          createdAt: { S: new Date().toISOString() },
          // userId: { S: event.requestContext.authorizer?.jwt.claims.sub || "anonymous" }, // Uncomment when implementing Cognito Authorizer
        },
      })
    );
    console.log(`Metadata stored in DynamoDB for image ID: ${imageId}`);

    // 5. Return success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
      body: JSON.stringify({
        message: "Image generated and saved successfully!",
        imageId: imageId,
        imageUrl: imageUrl,
      }),
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
      body: JSON.stringify({
        message: "Failed to generate image.",
        error: error.message,
      }),
    };
  }
};
