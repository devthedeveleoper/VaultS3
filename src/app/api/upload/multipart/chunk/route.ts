import { NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3Client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const key = formData.get("key") as string;
    const uploadId = formData.get("uploadId") as string;
    const partNumber = parseInt(formData.get("partNumber") as string);
    const chunk = formData.get("chunk") as Blob;

    if (!key || !uploadId || !partNumber || !chunk) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());

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
