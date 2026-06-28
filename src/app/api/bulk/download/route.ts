import { s3Client, bucketName } from "@/lib/s3Client";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import * as yazl from "yazl";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keysParam = searchParams.get("keys");
    const prefixesParam = searchParams.get("prefixes");

    const keys = keysParam ? JSON.parse(decodeURIComponent(keysParam)) : [];
    const prefixes = prefixesParam ? JSON.parse(decodeURIComponent(prefixesParam)) : [];

    const objectsToDownload: string[] = [];

    if (Array.isArray(keys)) {
      keys.forEach((key) => objectsToDownload.push(key));
    }

    if (Array.isArray(prefixes)) {
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
              if (item.Key && !item.Key.endsWith('/')) {
                objectsToDownload.push(item.Key);
              }
            });
          }
          isTruncated = listResponse.IsTruncated || false;
          continuationToken = listResponse.NextContinuationToken;
        }
      }
    }

    if (objectsToDownload.length === 0) {
      return new Response("No files selected", { status: 400 });
    }

    const zipfile = new yazl.ZipFile();
    
    const stream = new ReadableStream({
      start(controller) {
        zipfile.outputStream.on("data", (chunk: any) => {
          controller.enqueue(chunk);
        });
        zipfile.outputStream.on("end", () => {
          controller.close();
        });
        zipfile.outputStream.on("error", (err: any) => {
          controller.error(err);
        });

        // Start adding files to the archive
        (async () => {
          try {
            for (const key of objectsToDownload) {
              const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
              });
              const response = await s3Client.send(command);
              if (response.Body) {
                // Add stream to zip
                zipfile.addReadStream(response.Body as any, key);
              }
            }
            zipfile.end();
          } catch (err) {
            console.error("Error adding files to archive:", err);
            controller.error(err);
          }
        })();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="vaults3-download.zip"',
      },
    });
  } catch (error: any) {
    console.error("Bulk download error:", error);
    return new Response(error.message || "Failed to generate bulk download", { status: 500 });
  }
}
