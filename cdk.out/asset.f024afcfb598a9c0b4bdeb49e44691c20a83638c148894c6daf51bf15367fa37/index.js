// lambda/generateImage/index.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
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

    // NEW: 2. Get the authenticated User ID from the Cognito Authorizer context
    // This path is for HTTP API Gateway with a Cognito Authorizer
    let userId = "anonymous";
    if (event.requestContext?.authorizer?.jwt?.claims?.sub) {
      userId = event.requestContext.authorizer.jwt.claims.sub;
    }
    console.log(`Processing request for User ID: ${userId}`);

    // 3. Invoke Bedrock model (Amazon Titan Image Generator)
    const bedrockRequestBody = {
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt,
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        quality: "standard",
        cfgScale: 8.0,
        height: 512,
        width: 512,
        seed: 0,
      },
    };

    console.log("Invoking Bedrock with prompt:", prompt);

    const invokeModelResponse = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: "amazon.titan-image-generator-v1",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(bedrockRequestBody),
      })
    );

    const bedrockResponseBody = JSON.parse(
      Buffer.from(invokeModelResponse.body).toString("utf8")
    );
    console.log("Bedrock response received");

    if (
      !bedrockResponseBody.images ||
      bedrockResponseBody.images.length === 0
    ) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Failed to generate image from Bedrock.",
        }),
      };
    }

    const imageBase64 = bedrockResponseBody.images[0];
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

    // Generate a signed URL that expires in 1 hour
    const getObjectCommand = new GetObjectCommand({
      Bucket: IMAGE_BUCKET_NAME,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    console.log(`Image uploaded to S3, signed URL generated`);

    // 4. Store metadata in DynamoDB
    if (!IMAGES_TABLE_NAME) {
      throw new Error("IMAGES_TABLE_NAME environment variable not set.");
    }
    const timestamp = new Date().toISOString();
    await ddbClient.send(
      new PutItemCommand({
        TableName: IMAGES_TABLE_NAME,
        Item: {
          userId: { S: userId }, // <--- UPDATED to use authenticated ID
          timestamp: { S: timestamp }, // Sort key
          imageId: { S: imageId },
          prompt: { S: prompt },
          imageUrl: { S: signedUrl }, // Store signed URL
          s3Key: { S: s3Key }, // Store S3 key for future reference
        },
      })
    );
    console.log(
      `Metadata stored in DynamoDB for image ID: ${imageId} by user: ${userId}`
    );

    // 5. Return success response with signed URL
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
        imageUrl: signedUrl, // Return signed URL that browser can access
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
