import { NextResponse } from "next/server";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3Client";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { filename, contentType, path = "" } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const lastDotIndex = filename.lastIndexOf(".");
    let fileKey;
    if (lastDotIndex !== -1 && lastDotIndex !== 0) {
      const namePart = filename.substring(0, lastDotIndex);
      const extPart = filename.substring(lastDotIndex);
      fileKey = `${namePart}-${uuidv4()}${extPart}`;
    } else {
      fileKey = `${filename}-${uuidv4()}`;
    }

    // Prepend the virtual folder path if one exists
    const key = path ? `${path}${fileKey}` : fileKey;

    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      uploadId: response.UploadId,
      key,
    });
  } catch (error: any) {
    console.error("Error creating multipart upload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
