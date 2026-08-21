import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  galleryR2,
  GALLERY_BUCKET,
  GALLERY_PREFIX,
  getGallerySignedUrl,
} from "@/lib/gallery-r2";

export async function GET() {
  const list = await galleryR2.send(
    new ListObjectsV2Command({
      Bucket: GALLERY_BUCKET,
      Prefix: GALLERY_PREFIX,
      MaxKeys: 200,
    }),
  );

  const files = await Promise.all(
    (list.Contents || []).map(async (obj) => ({
      key: obj.Key!,
      size: obj.Size ?? 0,
      uploaded: obj.LastModified?.toISOString() ?? "",
      url: await getGallerySignedUrl(obj.Key!),
    })),
  );

  files.sort((a, b) => (a.uploaded < b.uploaded ? 1 : -1));

  return NextResponse.json({ files });
}

export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  await galleryR2.send(
    new DeleteObjectCommand({ Bucket: GALLERY_BUCKET, Key: key }),
  );

  return NextResponse.json({ success: true });
}
