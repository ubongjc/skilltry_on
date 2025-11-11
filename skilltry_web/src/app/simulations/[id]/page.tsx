import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, BarChart, BookOpen, Play } from 'lucide-react';
import { canCreateAttempt } from '@/lib/stripe';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SimulationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const simulation = await prisma.simulation.findUnique({
    where: { id, isPublished: true },
    include: {
      _count: {
        select: { attempts: true },
      },
    },
  });

  if (!simulation) {
    notFound();
  }

  // Check if user is authenticated
  const user = await requireAuth().catch(() => null);

  // Check if user can create more attempts (subscription limits)
  let canStart = true;
  let limitMessage = '';

  if (user) {
    canStart = await canCreateAttempt(user.id);
    if (!canStart) {
      limitMessage = 'You have reached your monthly simulation limit. Upgrade your plan to continue.';
    }
  }

  const steps = simulation.steps as any[];
  const rubric = simulation.rubric as any;
  const resources = simulation.resources as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/simulations"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Simulations
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              {simulation.thumbnailUrl && (
                <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                  <img
                    src={simulation.thumbnailUrl}
                    alt={simulation.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {simulation.sector}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      simulation.difficulty === 'EASY'
                        ? 'bg-green-100 text-green-700'
                        : simulation.difficulty === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {simulation.difficulty}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {simulation.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6">
                  {simulation.description}
                </p>

                {/* Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{simulation.estimatedDuration} min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Steps</p>
                      <p className="font-semibold">{steps.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Attempts</p>
                      <p className="font-semibold">{simulation._count.attempts}</p>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                {!user ? (
                  <Link
                    href={`/sign-in?redirect=/simulations/${simulation.id}`}
                    className="block w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-semibold text-lg"
                  >
                    Sign In to Start
                  </Link>
                ) : !canStart ? (
                  <div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                      <p className="text-yellow-800">{limitMessage}</p>
                    </div>
                    <Link
                      href="/settings/subscription"
                      className="block w-full px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-center font-semibold text-lg"
                    >
                      Upgrade Plan
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/simulations/${simulation.id}/play`}
                    className="block w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Simulation
                  </Link>
                )}
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What You'll Practice
              </h2>

              <div className="space-y-4">
                {steps.slice(0, 3).map((step: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.content?.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                ))}
                {steps.length > 3 && (
                  <p className="text-gray-600 text-sm ml-12">
                    + {steps.length - 3} more steps
                  </p>
                )}
              </div>
            </div>

            {/* Evaluation Criteria */}
            {rubric.criteria && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  How You'll Be Evaluated
                </h2>

                <div className="space-y-4">
                  {rubric.criteria.map((criterion: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {criterion.name}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {criterion.weight * 100}% weight
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {criterion.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Training Resources */}
            {resources?.trainingLinks && resources.trainingLinks.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommended Training
                </h3>
                <div className="space-y-3">
                  {resources.trainingLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {link.title}
                      </p>
                      <p className="text-xs text-gray-600">{link.provider}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Tips for Success
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Read each scenario carefully before responding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Think about real workplace situations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Consider multiple perspectives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Take your time - quality over speed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
