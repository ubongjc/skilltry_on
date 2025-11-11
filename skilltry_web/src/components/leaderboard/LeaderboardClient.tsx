'use client';

import { useState } from 'react';
import { Trophy, Star, Target, Flame, Crown, Medal, Award } from 'lucide-react';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
import Link from 'next/link';

interface LeaderboardClientProps {
  topByXP: any[];
  topByPoints: any[];
  topBySimulations: any[];
  topByStreak: any[];
  currentUser: any;
  userRanks: any;
  userId?: string;
}

type LeaderboardType = 'xp' | 'points' | 'simulations' | 'streak';

export default function LeaderboardClient({
  topByXP,
  topByPoints,
  topBySimulations,
  topByStreak,
  currentUser,
  userRanks,
  userId,
}: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('xp');

  const leaderboards = {
    xp: topByXP,
    points: topByPoints,
    simulations: topBySimulations,
    streak: topByStreak,
  };

  const currentLeaderboard = leaderboards[activeTab];

  const getValueForTab = (user: any, tab: LeaderboardType) => {
    switch (tab) {
      case 'xp':
        return user.xp?.toLocaleString() || '0';
      case 'points':
        return user.totalPoints?.toLocaleString() || '0';
      case 'simulations':
        return user._count?.attempts || 0;
      case 'streak':
        return `${user.currentStreak || 0} days`;
    }
  };

  const getTabLabel = (tab: LeaderboardType) => {
    switch (tab) {
      case 'xp':
        return 'Experience';
      case 'points':
        return 'Points';
      case 'simulations':
        return 'Completions';
      case 'streak':
        return 'Streaks';
    }
  };

  const getTabIcon = (tab: LeaderboardType) => {
    switch (tab) {
      case 'xp':
        return <Star className="w-5 h-5" />;
      case 'points':
        return <Trophy className="w-5 h-5" />;
      case 'simulations':
        return <Target className="w-5 h-5" />;
      case 'streak':
        return <Flame className="w-5 h-5" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
          <Award className="w-6 h-6 text-white" />
        </div>
      );
    } else {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-gray-600">#{rank}</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-300" />
            <h1 className="text-5xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-xl text-blue-100">
            Compete with career explorers worldwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your Rank Card */}
        {currentUser && userRanks && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-blue-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              Your Ranking
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  #{userRanks.xp || '-'}
                </div>
                <div className="text-sm text-gray-600">Experience</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentUser.xp?.toLocaleString()} XP
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  #{userRanks.points || '-'}
                </div>
                <div className="text-sm text-gray-600">Points</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentUser.totalPoints?.toLocaleString()} pts
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  #{userRanks.simulations || '-'}
                </div>
                <div className="text-sm text-gray-600">Completions</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentUser._count?.attempts || 0} done
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  #{userRanks.streak || '-'}
                </div>
                <div className="text-sm text-gray-600">Streak</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentUser.currentStreak} days
                </div>
              </div>
            </div>

            <Link
              href="/profile"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View your profile →
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {(['xp', 'points', 'simulations', 'streak'] as LeaderboardType[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold transition border-b-4 ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {getTabIcon(tab)}
                    <span className="hidden md:inline">{getTabLabel(tab)}</span>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          {/* Top 3 Podium - responsive layout */}
          {currentLeaderboard.length >= 3 && (
            <div className="p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8">
                {/* 2nd Place */}
                <div className="flex-1 max-w-[150px] sm:max-w-xs">
                  <div className="text-center mb-2 sm:mb-4">
                    <div className="inline-block mb-1 sm:mb-3">
                      {currentLeaderboard[1].avatar ? (
                        <AvatarDisplay
                          avatar={currentLeaderboard[1].avatar}
                          size="medium"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">2</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 truncate text-xs sm:text-base">
                      {currentLeaderboard[1].name || 'Anonymous'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                      Level {currentLeaderboard[1].level}
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-blue-600 mt-1 sm:mt-2">
                      {getValueForTab(currentLeaderboard[1], activeTab)}
                    </p>
                  </div>
                  <div className="h-20 sm:h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center">
                    <Medal className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>

                {/* 1st Place (Taller) */}
                <div className="flex-1 max-w-[180px] sm:max-w-xs -mt-4 sm:-mt-8">
                  <div className="text-center mb-2 sm:mb-4">
                    <div className="inline-block mb-1 sm:mb-3">
                      {currentLeaderboard[0].avatar ? (
                        <AvatarDisplay
                          avatar={currentLeaderboard[0].avatar}
                          size="large"
                          animated
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-200 rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Crown className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500" />
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg sm:text-xl">1</span>
                      </div>
                      <Crown className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-lg truncate">
                      {currentLeaderboard[0].name || 'Anonymous'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                      Level {currentLeaderboard[0].level}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600 mt-1 sm:mt-2">
                      {getValueForTab(currentLeaderboard[0], activeTab)}
                    </p>
                  </div>
                  <div className="h-32 sm:h-48 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-lg flex items-center justify-center">
                    <Trophy className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex-1 max-w-[150px] sm:max-w-xs">
                  <div className="text-center mb-2 sm:mb-4">
                    <div className="inline-block mb-1 sm:mb-3">
                      {currentLeaderboard[2].avatar ? (
                        <AvatarDisplay
                          avatar={currentLeaderboard[2].avatar}
                          size="medium"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">3</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 truncate text-xs sm:text-base">
                      {currentLeaderboard[2].name || 'Anonymous'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                      Level {currentLeaderboard[2].level}
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-orange-600 mt-1 sm:mt-2">
                      {getValueForTab(currentLeaderboard[2], activeTab)}
                    </p>
                  </div>
                  <div className="h-16 sm:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-lg flex items-center justify-center">
                    <Award className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of Leaderboard */}
          <div className="divide-y">
            {currentLeaderboard.slice(3).map((user, index) => {
              const rank = index + 4;
              const isCurrentUser = user.id === userId;

              return (
                <div
                  key={user.id}
                  className={`p-4 hover:bg-gray-50 transition ${
                    isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankBadge(rank)}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {user.avatar ? (
                        <AvatarDisplay avatar={user.avatar} size="small" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.name || 'Anonymous'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs px-2 py-1 bg-blue-600 text-white rounded">
                            YOU
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Level {user.level}
                      </p>
                    </div>

                    {/* Value */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {getValueForTab(user, activeTab)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {currentLeaderboard.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No users found on this leaderboard yet.</p>
              <p className="text-sm mt-2">Be the first to climb the ranks!</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Want to climb the leaderboard? Complete more simulations and earn XP!
          </p>
          <Link
            href="/simulations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Target className="w-5 h-5" />
            Start Simulating
          </Link>
        </div>
      </div>
    </div>
  );
}
