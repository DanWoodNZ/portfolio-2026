import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, isR2Configured } from "@/lib/r2";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME || "portfolio-media";
    const publicUrl = (
      process.env.NEXT_PUBLIC_CDN_URL ||
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
      process.env.R2_PUBLIC_URL ||
      "https://media.danrwood.com"
    ).replace(/\/+$/, "");

    // Determine media type
    const contentType = file.type || "application/octet-stream";
    const isVideo = contentType.startsWith("video/") || !!file.name.match(/\.(mp4|webm|mov)$/i);
    const mediaType: "image" | "video" = isVideo ? "video" : "image";

    // Generate unique file key with timestamp and clean filename
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `uploads/${Date.now()}-${cleanName}`;

    // If R2 is configured, upload directly to Cloudflare R2 bucket
    if (isR2Configured()) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const cleanKey = key.replace(/^\/+/, "");
      const url = `${publicUrl}/${cleanKey}`;
      return NextResponse.json({ success: true, url, type: mediaType, key });
    }

    // Fallback when R2 is unconfigured in local dev (avoids storing base64 strings in local browser storage)
    console.warn("Cloudflare R2 env vars missing. Returning placeholder URL without local storage mock.");
    return NextResponse.json({
      success: true,
      url: mediaType === "video" ? "/assets/misc/placeholder.mp4" : "/assets/misc/placeholder.jpg",
      type: mediaType,
      key,
      warning: "R2 unconfigured, placeholder returned"
    });

  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to R2" },
      { status: 500 }
    );
  }
}
