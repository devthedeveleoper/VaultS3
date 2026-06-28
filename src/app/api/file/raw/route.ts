import { s3Client, bucketName } from "@/lib/s3Client";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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

    const strContent = await response.Body.transformToString();

    return new NextResponse(strContent, {
      headers: {
        "Content-Type": response.ContentType || "text/plain",
      },
    });
  } catch (error: any) {
    console.error("GET raw file error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch file" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, content, contentType } = await request.json();

    if (!key || content === undefined) {
      return NextResponse.json({ error: "Missing key or content" }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: content,
      ContentType: contentType || "text/plain",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST raw file error:", error);
    return NextResponse.json({ error: error.message || "Failed to save file" }, { status: 500 });
  }
}
