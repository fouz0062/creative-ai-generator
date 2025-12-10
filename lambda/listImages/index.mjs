import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
    // Get user ID from Cognito authorizer
    const userId = event.requestContext?.authorizer?.claims?.sub || 'anonymous';
    
    // List objects from S3 for this user
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: `generated-images/${userId}/`,
      MaxKeys: 100
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ images: [] })
      };
    }

    // Get metadata for each image
    const images = await Promise.all(
      listResponse.Contents.map(async (object) => {
        try {
          const headCommand = new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: object.Key
          });

          const headResponse = await s3Client.send(headCommand);
          
          return {
            url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`,
            s3Key: object.Key,
            prompt: headResponse.Metadata?.prompt || 'No prompt',
            style: headResponse.Metadata?.style || 'realistic',
            dimensions: headResponse.Metadata?.dimensions || '1024x1024',
            createdAt: object.LastModified?.toISOString() || new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error fetching metadata for ${object.Key}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed metadata fetches and sort by creation date
    const validImages = images
      .filter(img => img !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ images: validImages })
    };

  } catch (error) {
    console.error('Error listing images:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to list images',
        message: error.message
      })
    };
  }
};

