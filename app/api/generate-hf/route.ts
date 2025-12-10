import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_API_REGION || "us-east-1",
});

const styleMap: Record<string, string> = {
  ghibli: "in Studio Ghibli anime style, hand-drawn animation, soft colors",
  cartoon: "in cartoon style, comic book art, bold outlines, vibrant colors",
  pixel: "in pixel art style, 8-bit, retro gaming aesthetic",
  realistic: "photorealistic, highly detailed, professional photography",
  oil: "oil painting style, textured brushstrokes, classical art",
  watercolor: "watercolor painting style, soft washes, artistic",
  digital: "digital art style, modern illustration, clean lines",
  cyberpunk: "cyberpunk style, neon lights, futuristic, sci-fi aesthetic",
  fantasy: "fantasy art style, magical, ethereal, epic",
  minimalist: "minimalist style, simple shapes, clean composition",
  "3d": "3D rendered, high quality CGI, detailed lighting",
};

export async function POST(request: Request) {
  try {
    const { prompt, style = "none", dimensions = "1024x1024", s3Key = null } = (await request.json()) as { 
      prompt?: string; 
      style?: string;
      dimensions?: string;
      s3Key?: string | null;
    };

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
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

    // Enhance prompt with style
    let enhancedPrompt = prompt;
    if (style !== "none" && styleMap[style]) {
      enhancedPrompt = `${prompt}, ${styleMap[style]}`;
    }

    // Parse dimensions
    const [width, height] = dimensions.split("x");

    // Using Pollinations.ai - completely free, no API key needed
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;

    const response = await fetch(pollinationsUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pollinations API error:", errorText);
      return NextResponse.json(
        {
          error: `Image generation failed: ${response.status} ${errorText}`,
        },
        { status: response.status }
      );
    }

    const imageBlob = await response.blob();
    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

    // Use existing S3 key if regenerating, otherwise generate new one
    const finalS3Key = s3Key || `generated-images/${Date.now()}.png`;

    // Upload to S3 with prompt as metadata (overwrites if key exists)
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: finalS3Key,
      Body: imageBuffer,
      ContentType: "image/png",
      Metadata: {
        prompt: prompt,
      },
    });

    await s3Client.send(uploadCommand);

    // Construct S3 URL
    const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_API_REGION || "us-east-1";
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${finalS3Key}`;

    return NextResponse.json({ 
      imageUrl,
      s3Key: finalS3Key,
      prompt 
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
