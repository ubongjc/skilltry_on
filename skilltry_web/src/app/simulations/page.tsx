import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Filter, Clock, TrendingUp } from 'lucide-react';

interface SearchParams {
  sector?: string;
  difficulty?: string;
  search?: string;
}

export default async function SimulationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { sector, difficulty, search } = params;

  // Build where clause for filtering
  const where: any = {
    isPublished: true,
  };

  if (sector) where.sector = sector;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [simulations, sectors] = await Promise.all([
    prisma.simulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        sector: true,
        difficulty: true,
        estimatedDuration: true,
        thumbnailUrl: true,
        _count: {
          select: { attempts: true },
        },
      },
    }),
    prisma.simulation.groupBy({
      by: ['sector'],
      where: { isPublished: true },
    }),
  ]);

  const uniqueSectors = sectors.map(s => s.sector);
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Job Simulations
          </h1>
          <p className="text-gray-600">
            Practice real workplace scenarios and improve your skills
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form action="/simulations" method="get" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search simulations..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  name="sector"
                  defaultValue={sector || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sectors</option>
                  {uniqueSectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  defaultValue={difficulty || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Apply Filters Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </form>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold">{simulations.length}</span>{' '}
            simulation{simulations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Simulations Grid */}
        {simulations.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No simulations found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <Link
              href="/simulations"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((simulation) => (
              <SimulationCard key={simulation.id} simulation={simulation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SimulationCard({
  simulation,
}: {
  simulation: {
    id: string;
    title: string;
    description: string | null;
    sector: string;
    difficulty: string;
    estimatedDuration: number;
    thumbnailUrl: string | null;
    _count: { attempts: number };
  };
}) {
  const difficultyColors = {
    EASY: 'bg-green-100 text-green-700 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    HARD: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Link
      href={`/simulations/${simulation.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {simulation.thumbnailUrl && (
          <img
            src={simulation.thumbnailUrl}
            alt={simulation.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-900 rounded-full">
            {simulation.sector}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
          {simulation.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {simulation.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {simulation.estimatedDuration} min
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {simulation._count.attempts} attempts
            </span>
          </div>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              difficultyColors[simulation.difficulty as keyof typeof difficultyColors]
            }`}
          >
            {simulation.difficulty}
          </span>
        </div>

        {/* Start Button */}
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          Start Simulation
        </button>
      </div>
    </Link>
  );
}
