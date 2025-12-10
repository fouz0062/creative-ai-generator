import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_API_REGION || "us-east-1",
});

export async function GET() {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3_BUCKET_NAME environment variable is not set" },
        { status: 500 }
      );
    }

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: "generated-images/",
    });

    const response = await s3Client.send(command);
    const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_API_REGION || "us-east-1";

    // Transform S3 objects to image metadata format
    const imagePromises = (response.Contents || [])
      .filter((obj) => obj.Key && obj.Key.endsWith(".png"))
      .map(async (obj) => {
        const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${obj.Key}`;
        const timestamp = obj.LastModified?.toISOString() || new Date().toISOString();
        const imageId = obj.Key?.split("/")[1].replace(".png", "") || "";

        // Fetch metadata to get the prompt
        let prompt = "AI Generated Image";
        try {
          const headCommand = new HeadObjectCommand({
            Bucket: bucketName,
            Key: obj.Key,
          });
          const metadata = await s3Client.send(headCommand);
          prompt = metadata.Metadata?.prompt || "AI Generated Image";
        } catch (error) {
          console.error(`Error fetching metadata for ${obj.Key}:`, error);
        }

        return {
          imageId,
          imageUrl,
          s3Key: obj.Key,
          timestamp,
          prompt,
        };
      });

    const images = await Promise.all(imagePromises);
    const sortedImages = images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ images: sortedImages });
  } catch (error: any) {
    console.error("Error listing S3 images:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to list images" },
      { status: 500 }
    );
  }
}

