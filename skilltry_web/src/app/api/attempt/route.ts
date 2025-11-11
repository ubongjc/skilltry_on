import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Attempt creation schema
 */
const AttemptCreateSchema = z.object({
  simulationId: z.string().cuid(),
  responses: z.object({}).passthrough(),
  encryptedMedia: z.array(z.string()).default([]),
});

/**
 * Attempt update schema
 */
const AttemptUpdateSchema = z.object({
  rubricScores: z.object({}).passthrough(),
  overallScore: z.number().min(0).max(100),
  feedback: z.string().optional(),
  responses: z.object({}).passthrough().optional(),
  encryptedMedia: z.array(z.string()).optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']),
  duration: z.number().int().positive().optional(),
});

/**
 * POST /api/attempt
 * Create or update a simulation attempt
 *
 * @openapi
 * /api/attempt:
 *   post:
 *     summary: Create/update attempt
 *     description: Create a new simulation attempt or update an existing one
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - simulationId
 *             properties:
 *               simulationId:
 *                 type: string
 *               responses:
 *                 type: object
 *               encryptedMedia:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Attempt created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication
    // const user = await getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Mock user for now
    const userId = 'mock-user-id';

    const body = await request.json();
    const validatedData = AttemptCreateSchema.parse(body);

    // Check if simulation exists
    const simulation = await prisma.simulation.findUnique({
      where: { id: validatedData.simulationId },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    // Create attempt with initial values
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        simulationId: validatedData.simulationId,
        responses: validatedData.responses,
        encryptedMedia: validatedData.encryptedMedia,
        rubricScores: {},
        overallScore: 0,
        status: 'IN_PROGRESS',
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating attempt:', error);
    return NextResponse.json(
      { error: 'Failed to create attempt' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/attempt/:id
 * Update attempt with scores and feedback
 */
export async function PUT(request: NextRequest) {
  try {
    // TODO: Add authentication
    const userId = 'mock-user-id';

    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('id');

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = AttemptUpdateSchema.parse(body);

    // Verify ownership
    const existingAttempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!existingAttempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    // In production, verify userId matches
    // if (existingAttempt.userId !== userId) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const updateData: any = {
      ...validatedData,
    };

    if (validatedData.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const attempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: updateData,
    });

    return NextResponse.json(attempt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating attempt:', error);
    return NextResponse.json(
      { error: 'Failed to update attempt' },
      { status: 500 }
    );
  }
}
