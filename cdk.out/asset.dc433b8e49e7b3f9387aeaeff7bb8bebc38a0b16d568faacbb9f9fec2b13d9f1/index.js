// lambda/generateImage/index.js

import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Initialize AWS services
// const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB.DocumentClient();

// Environment variables set by the CDK stack
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Helper to simulate a 3-second delay for image generation
const simulateImageGeneration = async (prompt) => {
  console.log(`Simulating generation for prompt: "${prompt}"`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // In a real scenario, this would call an AI service (e.g., Bedrock/Rekognition)

  // Mock S3 key and URL (will be updated in a later phase)
  const imageId = uuidv4();
  const s3Key = `images/${imageId}.png`;
  const mockS3Url = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

  // NOTE: In the real world, you'd write the image binary data to S3 here.
  // For this mock, we just return the metadata.

  return { imageId, s3Key, s3Url: mockS3Url };
};

exports.handler = async (event) => {
  try {
    const { prompt, userEmail } = JSON.parse(event.body);

    if (!prompt || !userEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing prompt or userEmail" }),
        headers: {
          "Content-Type": "application/json",
          // Allow CORS for the frontend
          "Access-Control-Allow-Origin": "*",
        },
      };
    }

    // 1. Simulate Image Generation
    const { imageId, s3Url } = await simulateImageGeneration(prompt);

    // 2. Save Metadata to DynamoDB
    const timestamp = new Date().toISOString();
    const ddbParams = {
      TableName: DYNAMODB_TABLE_NAME,
      Item: {
        id: imageId,
        userEmail: userEmail,
        prompt: prompt,
        s3_url: s3Url,
        timestamp: timestamp,
      },
    };

    await ddb.put(ddbParams).promise();
    console.log(`Saved metadata for image ${imageId}`);

    // 3. Return response to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: imageId,
        prompt: prompt,
        s3_url: s3Url,
        timestamp: timestamp,
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Crucial for CORS
      },
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to generate image",
        error: error.message,
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
};
