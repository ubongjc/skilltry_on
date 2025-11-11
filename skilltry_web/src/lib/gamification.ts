/**
 * Gamification Engine
 * Handles XP, leveling, achievements, and rewards
 */

import { prisma } from './prisma';

// XP required for each level (exponential growth)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate total XP needed to reach a level
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

// Get level from total XP
export function getLevelFromXP(xp: number): number {
  let level = 1;
  let requiredXP = 0;

  while (xp >= requiredXP + getXPForLevel(level)) {
    requiredXP += getXPForLevel(level);
    level++;
  }

  return level;
}

// Calculate XP progress within current level
export function getXPProgress(xp: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progress: number; // 0-100
} {
  const currentLevel = getLevelFromXP(xp);
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = getXPForLevel(currentLevel);
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progress,
  };
}

/**
 * Calculate XP earned from a simulation attempt
 */
export function calculateXPEarned(params: {
  score: number;
  difficulty: string;
  timeSpent: number;
  estimatedDuration: number;
  isFirstAttempt: boolean;
}): number {
  const { score, difficulty, timeSpent, estimatedDuration, isFirstAttempt } = params;

  // Base XP from score (0-100)
  let xp = score;

  // Difficulty multiplier
  const difficultyMultipliers = {
    EASY: 1.0,
    MEDIUM: 1.5,
    HARD: 2.0,
  };
  xp *= difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1.0;

  // Completion bonus
  if (score >= 70) {
    xp += 20; // Passing bonus
  }
  if (score >= 90) {
    xp += 30; // Excellence bonus
  }

  // First attempt bonus
  if (isFirstAttempt) {
    xp += 15;
  }

  // Speed bonus (completed faster than estimated)
  if (timeSpent < estimatedDuration * 60) {
    const speedBonus = Math.min(20, Math.floor((estimatedDuration * 60 - timeSpent) / 60));
    xp += speedBonus;
  }

  return Math.floor(xp);
}

/**
 * Calculate points earned from a simulation attempt
 */
export function calculatePointsEarned(params: {
  score: number;
  difficulty: string;
  criteriaScores: Record<string, number>;
}): number {
  const { score, difficulty, criteriaScores } = params;

  // Base points from score
  let points = Math.floor(score * 10);

  // Difficulty multiplier
  const difficultyMultipliers = {
    EASY: 1.0,
    MEDIUM: 1.5,
    HARD: 2.5,
  };
  points = Math.floor(points * (difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1.0));

  // Perfect score bonus
  if (score === 100) {
    points += 500;
  }

  // Excellence bonus per criterion
  if (criteriaScores) {
    Object.values(criteriaScores).forEach((criteriaScore) => {
      if (criteriaScore >= 9) {
        points += 50;
      }
    });
  }

  return points;
}

/**
 * Award XP and points to user, update level
 */
export async function awardRewards(
  userId: string,
  xpEarned: number,
  pointsEarned: number
): Promise<{
  newXP: number;
  newPoints: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, totalPoints: true, level: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const oldLevel = user.level;
  const newXP = user.xp + xpEarned;
  const newPoints = user.totalPoints + pointsEarned;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > oldLevel;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      totalPoints: newPoints,
      level: newLevel,
    },
  });

  return {
    newXP,
    newPoints,
    oldLevel,
    newLevel,
    leveledUp,
  };
}

/**
 * Update user's daily streak
 */
export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  streakMaintained: boolean;
  streakBroken: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = user.lastActiveDate
    ? new Date(
        user.lastActiveDate.getFullYear(),
        user.lastActiveDate.getMonth(),
        user.lastActiveDate.getDate()
      )
    : null;

  let currentStreak = user.currentStreak;
  let longestStreak = user.longestStreak;
  let streakMaintained = false;
  let streakBroken = false;

  if (!lastActive) {
    // First activity
    currentStreak = 1;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, maintain streak
      streakMaintained = true;
    } else if (daysDiff === 1) {
      // Next day, increment streak
      currentStreak += 1;
      streakMaintained = true;
    } else {
      // Streak broken
      currentStreak = 1;
      streakBroken = true;
    }
  }

  // Update longest streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      lastActiveDate: now,
    },
  });

  return {
    currentStreak,
    longestStreak,
    streakMaintained,
    streakBroken,
  };
}

/**
 * Check and update achievement progress
 */
export async function checkAchievements(
  userId: string,
  event: {
    type: string;
    value?: number;
    metadata?: any;
  }
): Promise<string[]> {
  const completedAchievements: string[] = [];

  // Get all active achievements
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
  });

  for (const achievement of achievements) {
    // Get or create user achievement record
    let userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (!userAchievement) {
      userAchievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });
    }

    // Skip if already completed
    if (userAchievement.isCompleted) continue;

    // Update progress based on achievement type
    const updatedProgress = await updateAchievementProgress(
      userId,
      achievement,
      userAchievement,
      event
    );

    // Check if completed
    if (updatedProgress >= achievement.requiredCount) {
      await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          progress: updatedProgress,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Award rewards
      if (achievement.xpReward > 0 || achievement.pointsReward > 0) {
        await awardRewards(
          userId,
          achievement.xpReward,
          achievement.pointsReward
        );
      }

      completedAchievements.push(achievement.id);
    } else if (updatedProgress > userAchievement.progress) {
      await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: { progress: updatedProgress },
      });
    }
  }

  return completedAchievements;
}

/**
 * Update individual achievement progress
 */
async function updateAchievementProgress(
  userId: string,
  achievement: any,
  userAchievement: any,
  event: any
): Promise<number> {
  let progress = userAchievement.progress;

  switch (achievement.category) {
    case 'COMPLETION':
      // Completed simulations
      if (event.type === 'simulation_completed') {
        progress += 1;
      }
      break;

    case 'MASTERY':
      // High scores
      if (event.type === 'high_score' && event.value && event.value >= (achievement.requiredValue || 90)) {
        progress += 1;
      }
      break;

    case 'CONSISTENCY':
      // Streaks
      if (event.type === 'streak_updated') {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { currentStreak: true },
        });
        progress = user?.currentStreak || 0;
      }
      break;

    case 'EXPLORATION':
      // Different sectors
      if (event.type === 'sector_explored') {
        const attempts = await prisma.attempt.findMany({
          where: {
            userId,
            status: 'COMPLETED',
          },
          include: {
            simulation: {
              select: { sector: true },
            },
          },
        });

        const uniqueSectors = new Set(attempts.map((a) => a.simulation.sector));
        progress = uniqueSectors.size;
      }
      break;

    case 'SPEED':
      // Fast completions
      if (event.type === 'fast_completion') {
        progress += 1;
      }
      break;

    case 'DEDICATION':
      // Total time or attempts
      if (event.type === 'attempt_created') {
        const totalAttempts = await prisma.attempt.count({
          where: { userId },
        });
        progress = totalAttempts;
      }
      break;
  }

  return progress;
}

/**
 * Get user's gamification stats
 */
export async function getUserGamificationStats(userId: string) {
  const [user, totalAttempts, completedAttempts, achievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        xp: true,
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
      },
    }),
    prisma.attempt.count({
      where: { userId },
    }),
    prisma.attempt.count({
      where: { userId, status: 'COMPLETED' },
    }),
    prisma.userAchievement.count({
      where: { userId, isCompleted: true },
    }),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  const xpProgress = getXPProgress(user.xp);
  const completionRate = totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0;

  return {
    level: user.level,
    xp: user.xp,
    totalPoints: user.totalPoints,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    xpProgress,
    totalAttempts,
    completedAttempts,
    completionRate,
    achievementsUnlocked: achievements,
  };
}
