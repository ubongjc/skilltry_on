import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, BookOpen, TrendingUp, DollarSign, Plus, Settings } from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await requireAdmin().catch(() => null);

  if (!user) {
    redirect('/sign-in?redirect=/admin');
  }

  const [
    totalUsers,
    totalSimulations,
    totalAttempts,
    activeSubscriptions,
    recentUsers,
    recentSimulations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.simulation.count(),
    prisma.attempt.count(),
    prisma.subscription.count({
      where: { status: 'active' },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
    }),
    prisma.simulation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        sector: true,
        difficulty: true,
        isPublished: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Platform management and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                User View
              </Link>
              <Link
                href="/admin/settings"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            icon={<Users className="w-6 h-6" />}
            label="Total Users"
            value={totalUsers}
            color="blue"
            href="/admin/users"
          />
          <AdminStatsCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Simulations"
            value={totalSimulations}
            color="purple"
            href="/admin/simulations"
          />
          <AdminStatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Total Attempts"
            value={totalAttempts}
            color="green"
            href="/admin/analytics"
          />
          <AdminStatsCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Active Subscriptions"
            value={activeSubscriptions}
            color="orange"
            href="/admin/subscriptions"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/simulations/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create Simulation</h3>
                <p className="text-sm text-gray-600">Add new job scenario</p>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and edit users</p>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Platform metrics</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Users</h2>
                <Link
                  href="/admin/users"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y">
              {recentUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded
                          ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : ''}
                          ${user.role === 'INSTITUTION' ? 'bg-purple-100 text-purple-700' : ''}
                          ${user.role === 'USER' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user._count.attempts} attempts
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Simulations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Simulations</h2>
                <Link
                  href="/admin/simulations"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y">
              {recentSimulations.map((simulation) => (
                <div key={simulation.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {simulation.title}
                      </h3>
                      <p className="text-sm text-gray-600">{simulation.sector}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded
                          ${simulation.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : ''}
                          ${simulation.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${simulation.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {simulation.difficulty}
                        </span>
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded
                          ${simulation.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                        `}>
                          {simulation.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {simulation._count.attempts} attempts
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/simulations/${simulation.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminStatsCard({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  href: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Link href={href} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}
