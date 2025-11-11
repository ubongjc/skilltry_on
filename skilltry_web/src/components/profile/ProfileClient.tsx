'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Star,
  Flame,
  Target,
  TrendingUp,
  Edit,
  Award,
  Clock,
  Calendar,
  Zap,
} from 'lucide-react';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';

interface ProfileClientProps {
  user: any;
  avatar: any;
  stats: any;
  achievements: any[];
  recentAttempts: any[];
}

export default function ProfileClient({
  user,
  avatar,
  stats,
  achievements,
  recentAttempts,
}: ProfileClientProps) {
  const router = useRouter();
  const [editingAvatar, setEditingAvatar] = useState(!avatar);
  const [saving, setSaving] = useState(false);

  const handleSaveAvatar = async (avatarData: any) => {
    setSaving(true);

    try {
      const response = await fetch('/api/avatar', {
        method: avatar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avatarData),
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar');
      }

      setEditingAvatar(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving avatar:', error);
      alert('Failed to save avatar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (editingAvatar) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {avatar ? 'Edit Your Avatar' : 'Create Your Avatar'}
            </h1>
            <p className="text-gray-600">
              Customize your avatar to represent yourself in simulations
            </p>
          </div>

          <AvatarCustomizer
            initialAvatar={avatar}
            onSave={handleSaveAvatar}
            saving={saving}
          />

          {avatar && (
            <button
              onClick={() => setEditingAvatar(false)}
              className="mt-6 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="bg-white rounded-full p-2">
                {avatar ? (
                  <AvatarDisplay avatar={avatar} size="large" animated />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                    <Edit className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditingAvatar(true)}
                className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                {avatar?.displayName || user.name || 'Career Explorer'}
              </h1>
              {avatar?.jobTitle && (
                <p className="text-xl text-blue-100 mb-4">{avatar.jobTitle}</p>
              )}

              {/* Level Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <Star className="w-6 h-6 text-yellow-300" />
                <span className="text-2xl font-bold">Level {stats.level}</span>
              </div>

              {/* XP Progress */}
              <div className="max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span>XP: {stats.xpProgress?.xpInCurrentLevel ?? 0}</span>
                  <span>{stats.xpProgress?.xpNeededForNextLevel ?? 0}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stats.xpProgress?.progress ?? 0}%` }}
                  />
                </div>
                <p className="text-sm text-blue-100 mt-2">
                  {Math.floor(stats.xpProgress?.progress ?? 0)}% to Level{' '}
                  {(stats.xpProgress?.currentLevel ?? 0) + 1}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center px-6 py-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                </div>
                <p className="text-3xl font-bold">{stats.totalPoints.toLocaleString()}</p>
                <p className="text-sm text-blue-100">Points</p>
              </div>

              <div className="text-center px-6 py-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-3xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-blue-100">Day Streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Simulations Completed"
            value={stats.completedAttempts}
            color="blue"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Achievements Unlocked"
            value={stats.achievementsUnlocked}
            color="purple"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Completion Rate"
            value={`${Math.round(stats.completionRate)}%`}
            color="green"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            label="Longest Streak"
            value={`${stats.longestStreak} days`}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Achievements */}
            {achievements.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Recent Achievements
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {achievements.slice(0, 5).map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl">
                          {userAchievement.achievement.icon || '🏆'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {userAchievement.achievement.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {userAchievement.achievement.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-blue-600">
                            <Zap className="w-4 h-4" />
                            +{userAchievement.achievement.xpReward} XP
                          </span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Trophy className="w-4 h-4" />
                            +{userAchievement.achievement.pointsReward} pts
                          </span>
                          <span className="text-gray-500">
                            {userAchievement.completedAt
                              ? new Date(userAchievement.completedAt).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentAttempts.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-500" />
                    Recent Simulations
                  </h2>
                </div>
                <div className="divide-y">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-6 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => router.push(`/attempts/${attempt.id}/results`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {attempt.simulation.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            (attempt.score || 0) >= 80
                              ? 'bg-green-100 text-green-700'
                              : (attempt.score || 0) >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {attempt.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{attempt.simulation.sector}</span>
                        <span>•</span>
                        <span>{attempt.simulation.difficulty}</span>
                        <span>•</span>
                        <span>
                          {attempt.completedAt
                            ? new Date(attempt.completedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        {attempt.xpEarned > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 font-medium">
                              +{attempt.xpEarned} XP
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Member Since */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Member Since</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Next Milestone */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Next Milestone
              </h3>
              <p className="text-3xl font-bold mb-2">Level {stats.level + 1}</p>
              <p className="text-blue-100">
                Complete {Math.ceil(stats.xpProgress.xpNeededForNextLevel - stats.xpProgress.xpInCurrentLevel)} more XP worth of simulations
              </p>
            </div>

            {/* Call to Action */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Continue Your Journey
              </h3>
              <button
                onClick={() => router.push('/simulations')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Explore Simulations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-lg ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}
