import { PrismaClient, AchievementCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing achievements
  await prisma.achievement.deleteMany({});
  console.log('✅ Cleared existing achievements');

  // Seed Achievements
  const achievements = [
    // COMPLETION Category
    {
      name: 'First Steps',
      description: 'Complete your first simulation',
      category: AchievementCategory.COMPLETION,
      icon: '🎯',
      xpReward: 50,
      pointsReward: 100,
      requirement: 1,
      requirementType: 'SIMULATIONS_COMPLETED',
    },
    {
      name: 'Getting Started',
      description: 'Complete 5 simulations',
      category: AchievementCategory.COMPLETION,
      icon: '🚀',
      xpReward: 100,
      pointsReward: 200,
      requirement: 5,
      requirementType: 'SIMULATIONS_COMPLETED',
    },
    {
      name: 'Career Explorer',
      description: 'Complete 10 simulations',
      category: AchievementCategory.COMPLETION,
      icon: '🗺️',
      xpReward: 200,
      pointsReward: 400,
      requirement: 10,
      requirementType: 'SIMULATIONS_COMPLETED',
    },
    {
      name: 'Dedicated Professional',
      description: 'Complete 25 simulations',
      category: AchievementCategory.COMPLETION,
      icon: '💼',
      xpReward: 500,
      pointsReward: 1000,
      requirement: 25,
      requirementType: 'SIMULATIONS_COMPLETED',
    },
    {
      name: 'Career Master',
      description: 'Complete 50 simulations',
      category: AchievementCategory.COMPLETION,
      icon: '👑',
      xpReward: 1000,
      pointsReward: 2000,
      requirement: 50,
      requirementType: 'SIMULATIONS_COMPLETED',
    },
    {
      name: 'Legendary Explorer',
      description: 'Complete 100 simulations',
      category: AchievementCategory.COMPLETION,
      icon: '🏆',
      xpReward: 2500,
      pointsReward: 5000,
      requirement: 100,
      requirementType: 'SIMULATIONS_COMPLETED',
    },

    // MASTERY Category
    {
      name: 'Quick Learner',
      description: 'Score 80% or higher on a simulation',
      category: AchievementCategory.MASTERY,
      icon: '⭐',
      xpReward: 75,
      pointsReward: 150,
      requirement: 80,
      requirementType: 'SCORE_ACHIEVED',
    },
    {
      name: 'Excellence',
      description: 'Score 90% or higher on a simulation',
      category: AchievementCategory.MASTERY,
      icon: '🌟',
      xpReward: 150,
      pointsReward: 300,
      requirement: 90,
      requirementType: 'SCORE_ACHIEVED',
    },
    {
      name: 'Perfection',
      description: 'Score 100% on a simulation',
      category: AchievementCategory.MASTERY,
      icon: '💎',
      xpReward: 300,
      pointsReward: 600,
      requirement: 100,
      requirementType: 'SCORE_ACHIEVED',
    },
    {
      name: 'Consistent Excellence',
      description: 'Score 85% or higher on 10 simulations',
      category: AchievementCategory.MASTERY,
      icon: '🎓',
      xpReward: 400,
      pointsReward: 800,
      requirement: 10,
      requirementType: 'HIGH_SCORES',
    },
    {
      name: 'Master of Craft',
      description: 'Score 90% or higher on 25 simulations',
      category: AchievementCategory.MASTERY,
      icon: '🏅',
      xpReward: 1000,
      pointsReward: 2000,
      requirement: 25,
      requirementType: 'HIGH_SCORES',
    },

    // CONSISTENCY Category
    {
      name: 'Daily Commitment',
      description: 'Maintain a 3-day streak',
      category: AchievementCategory.CONSISTENCY,
      icon: '🔥',
      xpReward: 100,
      pointsReward: 200,
      requirement: 3,
      requirementType: 'STREAK',
    },
    {
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      category: AchievementCategory.CONSISTENCY,
      icon: '📅',
      xpReward: 250,
      pointsReward: 500,
      requirement: 7,
      requirementType: 'STREAK',
    },
    {
      name: 'Two Weeks Strong',
      description: 'Maintain a 14-day streak',
      category: AchievementCategory.CONSISTENCY,
      icon: '💪',
      xpReward: 500,
      pointsReward: 1000,
      requirement: 14,
      requirementType: 'STREAK',
    },
    {
      name: 'Monthly Champion',
      description: 'Maintain a 30-day streak',
      category: AchievementCategory.CONSISTENCY,
      icon: '🌙',
      xpReward: 1000,
      pointsReward: 2000,
      requirement: 30,
      requirementType: 'STREAK',
    },
    {
      name: 'Unstoppable Force',
      description: 'Maintain a 100-day streak',
      category: AchievementCategory.CONSISTENCY,
      icon: '⚡',
      xpReward: 5000,
      pointsReward: 10000,
      requirement: 100,
      requirementType: 'STREAK',
    },

    // SOCIAL Category
    {
      name: 'Rising Star',
      description: 'Reach top 100 on any leaderboard',
      category: AchievementCategory.SOCIAL,
      icon: '🌠',
      xpReward: 200,
      pointsReward: 400,
      requirement: 100,
      requirementType: 'LEADERBOARD_RANK',
    },
    {
      name: 'Top Performer',
      description: 'Reach top 50 on any leaderboard',
      category: AchievementCategory.SOCIAL,
      icon: '🎖️',
      xpReward: 400,
      pointsReward: 800,
      requirement: 50,
      requirementType: 'LEADERBOARD_RANK',
    },
    {
      name: 'Elite Player',
      description: 'Reach top 25 on any leaderboard',
      category: AchievementCategory.SOCIAL,
      icon: '🥉',
      xpReward: 800,
      pointsReward: 1600,
      requirement: 25,
      requirementType: 'LEADERBOARD_RANK',
    },
    {
      name: 'Top 10',
      description: 'Reach top 10 on any leaderboard',
      category: AchievementCategory.SOCIAL,
      icon: '🥈',
      xpReward: 1500,
      pointsReward: 3000,
      requirement: 10,
      requirementType: 'LEADERBOARD_RANK',
    },
    {
      name: 'Podium Finish',
      description: 'Reach top 3 on any leaderboard',
      category: AchievementCategory.SOCIAL,
      icon: '🥇',
      xpReward: 3000,
      pointsReward: 6000,
      requirement: 3,
      requirementType: 'LEADERBOARD_RANK',
    },
    {
      name: 'Champion',
      description: 'Reach #1 on any leaderboard',
      category: AchievementCategory.SOCIAL,
      icon: '👑',
      xpReward: 5000,
      pointsReward: 10000,
      requirement: 1,
      requirementType: 'LEADERBOARD_RANK',
    },

    // EXPLORATION Category
    {
      name: 'Career Curious',
      description: 'Try simulations from 3 different sectors',
      category: AchievementCategory.EXPLORATION,
      icon: '🔍',
      xpReward: 150,
      pointsReward: 300,
      requirement: 3,
      requirementType: 'SECTORS_EXPLORED',
    },
    {
      name: 'Jack of All Trades',
      description: 'Try simulations from 5 different sectors',
      category: AchievementCategory.EXPLORATION,
      icon: '🎭',
      xpReward: 300,
      pointsReward: 600,
      requirement: 5,
      requirementType: 'SECTORS_EXPLORED',
    },
    {
      name: 'Renaissance Professional',
      description: 'Try simulations from all available sectors',
      category: AchievementCategory.EXPLORATION,
      icon: '🌐',
      xpReward: 750,
      pointsReward: 1500,
      requirement: 10,
      requirementType: 'SECTORS_EXPLORED',
    },
    {
      name: 'Difficulty Seeker',
      description: 'Complete an advanced simulation',
      category: AchievementCategory.EXPLORATION,
      icon: '🎯',
      xpReward: 200,
      pointsReward: 400,
      requirement: 1,
      requirementType: 'ADVANCED_COMPLETED',
    },
    {
      name: 'Challenge Accepted',
      description: 'Complete 10 advanced simulations',
      category: AchievementCategory.EXPLORATION,
      icon: '⚔️',
      xpReward: 1000,
      pointsReward: 2000,
      requirement: 10,
      requirementType: 'ADVANCED_COMPLETED',
    },

    // SPEED Category
    {
      name: 'Quick Thinker',
      description: 'Complete a simulation in under half the estimated time',
      category: AchievementCategory.SPEED,
      icon: '⚡',
      xpReward: 150,
      pointsReward: 300,
      requirement: 1,
      requirementType: 'SPEED_RUN',
    },
    {
      name: 'Lightning Fast',
      description: 'Complete 5 simulations with speed bonus',
      category: AchievementCategory.SPEED,
      icon: '💨',
      xpReward: 400,
      pointsReward: 800,
      requirement: 5,
      requirementType: 'SPEED_RUNS',
    },
    {
      name: 'Time Master',
      description: 'Complete 10 simulations with speed bonus',
      category: AchievementCategory.SPEED,
      icon: '⏱️',
      xpReward: 800,
      pointsReward: 1600,
      requirement: 10,
      requirementType: 'SPEED_RUNS',
    },

    // DEDICATION Category
    {
      name: 'Novice',
      description: 'Reach Level 5',
      category: AchievementCategory.DEDICATION,
      icon: '📖',
      xpReward: 100,
      pointsReward: 200,
      requirement: 5,
      requirementType: 'LEVEL_REACHED',
    },
    {
      name: 'Apprentice',
      description: 'Reach Level 10',
      category: AchievementCategory.DEDICATION,
      icon: '🎓',
      xpReward: 250,
      pointsReward: 500,
      requirement: 10,
      requirementType: 'LEVEL_REACHED',
    },
    {
      name: 'Professional',
      description: 'Reach Level 20',
      category: AchievementCategory.DEDICATION,
      icon: '💼',
      xpReward: 750,
      pointsReward: 1500,
      requirement: 20,
      requirementType: 'LEVEL_REACHED',
    },
    {
      name: 'Expert',
      description: 'Reach Level 30',
      category: AchievementCategory.DEDICATION,
      icon: '🌟',
      xpReward: 1500,
      pointsReward: 3000,
      requirement: 30,
      requirementType: 'LEVEL_REACHED',
    },
    {
      name: 'Master',
      description: 'Reach Level 50',
      category: AchievementCategory.DEDICATION,
      icon: '👑',
      xpReward: 3000,
      pointsReward: 6000,
      requirement: 50,
      requirementType: 'LEVEL_REACHED',
    },
    {
      name: 'Legend',
      description: 'Reach Level 100',
      category: AchievementCategory.DEDICATION,
      icon: '🏆',
      xpReward: 10000,
      pointsReward: 20000,
      requirement: 100,
      requirementType: 'LEVEL_REACHED',
    },
    {
      name: 'Point Collector',
      description: 'Earn 10,000 total points',
      category: AchievementCategory.DEDICATION,
      icon: '💰',
      xpReward: 500,
      pointsReward: 1000,
      requirement: 10000,
      requirementType: 'TOTAL_POINTS',
    },
    {
      name: 'Wealthy Career Explorer',
      description: 'Earn 50,000 total points',
      category: AchievementCategory.DEDICATION,
      icon: '💎',
      xpReward: 2000,
      pointsReward: 4000,
      requirement: 50000,
      requirementType: 'TOTAL_POINTS',
    },
    {
      name: 'Point Millionaire',
      description: 'Earn 100,000 total points',
      category: AchievementCategory.DEDICATION,
      icon: '🎰',
      xpReward: 5000,
      pointsReward: 10000,
      requirement: 100000,
      requirementType: 'TOTAL_POINTS',
    },
  ];

  console.log(`📝 Creating ${achievements.length} achievements...`);

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    });
  }

  console.log('✅ Achievements created successfully');

  // Get counts by category
  const categoryCounts = await prisma.achievement.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('\n📊 Achievement Summary:');
  categoryCounts.forEach((item) => {
    console.log(`  ${item.category}: ${item._count} achievements`);
  });

  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
