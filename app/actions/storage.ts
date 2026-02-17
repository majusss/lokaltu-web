"use server";

import { getR2 } from "@/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.NEXT_PUBLIC_CDN_URL;

export async function getUploadUrl(contentType: string) {
  const key = `places/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(getR2(), command, { expiresIn: 3600 });

  return { url, key };
}

export async function getImageUrl(key: string): Promise<string> {
  if (PUBLIC_URL) {
    return `${PUBLIC_URL}/${key}`;
  }
  return key;
}
