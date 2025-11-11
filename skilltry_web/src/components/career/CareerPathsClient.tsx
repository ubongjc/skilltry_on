'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';
import SimulationBackground from '@/components/simulation/SimulationBackground';

interface CareerPath {
  id: string;
  title: string;
  description: string;
  sector: string;
  difficulty: string;
  estimatedTimeHours: number;
  icon: string | null;
  color: string | null;
  benefits: any;
  skills: any;
  _count: {
    simulations: number;
  };
}

interface CareerPathsClientProps {
  careerPaths: CareerPath[];
  userProgress: Record<string, number> | null;
  isAuthenticated: boolean;
}

export default function CareerPathsClient({
  careerPaths,
  userProgress,
  isAuthenticated,
}: CareerPathsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Get unique sectors
  const sectors = Array.from(new Set(careerPaths.map((path) => path.sector)));

  // Filter career paths
  const filteredPaths = careerPaths.filter((path) => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || path.sector === selectedSector;
    const matchesDifficulty =
      !selectedDifficulty || path.difficulty === selectedDifficulty;

    return matchesSearch && matchesSector && matchesDifficulty;
  });

  const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-700',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
    ADVANCED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <SimulationBackground sector="Default" animated={true} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">
              Explore Your Career Journey
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover different career paths, experience a day in the life of
              various professions, and find your perfect career match.
            </p>
            <div className="flex items-center gap-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>{careerPaths.length} Career Paths</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>
                  {careerPaths.reduce((sum, p) => sum + p._count.simulations, 0)}{' '}
                  Simulations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search career paths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Sector Filter */}
            <select
              value={selectedSector || ''}
              onChange={(e) =>
                setSelectedSector(e.target.value || null)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty || ''}
              onChange={(e) =>
                setSelectedDifficulty(e.target.value || null)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            {/* Clear Filters */}
            {(selectedSector || selectedDifficulty || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedSector(null);
                  setSelectedDifficulty(null);
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-6">
          Showing {filteredPaths.length} of {careerPaths.length} career paths
        </p>

        {/* Career Paths Grid */}
        {filteredPaths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No career paths found matching your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map((path) => {
              const progress = userProgress?.[path.id] || 0;
              const progressPercent = path._count.simulations
                ? Math.round((progress / path._count.simulations) * 100)
                : 0;

              return (
                <Link
                  key={path.id}
                  href={`/career-paths/${path.id}`}
                  className="group bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Header with Icon */}
                  <div
                    className="h-32 flex items-center justify-center text-6xl relative"
                    style={{
                      background: path.color || '#3b82f6',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                    <span className="relative z-10">{path.icon || '💼'}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title and Sector */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-1">
                        {path.title}
                      </h3>
                      <p className="text-sm text-gray-600">{path.sector}</p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {path.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{path._count.simulations} simulations</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{path.estimatedTimeHours}h</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          difficultyColors[
                            path.difficulty as keyof typeof difficultyColors
                          ]
                        }`}
                      >
                        {path.difficulty}
                      </span>
                    </div>

                    {/* Progress (if authenticated) */}
                    {isAuthenticated && progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Your Progress</span>
                          <span className="font-medium text-blue-600">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                        Explore Career
                      </span>
                      <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
