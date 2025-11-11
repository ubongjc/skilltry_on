import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

/**
 * R2 Storage Client Configuration
 * Cloudflare R2 is S3-compatible
 */
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'skilltry-media';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  isPublic?: boolean;
}

export interface SignedUploadUrl {
  url: string;
  key: string;
  expiresAt: Date;
}

/**
 * Generate unique file key with optional prefix
 */
function generateFileKey(prefix?: string, extension?: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const key = prefix ? `${prefix}/${timestamp}-${random}` : `${timestamp}-${random}`;
  return extension ? `${key}.${extension}` : key;
}

/**
 * Upload file buffer to R2
 */
export async function uploadFile(
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<string> {
  const { contentType = 'application/octet-stream', metadata = {}, cacheControl, isPublic = false } = options;

  const extension = contentType.split('/')[1] || '';
  const key = generateFileKey('uploads', extension);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: metadata,
    CacheControl: cacheControl || 'public, max-age=31536000',
    ...(isPublic && { ACL: 'public-read' }),
  });

  await s3Client.send(command);

  return key;
}

/**
 * Upload encrypted file
 * File should already be encrypted client-side
 */
export async function uploadEncryptedFile(
  encryptedBuffer: Buffer,
  userId: string,
  options: Omit<UploadOptions, 'metadata'> = {}
): Promise<string> {
  const key = generateFileKey(`encrypted/${userId}`, 'enc');

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: encryptedBuffer,
    ContentType: 'application/octet-stream',
    Metadata: {
      encrypted: 'true',
      userId,
      uploadedAt: new Date().toISOString(),
    },
    CacheControl: 'private, no-cache',
    ServerSideEncryption: 'AES256', // Additional server-side encryption
  });

  await s3Client.send(command);

  return key;
}

/**
 * Get file from R2
 */
export async function getFile(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('File not found');
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate signed URL for file upload
 * Returns a pre-signed URL that clients can use to upload directly to R2
 */
export async function generateSignedUploadUrl(
  userId: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<SignedUploadUrl> {
  const extension = contentType.split('/')[1] || '';
  const key = generateFileKey(`uploads/${userId}`, extension);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn,
  });

  return {
    url,
    key,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

/**
 * Generate signed URL for file download
 * Useful for private files that need temporary access
 */
export async function generateSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get public URL for file
 * Only works if file was uploaded with isPublic: true
 */
export function getPublicUrl(key: string): string {
  if (PUBLIC_URL) {
    return `${PUBLIC_URL}/${key}`;
  }
  return `https://${BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Upload avatar/profile image
 */
export async function uploadAvatar(
  buffer: Buffer,
  userId: string
): Promise<string> {
  const key = generateFileKey(`avatars/${userId}`, 'jpg');

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=31536000',
    ACL: 'public-read',
  });

  await s3Client.send(command);

  return getPublicUrl(key);
}

/**
 * Upload simulation thumbnail
 */
export async function uploadThumbnail(
  buffer: Buffer,
  simulationId: string
): Promise<string> {
  const key = generateFileKey(`thumbnails/${simulationId}`, 'jpg');

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=31536000',
    ACL: 'public-read',
  });

  await s3Client.send(command);

  return getPublicUrl(key);
}

/**
 * Batch delete files
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  await Promise.all(keys.map(key => deleteFile(key)));
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string) {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);

  return {
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    lastModified: response.LastModified,
    metadata: response.Metadata,
    etag: response.ETag,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(
  buffer: Buffer,
  maxSizeMB: number = 50
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return buffer.length <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function validateFileType(
  contentType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return contentType.startsWith(category + '/');
    }
    return contentType === type;
  });
}

/**
 * Common file type validators
 */
export const FileTypeValidators = {
  images: (contentType: string) =>
    validateFileType(contentType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']),

  videos: (contentType: string) =>
    validateFileType(contentType, ['video/mp4', 'video/webm', 'video/quicktime']),

  audio: (contentType: string) =>
    validateFileType(contentType, ['audio/mpeg', 'audio/wav', 'audio/webm']),

  documents: (contentType: string) =>
    validateFileType(contentType, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
};
