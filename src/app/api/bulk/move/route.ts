import { NextResponse } from "next/server";
import { CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3Client";

export async function POST(request: Request) {
  try {
    const { keys, prefixes, destinationPrefix } = await request.json();

    if (!Array.isArray(keys) || !Array.isArray(prefixes) || destinationPrefix === undefined) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const movePromises: Promise<any>[] = [];

    // Move single files
    for (const key of keys) {
      const fileName = key.split('/').pop();
      const newKey = destinationPrefix ? `${destinationPrefix}${fileName}` : fileName;
      
      movePromises.push(
        (async () => {
          await s3Client.send(new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${encodeURIComponent(key)}`,
            Key: newKey,
          }));
          await s3Client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          }));
        })()
      );
    }

    // Move folders (prefixes) recursively
    for (const prefix of prefixes) {
      let isTruncated = true;
      let continuationToken: string | undefined = undefined;

      while (isTruncated) {
        const listResponse: ListObjectsV2CommandOutput = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken,
          })
        );

        if (listResponse.Contents) {
          for (const obj of listResponse.Contents) {
            if (!obj.Key) continue;
            
            const currentKey = obj.Key;
            
            const prefixParts = prefix.split('/').filter(Boolean);
            const folderName = prefixParts[prefixParts.length - 1];
            const relativePathInsideFolder = currentKey.substring(prefix.length);
            
            const newKey = destinationPrefix 
              ? `${destinationPrefix}${folderName}/${relativePathInsideFolder}` 
              : `${folderName}/${relativePathInsideFolder}`;

            movePromises.push(
              (async () => {
                await s3Client.send(new CopyObjectCommand({
                  Bucket: bucketName,
                  CopySource: `${bucketName}/${encodeURIComponent(currentKey)}`,
                  Key: newKey,
                }));
                await s3Client.send(new DeleteObjectCommand({
                  Bucket: bucketName,
                  Key: currentKey,
                }));
              })()
            );
          }
        }

        isTruncated = listResponse.IsTruncated ?? false;
        continuationToken = listResponse.NextContinuationToken;
      }
    }

    await Promise.all(movePromises);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bulk move error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
