import "server-only";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const GALLERY_BUCKET = process.env.GALLERY_R2_BUCKET || "techno-gallery";

export type GalleryFolder = "special" | "general";
export const GALLERY_FOLDERS: GalleryFolder[] = ["special", "general"];

export function isGalleryFolder(value: unknown): value is GalleryFolder {
  return value === "special" || value === "general";
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const galleryR2 = new S3Client({
  region: "auto",
  endpoint:
    process.env.GALLERY_R2_ENDPOINT ||
    `https://${requireEnv("GALLERY_R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("GALLERY_R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("GALLERY_R2_SECRET_ACCESS_KEY"),
  },
});

export async function getGallerySignedUrl(key: string): Promise<string> {
  return getSignedUrl(
    galleryR2,
    new GetObjectCommand({ Bucket: GALLERY_BUCKET, Key: key }),
    { expiresIn: 3600 },
  );
}
