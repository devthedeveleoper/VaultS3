import { NextResponse } from "next/server";
import { s3Client, bucketName } from "@/lib/s3Client";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const { keys, prefixes } = await request.json();

    const objectsToDelete: { Key: string }[] = [];

    // Add keys (files)
    if (keys && Array.isArray(keys)) {
      keys.forEach((key) => objectsToDelete.push({ Key: key }));
    }

    // Add prefixes (folders) - list and delete
    if (prefixes && Array.isArray(prefixes)) {
      for (const prefix of prefixes) {
        let isTruncated = true;
        let continuationToken: string | undefined = undefined;

        while (isTruncated) {
          const listCommand: any = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken,
          });

          const listResponse: any = await s3Client.send(listCommand);
          if (listResponse.Contents && listResponse.Contents.length > 0) {
            listResponse.Contents.forEach((item: any) => {
              if (item.Key) objectsToDelete.push({ Key: item.Key });
            });
          }
          isTruncated = listResponse.IsTruncated || false;
          continuationToken = listResponse.NextContinuationToken;
        }
      }
    }

    if (objectsToDelete.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Chunk the deletions into batches of 1000 (S3 limit)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < objectsToDelete.length; i += BATCH_SIZE) {
      const batch = objectsToDelete.slice(i, i + BATCH_SIZE);
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: batch,
          Quiet: false,
        },
      });
      await s3Client.send(deleteCommand);
    }

    return NextResponse.json({ success: true, count: objectsToDelete.length });
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to bulk delete" }, { status: 500 });
  }
}
