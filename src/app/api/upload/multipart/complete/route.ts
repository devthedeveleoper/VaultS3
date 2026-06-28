import { NextResponse } from "next/server";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3Client";

export async function POST(request: Request) {
  try {
    const { key, uploadId, parts } = await request.json();

    if (!key || !uploadId || !parts || !Array.isArray(parts)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const command = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part: any) => ({
          ETag: part.eTag,
          PartNumber: part.partNumber,
        })),
      },
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    console.error("Error completing multipart upload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
