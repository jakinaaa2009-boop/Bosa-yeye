import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME?.trim();
const R2_PUBLIC_URL = normalizePublicUrl(process.env.R2_PUBLIC_URL);

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function normalizePublicUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value.replace(/\/$/, "");
  return `https://${value.replace(/\/$/, "")}`;
}

/** Accepts account ID only, or a pasted R2 endpoint URL. */
export function parseR2AccountId(raw?: string): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;

  const fromEndpoint = value.match(
    /https?:\/\/([a-f0-9]{32})\.r2\.cloudflarestorage\.com/i
  );
  if (fromEndpoint) return fromEndpoint[1];

  if (/^[a-f0-9]{32}$/i.test(value)) return value;

  const withoutProtocol = value.replace(/^https?:\/\//i, "");
  const host = withoutProtocol.split("/")[0];
  const fromHost = host.match(/^([a-f0-9]{32})\.r2\.cloudflarestorage\.com$/i);
  if (fromHost) return fromHost[1];

  return undefined;
}

const R2_ACCOUNT_ID = parseR2AccountId(process.env.R2_ACCOUNT_ID);

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
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;
    return { url: dataUrl, key };
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );
  } catch (error) {
    console.error("R2 upload error:", error);
    throw new Error(
      "Зураг хадгалахад алдаа гарлаа. R2 тохиргоог шалгана уу."
    );
  }

  const url = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
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
