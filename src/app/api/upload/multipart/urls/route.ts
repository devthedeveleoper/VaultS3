import { NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, bucketName } from "@/lib/s3Client";

export async function POST(request: Request) {
  try {
    const { key, uploadId, parts } = await request.json();

    if (!key || !uploadId || !parts || !Array.isArray(parts)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const presignedUrls = await Promise.all(
      parts.map(async (partNumber: number) => {
        const command = new UploadPartCommand({
          Bucket: bucketName,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        });
        
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return { partNumber, url };
      })
    );

    return NextResponse.json({ urls: presignedUrls });
  } catch (error: any) {
    console.error("Error generating presigned URLs for parts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
