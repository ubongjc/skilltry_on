import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ProgressSchema = z.object({
  attemptId: z.string(),
  responses: z.array(
    z.object({
      stepId: z.string(),
      textResponse: z.string().optional(),
      selectedOption: z.number().optional(),
      mediaKeys: z.array(z.string()).optional(),
    })
  ),
  currentStep: z.number(),
  timeSpent: z.number(),
});

/**
 * POST /api/attempts/progress
 * Save attempt progress (auto-save functionality)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { attemptId, responses, currentStep, timeSpent } =
      ProgressSchema.parse(body);

    // Verify attempt belongs to user
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Attempt is not in progress' },
        { status: 400 }
      );
    }

    // Update progress
    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        responses,
        timeSpent,
        metadata: {
          currentStep,
          lastSaved: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Progress saved',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Progress save error:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}
