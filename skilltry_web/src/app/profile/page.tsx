import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserGamificationStats, getXPProgress } from '@/lib/gamification';
import ProfileClient from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
  const user = await requireAuth().catch(() => null);

  if (!user) {
    redirect('/sign-in?redirect=/profile');
  }

  // Fetch user data with all relations
  const [userData, avatar, achievements, recentAttempts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        xp: true,
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    }),
    prisma.avatar.findUnique({
      where: { userId: user.id },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id, isCompleted: true },
      include: {
        achievement: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
    prisma.attempt.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      include: {
        simulation: {
          select: {
            title: true,
            sector: true,
            difficulty: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
  ]);

  if (!userData) {
    redirect('/dashboard');
  }

  // Get gamification stats
  const stats = await getUserGamificationStats(user.id);

  return (
    <ProfileClient
      user={userData}
      avatar={avatar}
      stats={stats}
      achievements={achievements}
      recentAttempts={recentAttempts}
    />
  );
}
