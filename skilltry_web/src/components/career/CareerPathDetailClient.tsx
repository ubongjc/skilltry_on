'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  Play,
  Lock,
  Star,
  Award,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Users,
  DollarSign,
} from 'lucide-react';
import SimulationBackground from '@/components/simulation/SimulationBackground';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';

interface Simulation {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  sector: string;
  tags: any;
  _count: {
    attempts: number;
  };
}

interface UserAttempt {
  id: string;
  simulationId: string;
  status: string;
  score: number | null;
  completedAt: Date | null;
}

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
  dayInLife: any;
  careerOutlook: any;
  simulations: Simulation[];
}

interface CareerPathDetailClientProps {
  careerPath: CareerPath;
  userAttempts: UserAttempt[];
  avatar: any;
  isAuthenticated: boolean;
}

export default function CareerPathDetailClient({
  careerPath,
  userAttempts,
  avatar,
  isAuthenticated,
}: CareerPathDetailClientProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'dayinlife' | 'simulations' | 'skills'
  >('overview');

  // Calculate progress
  const completedSimulations = userAttempts.filter(
    (a) => a.status === 'COMPLETED'
  ).length;
  const progressPercent = careerPath.simulations.length
    ? Math.round(
        (completedSimulations / careerPath.simulations.length) * 100
      )
    : 0;

  // Get attempt status for each simulation
  const getSimulationStatus = (simulationId: string) => {
    return userAttempts.find((a) => a.simulationId === simulationId);
  };

  const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-700',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
    ADVANCED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Avatar */}
      <div className="relative bg-gradient-to-br text-white overflow-hidden" style={{ background: careerPath.color || '#3b82f6' }}>
        <SimulationBackground sector={careerPath.sector} animated={true} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-start gap-2 mb-8">
            <Link
              href="/career-paths"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Career Paths</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Display */}
            {avatar ? (
              <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                  <AvatarDisplay avatar={avatar} size="large" animated />
                </div>
                <p className="text-center mt-3 text-sm text-blue-100">
                  You in this career
                </p>
              </div>
            ) : (
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-8xl">
                  {careerPath.icon || '💼'}
                </div>
              </div>
            )}

            {/* Career Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <span className="text-sm font-medium">{careerPath.sector}</span>
              </div>

              <h1 className="text-5xl font-bold mb-4">{careerPath.title}</h1>
              <p className="text-xl text-blue-100 mb-6 max-w-3xl">
                {careerPath.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>{careerPath.simulations.length} Simulations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{careerPath.estimatedTimeHours} hours total</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span
                    className={`px-2 py-0.5 rounded ${
                      difficultyColors[
                        careerPath.difficulty as keyof typeof difficultyColors
                      ]
                    }`}
                  >
                    {careerPath.difficulty}
                  </span>
                </div>
              </div>

              {/* Progress (if authenticated) */}
              {isAuthenticated && completedSimulations > 0 && (
                <div className="mt-6 max-w-md">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Your Progress</span>
                    <span className="font-bold">
                      {completedSimulations} / {careerPath.simulations.length} completed
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: Briefcase },
              { key: 'dayinlife', label: 'A Day in the Life', icon: Clock },
              { key: 'simulations', label: 'Simulations', icon: Target },
              { key: 'skills', label: 'Skills & Benefits', icon: Award },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Career Outlook */}
            {careerPath.careerOutlook && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Career Outlook
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {careerPath.careerOutlook.growth && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Job Growth</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {careerPath.careerOutlook.growth}
                      </p>
                    </div>
                  )}
                  {careerPath.careerOutlook.salary && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Average Salary
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {careerPath.careerOutlook.salary}
                      </p>
                    </div>
                  )}
                  {careerPath.careerOutlook.demand && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Demand</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {careerPath.careerOutlook.demand}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Career
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {careerPath.description}
              </p>
            </div>
          </div>
        )}

        {/* Day in the Life Tab */}
        {activeTab === 'dayinlife' && (
          <div className="space-y-8">
            {careerPath.dayInLife && careerPath.dayInLife.schedule ? (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    A Day in the Life
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Experience what a typical day looks like in this career. See
                    the challenges, rewards, and day-to-day responsibilities.
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {careerPath.dayInLife.schedule.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow p-6 flex gap-6"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-blue-600">
                              {item.time}
                            </span>
                            <span className="text-lg font-semibold text-gray-900">
                              {item.activity}
                            </span>
                          </div>
                          <p className="text-gray-700">{item.description}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Day in the life content coming soon for this career path.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Simulations Tab */}
        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Master This Career Path
              </h2>
              <p className="text-gray-700">
                Complete all {careerPath.simulations.length} simulations to gain
                comprehensive experience in {careerPath.title}.
              </p>
            </div>

            {careerPath.simulations.map((simulation, index) => {
              const attempt = getSimulationStatus(simulation.id);
              const isCompleted = attempt?.status === 'COMPLETED';

              return (
                <div
                  key={simulation.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Number Badge */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {simulation.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {simulation.description}
                            </p>
                          </div>
                          {isCompleted && attempt.score !== null && (
                            <div className="flex-shrink-0 text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {attempt.score}%
                              </div>
                              <div className="text-xs text-gray-600">Score</div>
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{simulation.estimatedDuration} min</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              difficultyColors[
                                simulation.difficulty as keyof typeof difficultyColors
                              ]
                            }`}
                          >
                            {simulation.difficulty}
                          </span>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{simulation._count.attempts} completed</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center gap-3">
                          {isAuthenticated ? (
                            <Link
                              href={`/simulations/${simulation.id}/play`}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                              <Play className="w-4 h-4" />
                              {isCompleted ? 'Try Again' : 'Start Simulation'}
                            </Link>
                          ) : (
                            <Link
                              href="/sign-in"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                            >
                              <Lock className="w-4 h-4" />
                              Sign In to Start
                            </Link>
                          )}
                          <Link
                            href={`/simulations/${simulation.id}`}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Skills & Benefits Tab */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills */}
            {careerPath.skills && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  Skills You'll Develop
                </h2>
                <div className="space-y-3">
                  {(Array.isArray(careerPath.skills) ? careerPath.skills : []).map(
                    (skill: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900">{skill}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            {careerPath.benefits && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-500" />
                  Career Benefits
                </h2>
                <div className="space-y-3">
                  {(Array.isArray(careerPath.benefits)
                    ? careerPath.benefits
                    : []
                  ).map((benefit: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
                    >
                      <Star className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-900">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
