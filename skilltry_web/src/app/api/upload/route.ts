import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadFile, uploadEncryptedFile, generateSignedUploadUrl, FileTypeValidators, validateFileSize } from '@/lib/storage';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { z } from 'zod';

const UploadRequestSchema = z.object({
  type: z.enum(['avatar', 'thumbnail', 'encrypted', 'general']),
  contentType: z.string(),
  encrypted: z.boolean().optional(),
});

/**
 * POST /api/upload
 * Upload file to R2 storage
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.upload, 10, async (req) => {
    try {
      const user = await requireAuth();

      const contentType = req.headers.get('content-type');

      // Handle multipart form data uploads
      if (contentType?.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = (formData.get('type') as string) || 'general';
        const encrypted = formData.get('encrypted') === 'true';

        if (!file) {
          return NextResponse.json(
            { error: 'No file provided' },
            { status: 400 }
          );
        }

        // Validate file
        const buffer = Buffer.from(await file.arrayBuffer());

        if (!validateFileSize(buffer, 50)) {
          return NextResponse.json(
            { error: 'File size must be less than 50MB' },
            { status: 400 }
          );
        }

        // Validate file type based on upload type
        let isValidType = false;
        switch (type) {
          case 'avatar':
          case 'thumbnail':
            isValidType = FileTypeValidators.images(file.type);
            break;
          case 'encrypted':
            isValidType = true; // Encrypted files can be any type
            break;
          case 'general':
            isValidType =
              FileTypeValidators.images(file.type) ||
              FileTypeValidators.videos(file.type) ||
              FileTypeValidators.audio(file.type) ||
              FileTypeValidators.documents(file.type);
            break;
        }

        if (!isValidType) {
          return NextResponse.json(
            { error: 'Invalid file type' },
            { status: 400 }
          );
        }

        let fileKey: string;

        if (encrypted) {
          // File should already be encrypted client-side
          fileKey = await uploadEncryptedFile(buffer, user.id);
        } else {
          fileKey = await uploadFile(buffer, {
            contentType: file.type,
            metadata: {
              userId: user.id,
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
            },
          });
        }

        return NextResponse.json({
          success: true,
          fileKey,
          url: `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileKey}`,
        });
      }

      // Handle JSON requests for signed URL generation
      const body = await req.json();
      const { type, contentType, encrypted } = UploadRequestSchema.parse(body);

      // Generate signed upload URL for direct client uploads
      const signedUrl = await generateSignedUploadUrl(user.id, contentType);

      return NextResponse.json({
        success: true,
        uploadUrl: signedUrl.url,
        fileKey: signedUrl.key,
        expiresAt: signedUrl.expiresAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }

      if ((error as Error).message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET /api/upload/signed-url
 * Get signed URL for direct client upload
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType') || 'application/octet-stream';
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    if (expiresIn > 7200) {
      return NextResponse.json(
        { error: 'Expiration time cannot exceed 2 hours' },
        { status: 400 }
      );
    }

    const signedUrl = await generateSignedUploadUrl(user.id, contentType, expiresIn);

    return NextResponse.json({
      success: true,
      uploadUrl: signedUrl.url,
      fileKey: signedUrl.key,
      expiresAt: signedUrl.expiresAt,
    });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Signed URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
