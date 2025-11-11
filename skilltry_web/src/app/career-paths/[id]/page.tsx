import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import CareerPathDetailClient from '@/components/career/CareerPathDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CareerPathDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireAuth().catch(() => null);

  // Fetch career path with simulations
  const careerPath = await prisma.careerPath.findUnique({
    where: { id, isPublished: true },
    include: {
      simulations: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          estimatedDuration: true,
          sector: true,
          tags: true,
          _count: {
            select: {
              attempts: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!careerPath) {
    notFound();
  }

  // Get user's attempts for this career path if authenticated
  let userAttempts = [];
  if (user) {
    userAttempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        simulation: {
          careerPathId: id,
        },
      },
      select: {
        id: true,
        simulationId: true,
        status: true,
        score: true,
        completedAt: true,
      },
    });
  }

  // Get user's avatar if authenticated
  let avatar = null;
  if (user) {
    avatar = await prisma.avatar.findUnique({
      where: { userId: user.id },
    });
  }

  return (
    <CareerPathDetailClient
      careerPath={careerPath}
      userAttempts={userAttempts}
      avatar={avatar}
      isAuthenticated={!!user}
    />
  );
}
