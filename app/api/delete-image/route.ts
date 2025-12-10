import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_API_REGION || "us-east-1",
});

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get("s3Key");

    if (!s3Key) {
      return NextResponse.json(
        { error: "s3Key parameter is required" },
        { status: 400 }
      );
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3_BUCKET_NAME environment variable is not set" },
        { status: 500 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    await s3Client.send(command);

    return NextResponse.json({ 
      success: true,
      message: "Image deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting S3 image:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}

