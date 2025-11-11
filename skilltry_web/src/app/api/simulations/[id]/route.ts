import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Simulation update schema
 */
const SimulationUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sector: z.string().min(1).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  steps: z.array(z.any()).optional(),
  rubric: z.object({}).passthrough().optional(),
  resources: z.object({}).passthrough().optional(),
  thumbnailUrl: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  isPublished: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/simulations/:id
 * Get a specific simulation by ID
 *
 * @openapi
 * /api/simulations/{id}:
 *   get:
 *     summary: Get simulation
 *     description: Retrieve a specific simulation by ID
 *     tags:
 *       - Simulations
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Simulation details
 *       404:
 *         description: Simulation not found
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const simulation = await prisma.simulation.findUnique({
      where: { id },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Error fetching simulation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulation' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/simulations/:id
 * Update a simulation
 *
 * @openapi
 * /api/simulations/{id}:
 *   put:
 *     summary: Update simulation
 *     description: Update an existing simulation
 *     tags:
 *       - Simulations
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Simulation updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Simulation not found
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // TODO: Add authentication middleware
    // const user = await getCurrentUser(request);
    // if (!user || user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validatedData = SimulationUpdateSchema.parse(body);

    const simulation = await prisma.simulation.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(simulation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Prisma not found error
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    console.error('Error updating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to update simulation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/simulations/:id
 * Delete a simulation
 *
 * @openapi
 * /api/simulations/{id}:
 *   delete:
 *     summary: Delete simulation
 *     description: Delete a simulation by ID
 *     tags:
 *       - Simulations
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Simulation deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Simulation not found
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // TODO: Add authentication middleware
    // const user = await getCurrentUser(request);
    // if (!user || user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await context.params;

    await prisma.simulation.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Prisma not found error
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    console.error('Error deleting simulation:', error);
    return NextResponse.json(
      { error: 'Failed to delete simulation' },
      { status: 500 }
    );
  }
}
