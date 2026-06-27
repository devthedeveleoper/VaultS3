import { NextResponse } from "next/server";
import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3Client";

export async function POST(request: Request) {
  try {
    const { sourceKey, destinationPrefix } = await request.json();

    if (!sourceKey || destinationPrefix === undefined) {
      return NextResponse.json({ error: "Missing sourceKey or destinationPrefix" }, { status: 400 });
    }

    const fileName = sourceKey.split('/').pop();
    const newKey = destinationPrefix ? `${destinationPrefix}${fileName}` : fileName;

    // Copy to new key
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${encodeURIComponent(sourceKey)}`,
      Key: newKey,
    });
    
    await s3Client.send(copyCommand);

    // Delete old key
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: sourceKey,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json({ success: true, newKey });
  } catch (error: any) {
    console.error("Error moving file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
