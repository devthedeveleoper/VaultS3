import { s3Client, bucketName } from "@/lib/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return NextResponse.json({ error: "Empty file" }, { status: 404 });
    }

    // Pass the readable stream directly to NextResponse
    // This allows Next.js Image optimizer to consume it
    return new NextResponse(response.Body as any, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache forever for Next.js optimizer
      },
    });
  } catch (error: any) {
    console.error("GET media error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch file" }, { status: 500 });
  }
}
