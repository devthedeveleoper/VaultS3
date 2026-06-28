import { NextResponse } from "next/server";
import { s3Client, bucketName } from "@/lib/s3Client";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { url, path } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch the remote file
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      return NextResponse.json({ error: "Failed to fetch remote file" }, { status: 400 });
    }

    // Determine filename
    let filename = "remote-file";
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split("/");
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        filename = decodeURIComponent(lastPart);
      }
    } catch (e) {
      // ignore
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const uuid = uuidv4();
    
    // Sanitize filename to prevent MinIO invalid object name errors
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_ ()\[\]]/g, "_");
    const safePath = (path || "").replace(/[^a-zA-Z0-9.\-_/]/g, "_");
    
    const finalFilename = `${safeFilename}-${uuid}`;
    const key = safePath ? `${safePath}${finalFilename}` : finalFilename;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: response.body as any,
        ContentType: contentType,
      },
    });

    await upload.done();

    return NextResponse.json({ success: true, key, filename: finalFilename });
  } catch (error: any) {
    console.error("Remote upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload from remote URL" }, { status: 500 });
  }
}
