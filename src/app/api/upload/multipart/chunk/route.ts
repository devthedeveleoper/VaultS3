import { NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3Client";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const uploadId = searchParams.get("uploadId");
    const partNumber = parseInt(searchParams.get("partNumber") || "0");

    if (!key || !uploadId || !partNumber) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const buffer = Buffer.from(await request.arrayBuffer());

    const command = new UploadPartCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: buffer,
    });

    const response = await s3Client.send(command);

    return NextResponse.json({ 
      partNumber, 
      eTag: response.ETag?.replace(/"/g, "") || "missing-etag" 
    });
  } catch (error: any) {
    console.error("Chunk upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
