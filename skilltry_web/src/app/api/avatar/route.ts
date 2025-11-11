import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AvatarSchema = z.object({
  skinTone: z.string(),
  hairStyle: z.string(),
  hairColor: z.string(),
  eyeColor: z.string(),
  outfit: z.string(),
  accessories: z.array(z.string()),
  displayName: z.string().optional(),
  jobTitle: z.string().optional(),
});

/**
 * POST /api/avatar
 * Create user avatar
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const avatarData = AvatarSchema.parse(body);

    // Check if avatar already exists
    const existing = await prisma.avatar.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Avatar already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const avatar = await prisma.avatar.create({
      data: {
        userId: user.id,
        ...avatarData,
      },
    });

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid avatar data', details: error.errors },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Avatar creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create avatar' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/avatar
 * Update user avatar
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const avatarData = AvatarSchema.parse(body);

    const avatar = await prisma.avatar.upsert({
      where: { userId: user.id },
      update: avatarData,
      create: {
        userId: user.id,
        ...avatarData,
      },
    });

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid avatar data', details: error.errors },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Avatar update error:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/avatar
 * Get user's avatar
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const avatar = await prisma.avatar.findUnique({
      where: { userId: user.id },
    });

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Avatar fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar' },
      { status: 500 }
    );
  }
}
