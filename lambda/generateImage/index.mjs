import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { prompt, style = 'realistic', dimensions = '1024x1024', s3Key = null } = body;
    
    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // Get user ID from Cognito authorizer
    const userId = event.requestContext?.authorizer?.claims?.sub || 'anonymous';
    
    // Prepare the request for Amazon Titan Image Generator
    const inputData = {
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: `${style} style: ${prompt}`,
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        quality: "premium",
        height: parseInt(dimensions.split('x')[1]),
        width: parseInt(dimensions.split('x')[0]),
        cfgScale: 8.0,
        seed: Math.floor(Math.random() * 2147483647)
      }
    };

    // Invoke Bedrock model
    const command = new InvokeModelCommand({
      modelId: "amazon.titan-image-generator-v1",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(inputData)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Get the base64 image
    const base64Image = responseBody.images[0];
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Generate S3 key (reuse existing key for regeneration)
    const finalS3Key = s3Key || `generated-images/${userId}/${Date.now()}.png`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: finalS3Key,
      Body: imageBuffer,
      ContentType: 'image/png',
      Metadata: {
        prompt: prompt,
        style: style,
        dimensions: dimensions,
        userId: userId,
        generatedAt: new Date().toISOString()
      }
    });

    await s3Client.send(uploadCommand);

    // Generate presigned URL or public URL
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${finalS3Key}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl,
        s3Key: finalS3Key,
        prompt,
        style,
        dimensions
      })
    };

  } catch (error) {
    console.error('Error generating image:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate image',
        message: error.message
      })
    };
  }
};

