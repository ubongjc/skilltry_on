import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { canCreateAttempt } from '@/lib/stripe';
import SimulationPlayer from '@/components/SimulationPlayer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SimulationPlayPage({ params }: PageProps) {
  const { id } = await params;

  // Require authentication
  const user = await requireAuth().catch(() => null);
  if (!user) {
    redirect(`/sign-in?redirect=/simulations/${id}/play`);
  }

  // Check subscription limits
  const canStart = await canCreateAttempt(user.id);
  if (!canStart) {
    redirect(`/simulations/${id}?error=limit_reached`);
  }

  // Load simulation and user avatar
  const [simulation, avatar] = await Promise.all([
    prisma.simulation.findUnique({
      where: { id, isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        sector: true,
        difficulty: true,
        estimatedDuration: true,
        steps: true,
        rubric: true,
        resources: true,
      },
    }),
    prisma.avatar.findUnique({
      where: { userId: user.id },
    }),
  ]);

  if (!simulation) {
    notFound();
  }

  // Create attempt record
  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      simulationId: simulation.id,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      responses: [],
      encryptedMedia: [],
    },
  });

  return (
    <SimulationPlayer
      simulation={simulation}
      attemptId={attempt.id}
      userId={user.id}
      avatar={avatar}
    />
  );
}
