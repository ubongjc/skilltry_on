import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Simulation schema for validation
 */
const SimulationCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sector: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  estimatedDuration: z.number().int().positive().default(10),
  steps: z.array(z.any()), // JSON structure
  rubric: z.object({}).passthrough(), // JSON structure
  resources: z.object({}).passthrough().optional(),
  thumbnailUrl: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).default([]),
  isPublished: z.boolean().default(false),
});

/**
 * GET /api/simulations
 * List all simulations with filtering and pagination
 *
 * @openapi
 * /api/simulations:
 *   get:
 *     summary: List simulations
 *     description: Retrieve a list of job simulations with optional filtering
 *     tags:
 *       - Simulations
 *     parameters:
 *       - name: sector
 *         in: query
 *         schema:
 *           type: string
 *       - name: difficulty
 *         in: query
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD]
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *       - name: published
 *         in: query
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: List of simulations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sector = searchParams.get('sector');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const published = searchParams.get('published') !== 'false';

    const where: any = {};

    if (sector) where.sector = sector;
    if (difficulty) where.difficulty = difficulty;
    if (published) where.isPublished = true;

    const [simulations, total] = await Promise.all([
      prisma.simulation.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          sector: true,
          difficulty: true,
          estimatedDuration: true,
          thumbnailUrl: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.simulation.count({ where }),
    ]);

    return NextResponse.json({
      data: simulations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/simulations
 * Create a new simulation
 *
 * @openapi
 * /api/simulations:
 *   post:
 *     summary: Create simulation
 *     description: Create a new job simulation scenario
 *     tags:
 *       - Simulations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - sector
 *               - steps
 *               - rubric
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               sector:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *               estimatedDuration:
 *                 type: integer
 *               steps:
 *                 type: array
 *               rubric:
 *                 type: object
 *     responses:
 *       201:
 *         description: Simulation created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware
    // const user = await getCurrentUser(request);
    // if (!user || user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();

    // Validate input
    const validatedData = SimulationCreateSchema.parse(body);

    const simulation = await prisma.simulation.create({
      data: validatedData,
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to create simulation' },
      { status: 500 }
    );
  }
}
