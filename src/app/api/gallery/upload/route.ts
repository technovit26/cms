import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  galleryR2,
  GALLERY_BUCKET,
  GALLERY_PREFIX,
  getGallerySignedUrl,
} from "@/lib/gallery-r2";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData
    .getAll("file")
    .filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const safeName = file.name.replace(/\s+/g, "-");
        const key = `${GALLERY_PREFIX}${crypto.randomUUID()}-${safeName}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        await galleryR2.send(
          new PutObjectCommand({
            Bucket: GALLERY_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type || "application/octet-stream",
          }),
        );

        const url = await getGallerySignedUrl(key);
        return { name: file.name, key, url, size: file.size, success: true };
      } catch (error) {
        console.error(`Gallery upload failed for ${file.name}:`, error);
        return { name: file.name, success: false, error: "Upload failed" };
      }
    }),
  );

  return NextResponse.json({ results });
}
