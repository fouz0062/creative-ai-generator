import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
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
    // Get s3Key from query parameters
    const s3Key = event.queryStringParameters?.s3Key;
    
    if (!s3Key) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 's3Key is required' })
      };
    }

    // Get user ID from Cognito authorizer
    const userId = event.requestContext?.authorizer?.claims?.sub || 'anonymous';
    
    // Verify the s3Key belongs to the user (security check)
    if (!s3Key.startsWith(`generated-images/${userId}/`)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Unauthorized to delete this image' })
      };
    }

    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    });

    await s3Client.send(deleteCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Image deleted successfully'
      })
    };

  } catch (error) {
    console.error('Error deleting image:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to delete image',
        message: error.message
      })
    };
  }
};

