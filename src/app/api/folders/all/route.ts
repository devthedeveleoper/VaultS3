import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3Client";

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });
    const response = await s3Client.send(command);
    const prefixes = new Set<string>();
    
    response.Contents?.forEach(obj => {
      const parts = obj.Key?.split('/') || [];
      parts.pop(); // remove file name
      let current = '';
      for (const part of parts) {
        current += part + '/';
        prefixes.add(current);
      }
    });

    return NextResponse.json({ folders: Array.from(prefixes).sort() });
  } catch (error: any) {
    console.error("Error fetching all folders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
