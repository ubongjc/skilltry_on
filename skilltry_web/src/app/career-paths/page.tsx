import { prisma } from '@/lib/prisma';
import CareerPathsClient from '@/components/career/CareerPathsClient';
import { requireAuth } from '@/lib/auth';

export default async function CareerPathsPage() {
  const user = await requireAuth().catch(() => null);

  // Get all career paths with simulation counts
  const careerPaths = await prisma.careerPath.findMany({
    where: { isPublished: true },
    include: {
      _count: {
        select: {
          simulations: {
            where: { isPublished: true },
          },
        },
      },
    },
    orderBy: { title: 'asc' },
  });

  // Get user's progress if authenticated
  let userProgress = null;
  if (user) {
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      include: {
        simulation: {
          select: {
            careerPathId: true,
          },
        },
      },
    });

    // Calculate progress per career path
    const progressMap = new Map();
    attempts.forEach((attempt) => {
      const pathId = attempt.simulation.careerPathId;
      if (pathId) {
        progressMap.set(pathId, (progressMap.get(pathId) || 0) + 1);
      }
    });

    userProgress = Object.fromEntries(progressMap);
  }

  return (
    <CareerPathsClient
      careerPaths={careerPaths}
      userProgress={userProgress}
      isAuthenticated={!!user}
    />
  );
}
