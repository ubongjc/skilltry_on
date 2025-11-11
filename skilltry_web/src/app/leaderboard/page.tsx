import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient';

export default async function LeaderboardPage() {
  const user = await requireAuth().catch(() => null);

  // Get top users by different metrics
  const [
    topByXP,
    topByPoints,
    topBySimulations,
    topByStreak,
    currentUserRank,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        level: true,
        xp: true,
        avatar: true,
      },
      orderBy: { xp: 'desc' },
      take: 100,
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        level: true,
        totalPoints: true,
        avatar: true,
      },
      orderBy: { totalPoints: 'desc' },
      take: 100,
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        level: true,
        avatar: true,
        _count: {
          select: {
            attempts: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
      orderBy: {
        attempts: {
          _count: 'desc',
        },
      },
      take: 100,
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        avatar: true,
      },
      orderBy: { currentStreak: 'desc' },
      take: 100,
    }),
    user
      ? prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            level: true,
            xp: true,
            totalPoints: true,
            currentStreak: true,
            avatar: true,
            _count: {
              select: {
                attempts: {
                  where: { status: 'COMPLETED' },
                },
              },
            },
          },
        })
      : null,
  ]);

  // Calculate user's ranks
  let userRanks = null;
  if (currentUserRank && user) {
    const xpRank = topByXP.findIndex((u) => u.id === user.id) + 1;
    const pointsRank = topByPoints.findIndex((u) => u.id === user.id) + 1;
    const simulationsRank = topBySimulations.findIndex((u) => u.id === user.id) + 1;
    const streakRank = topByStreak.findIndex((u) => u.id === user.id) + 1;

    userRanks = {
      xp: xpRank || null,
      points: pointsRank || null,
      simulations: simulationsRank || null,
      streak: streakRank || null,
    };
  }

  return (
    <LeaderboardClient
      topByXP={topByXP}
      topByPoints={topByPoints}
      topBySimulations={topBySimulations}
      topByStreak={topByStreak}
      currentUser={currentUserRank}
      userRanks={userRanks}
      userId={user?.id}
    />
  );
}
