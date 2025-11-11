import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, exportUserData } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSignedDownloadUrl } from '@/lib/storage';

/**
 * POST /api/gdpr/export
 * Request data export (GDPR compliance)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check if there's already a pending request
    const existingRequest = await prisma.dataSubjectRequest.findFirst({
      where: {
        userId: user.id,
        requestType: 'EXPORT',
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'You already have a pending export request',
          requestId: existingRequest.id,
        },
        { status: 400 }
      );
    }

    // Create export request
    const request = await prisma.dataSubjectRequest.create({
      data: {
        userId: user.id,
        requestType: 'EXPORT',
        status: 'PROCESSING',
      },
    });

    // Process export asynchronously
    processDataExport(user.id, request.id).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Data export request created. You will receive an email with a download link within 24 hours.',
      requestId: request.id,
    });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Export request error:', error);
    return NextResponse.json(
      { error: 'Failed to create export request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gdpr/export/:requestId
 * Check export status and download
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID required' },
        { status: 400 }
      );
    }

    const exportRequest = await prisma.dataSubjectRequest.findUnique({
      where: { id: requestId },
    });

    if (!exportRequest) {
      return NextResponse.json(
        { error: 'Export request not found' },
        { status: 404 }
      );
    }

    if (exportRequest.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (exportRequest.status === 'COMPLETED' && exportRequest.exportUrl) {
      // Generate fresh signed URL
      const downloadUrl = await generateSignedDownloadUrl(
        exportRequest.exportUrl,
        3600 // 1 hour
      );

      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        downloadUrl,
        completedAt: exportRequest.completedAt,
      });
    }

    return NextResponse.json({
      success: true,
      status: exportRequest.status,
      requestedAt: exportRequest.requestedAt,
      processedAt: exportRequest.processedAt,
    });
  } catch (error) {
    console.error('Export status error:', error);
    return NextResponse.json(
      { error: 'Failed to check export status' },
      { status: 500 }
    );
  }
}

/**
 * Process data export asynchronously
 * In production, this should be handled by a background job queue
 */
async function processDataExport(userId: string, requestId: string) {
  try {
    // Export all user data
    const userData = await exportUserData(userId);

    // Convert to JSON
    const jsonData = JSON.stringify(userData, null, 2);
    const buffer = Buffer.from(jsonData, 'utf-8');

    // Upload to R2
    const { uploadFile } = await import('@/lib/storage');
    const fileKey = await uploadFile(buffer, {
      contentType: 'application/json',
      metadata: {
        userId,
        requestId,
        exportedAt: new Date().toISOString(),
      },
    });

    // Update request
    await prisma.dataSubjectRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        exportUrl: fileKey,
        processedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // TODO: Send email notification
    console.log(`Data export completed for user ${userId}`);
  } catch (error) {
    console.error('Data export processing error:', error);

    await prisma.dataSubjectRequest.update({
      where: { id: requestId },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
      },
    });
  }
}
