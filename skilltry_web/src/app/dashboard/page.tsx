import { redirect } from 'next/navigation';
import { requireAuth, getUserStats } from '@/lib/auth';
import { getUserSubscription, getUsageStats } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, BookOpen, TrendingUp, Award, Clock, BarChart3 } from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireAuth().catch(() => null);

  if (!user) {
    redirect('/sign-in');
  }

  const [stats, subscription, usage, recentAttempts, availableSimulations] = await Promise.all([
    getUserStats(user.id),
    getUserSubscription(user.id),
    getUsageStats(user.id),
    prisma.attempt.findMany({
      where: { userId: user.id },
      include: { simulation: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.simulation.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name || 'there'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to practice your skills today?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="text-gray-600">Plan</p>
                <p className="font-semibold">{subscription.plan}</p>
              </div>
              <Link
                href="/settings/subscription"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Manage Plan
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Total Attempts"
            value={stats.totalAttempts}
            color="blue"
          />
          <StatsCard
            icon={<Award className="w-6 h-6" />}
            label="Completed"
            value={stats.completedAttempts}
            color="green"
          />
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Average Score"
            value={`${stats.averageScore.toFixed(1)}%`}
            color="purple"
          />
          <StatsCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Completion Rate"
            value={`${stats.completionRate.toFixed(0)}%`}
            color="orange"
          />
        </div>

        {/* Usage Section */}
        {subscription.plan !== 'FREE' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Usage This Period</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Simulations</span>
                  <span className="text-sm font-medium">
                    {usage.attemptsUsed} / {usage.attemptsLimit === Infinity ? '∞' : usage.attemptsLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: usage.attemptsLimit === Infinity
                        ? '100%'
                        : `${Math.min((usage.attemptsUsed / usage.attemptsLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              {usage.periodEnd && (
                <div className="text-sm text-gray-600">
                  Resets {new Date(usage.periodEnd).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Link
                href="/dashboard/history"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y">
            {recentAttempts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No attempts yet. Start your first simulation below!</p>
              </div>
            ) : (
              recentAttempts.map((attempt) => (
                <div key={attempt.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {attempt.simulation.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {attempt.simulation.sector} • {attempt.simulation.difficulty}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </span>
                        {attempt.status === 'COMPLETED' && (
                          <span className="text-sm font-medium text-green-600">
                            Score: {attempt.overallScore.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/attempts/${attempt.id}`}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Simulations */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Available Simulations</h2>
            <Link
              href="/simulations"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Browse All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSimulations.map((simulation) => (
              <div
                key={simulation.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {simulation.thumbnailUrl && (
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600" />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {simulation.title}
                    </h3>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded
                      ${simulation.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : ''}
                      ${simulation.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${simulation.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {simulation.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {simulation.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {simulation.estimatedDuration} min
                    </span>
                    <Link
                      href={`/simulations/${simulation.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Start
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({
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
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
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
