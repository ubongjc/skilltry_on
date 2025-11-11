import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateFeedback } from '@/lib/ai-feedback';
import { incrementUsage } from '@/lib/stripe';
import { z } from 'zod';

const SubmitSchema = z.object({
  responses: z.array(
    z.object({
      stepId: z.string(),
      textResponse: z.string().optional(),
      selectedOption: z.number().optional(),
      mediaKeys: z.array(z.string()).optional(),
    })
  ),
  timeSpent: z.number(),
  completedAt: z.string(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/attempts/[id]/submit
 * Submit attempt for AI evaluation
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id: attemptId } = await context.params;

    const body = await request.json();
    const { responses, timeSpent, completedAt } = SubmitSchema.parse(body);

    // Verify attempt belongs to user
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        simulation: {
          select: {
            id: true,
            title: true,
            steps: true,
            rubric: true,
            resources: true,
          },
        },
      },
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

    // Update attempt with completed status
    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        responses,
        timeSpent,
        completedAt: new Date(completedAt),
        status: 'EVALUATING',
      },
    });

    // Increment usage count for subscription tracking
    await incrementUsage(user.id);

    // Generate AI feedback asynchronously
    generateFeedbackAsync(attemptId, attempt.simulation, responses).catch(
      console.error
    );

    return NextResponse.json({
      success: true,
      message:
        'Attempt submitted successfully. AI feedback is being generated.',
      attemptId,
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

    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit attempt' },
      { status: 500 }
    );
  }
}

/**
 * Generate AI feedback asynchronously
 * In production, this should be handled by a background job queue
 */
async function generateFeedbackAsync(
  attemptId: string,
  simulation: any,
  responses: any[]
) {
  try {
    // Generate AI feedback
    const feedback = await generateFeedback(
      simulation.steps,
      simulation.rubric,
      responses
    );

    // Update attempt with feedback
    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        score: feedback.overallScore,
        feedback: feedback.detailedFeedback,
        criteriaScores: feedback.criteriaScores,
        recommendations: feedback.recommendations,
        trainingLinks: feedback.trainingLinks,
        status: 'COMPLETED',
        evaluatedAt: new Date(),
      },
    });

    console.log(`Feedback generated for attempt ${attemptId}`);
  } catch (error) {
    console.error('Feedback generation error:', error);

    // Mark attempt as failed
    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'FAILED',
        metadata: {
          error: 'Failed to generate feedback',
          errorMessage: (error as Error).message,
        },
      },
    });
  }
}

/**
 * GET /api/attempts/[id]/submit
 * Check submission status
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id: attemptId } = await context.params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        status: true,
        score: true,
        evaluatedAt: true,
      },
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

    return NextResponse.json({
      success: true,
      status: attempt.status,
      score: attempt.score,
      evaluatedAt: attempt.evaluatedAt,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
