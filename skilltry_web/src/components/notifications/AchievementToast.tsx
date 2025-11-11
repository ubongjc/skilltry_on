'use client';

import { useEffect, useState } from 'react';
import { Trophy, Star, X, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  xpReward: number;
  pointsReward: number;
  color: string;
}

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  autoCloseDuration?: number;
}

export default function AchievementToast({
  achievement,
  onClose,
  autoCloseDuration = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-1">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl animate-bounce-slow shadow-lg">
                {achievement.icon || '🏆'}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-lg">
                  Achievement Unlocked!
                </h3>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="font-semibold text-gray-800 mb-1">
                {achievement.name}
              </p>

              <p className="text-sm text-gray-600 mb-3">
                {achievement.description}
              </p>

              {/* Rewards */}
              <div className="flex items-center gap-4 text-sm">
                {achievement.xpReward > 0 && (
                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                    <Zap className="w-4 h-4" />
                    <span>+{achievement.xpReward} XP</span>
                  </div>
                )}
                {achievement.pointsReward > 0 && (
                  <div className="flex items-center gap-1 text-yellow-600 font-medium">
                    <Trophy className="w-4 h-4" />
                    <span>+{achievement.pointsReward} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Level Up Notification
export function LevelUpToast({
  newLevel,
  onClose,
  autoCloseDuration = 5000,
}: {
  newLevel: number;
  onClose: () => void;
  autoCloseDuration?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-2xl p-1">
        <div className="bg-white rounded-lg p-6">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse-slow">
                <Star className="w-10 h-10 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Level Up!
            </h3>

            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              Level {newLevel}
            </p>

            <p className="text-gray-600">
              Congratulations! You've reached a new level!
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Notification Container for managing multiple notifications
export function NotificationContainer({
  achievements,
  levelUp,
  onDismissAchievement,
  onDismissLevelUp,
}: {
  achievements: Achievement[];
  levelUp?: { newLevel: number };
  onDismissAchievement: (id: string) => void;
  onDismissLevelUp: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
      {levelUp && (
        <LevelUpToast
          newLevel={levelUp.newLevel}
          onClose={onDismissLevelUp}
        />
      )}

      {achievements.map((achievement, index) => (
        <div
          key={achievement.id}
          style={{
            marginTop: index > 0 ? `${index * 10}px` : '0',
          }}
        >
          <AchievementToast
            achievement={achievement}
            onClose={() => onDismissAchievement(achievement.id)}
          />
        </div>
      ))}
    </div>
  );
}
