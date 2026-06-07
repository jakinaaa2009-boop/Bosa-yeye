import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getS3Client(): S3Client | null {
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME
  ) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export function validateImageFile(
  buffer: Buffer,
  contentType: string
): { valid: boolean; message?: string } {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return {
      valid: false,
      message: "Зөвхөн JPEG, PNG, WebP зураг оруулах боломжтой",
    };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: "Файлын хэмжээ 5MB-аас их байж болохгүй",
    };
  }

  return { valid: true };
}

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  userId: string
): Promise<{ url: string; key: string }> {
  const validation = validateImageFile(fileBuffer, contentType);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const client = getS3Client();
  const key = `receipts/${userId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  if (!client || !R2_BUCKET_NAME) {
    // Fallback for development without R2 configured
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;
    return { url: dataUrl, key };
  }

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  const url = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`
    : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;

  return { url, key };
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getS3Client();
  if (!client || !R2_BUCKET_NAME) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}
