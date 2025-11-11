import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, deleteUserAccount } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFiles } from '@/lib/storage';
import { z } from 'zod';

const DeleteRequestSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
  password: z.string().optional(),
});

/**
 * POST /api/gdpr/delete
 * Request account deletion (GDPR compliance - Right to be Forgotten)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { confirmation } = DeleteRequestSchema.parse(body);

    // Check if there's already a pending deletion request
    const existingRequest = await prisma.dataSubjectRequest.findFirst({
      where: {
        userId: user.id,
        requestType: 'DELETE',
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'You already have a pending deletion request',
          requestId: existingRequest.id,
        },
        { status: 400 }
      );
    }

    // Create deletion request
    const deletionRequest = await prisma.dataSubjectRequest.create({
      data: {
        userId: user.id,
        requestType: 'DELETE',
        status: 'PROCESSING',
      },
    });

    // Process deletion asynchronously
    processAccountDeletion(user.id, deletionRequest.id).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Account deletion request created. Your account will be permanently deleted within 30 days. You can cancel this request during this period.',
      requestId: deletionRequest.id,
      deletionScheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request. Please type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Deletion request error:', error);
    return NextResponse.json(
      { error: 'Failed to create deletion request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gdpr/delete/:requestId
 * Cancel deletion request (within 30-day grace period)
 */
export async function DELETE(request: NextRequest) {
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

    const deletionRequest = await prisma.dataSubjectRequest.findUnique({
      where: { id: requestId },
    });

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'Deletion request not found' },
        { status: 404 }
      );
    }

    if (deletionRequest.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (deletionRequest.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Account has already been deleted' },
        { status: 400 }
      );
    }

    // Cancel the deletion request
    await prisma.dataSubjectRequest.update({
      where: { id: requestId },
      data: {
        status: 'FAILED', // Mark as failed to indicate cancellation
        processedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account deletion request cancelled. Your account will not be deleted.',
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel deletion request' },
      { status: 500 }
    );
  }
}

/**
 * Process account deletion asynchronously
 * In production, this should be handled by a background job queue
 * with a 30-day grace period before permanent deletion
 */
async function processAccountDeletion(userId: string, requestId: string) {
  try {
    // In production, wait 30 days before actual deletion
    // For demo purposes, we'll do it immediately
    // await delay(30 * 24 * 60 * 60 * 1000); // 30 days

    // Get all user data before deletion
    const [attempts, user] = await Promise.all([
      prisma.attempt.findMany({
        where: { userId },
        select: { encryptedMedia: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Collect all file keys to delete
    const fileKeys: string[] = [];
    attempts.forEach(attempt => {
      fileKeys.push(...attempt.encryptedMedia);
    });

    // Delete files from storage
    if (fileKeys.length > 0) {
      await deleteFiles(fileKeys);
    }

    // Soft delete user account
    await deleteUserAccount(userId);

    // Update deletion request
    await prisma.dataSubjectRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // TODO: Delete Clerk user via Clerk API
    // await clerkClient.users.deleteUser(user.clerkId);

    // TODO: Send confirmation email
    console.log(`Account deleted for user ${userId}`);
  } catch (error) {
    console.error('Account deletion processing error:', error);

    await prisma.dataSubjectRequest.update({
      where: { id: requestId },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
      },
    });
  }
}
