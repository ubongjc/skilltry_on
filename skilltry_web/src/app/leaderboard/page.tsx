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

  // Calculate user's ranks - properly handle "not in top 100" case
  let userRanks = null;
  if (currentUserRank && user) {
    const xpIndex = topByXP.findIndex((u) => u.id === user.id);
    const pointsIndex = topByPoints.findIndex((u) => u.id === user.id);
    const simulationsIndex = topBySimulations.findIndex((u) => u.id === user.id);
    const streakIndex = topByStreak.findIndex((u) => u.id === user.id);

    userRanks = {
      xp: xpIndex >= 0 ? xpIndex + 1 : null,
      points: pointsIndex >= 0 ? pointsIndex + 1 : null,
      simulations: simulationsIndex >= 0 ? simulationsIndex + 1 : null,
      streak: streakIndex >= 0 ? streakIndex + 1 : null,
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
