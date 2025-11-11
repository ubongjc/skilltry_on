import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AttemptResultsPage({ params }: PageProps) {
  const { id } = await params;

  const user = await requireAuth().catch(() => null);
  if (!user) {
    redirect(`/sign-in?redirect=/attempts/${id}/results`);
  }

  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      simulation: {
        select: {
          id: true,
          title: true,
          description: true,
          sector: true,
          difficulty: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  if (attempt.userId !== user.id) {
    redirect('/dashboard');
  }

  // If still evaluating, show loading state
  if (attempt.status === 'EVALUATING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Generating Your Feedback
          </h1>
          <p className="text-gray-600 mb-6">
            Our AI is analyzing your responses and preparing personalized
            feedback...
          </p>
          <p className="text-sm text-gray-500">
            This usually takes 30-60 seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  // If failed, show error
  if (attempt.status === 'FAILED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Evaluation Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an error while generating your feedback. Please try
            again.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Dashboard
            </Link>
            <Link
              href={`/simulations/${attempt.simulation.id}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const criteriaScores = attempt.criteriaScores as any;
  const recommendations = attempt.recommendations as any[];
  const trainingLinks = attempt.trainingLinks as any[];

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div
            className={`bg-gradient-to-r ${getScoreGradient(
              attempt.score || 0
            )} p-8 text-white`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {attempt.simulation.title}
                </h1>
                <p className="text-white/90">
                  Completed on {new Date(attempt.completedAt!).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-8 h-8" />
                  <span className="text-6xl font-bold">{attempt.score}</span>
                </div>
                <p className="text-white/90 text-sm">Overall Score</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            <div className="p-6 text-center">
              <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-600">Time Spent</p>
            </div>

            <div className="p-6 text-center">
              <Target className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {attempt.simulation.difficulty}
              </p>
              <p className="text-sm text-gray-600">Difficulty</p>
            </div>

            <div className="p-6 text-center">
              <TrendingUp className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {attempt.simulation.sector}
              </p>
              <p className="text-sm text-gray-600">Sector</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detailed Feedback */}
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Detailed Feedback
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {attempt.feedback}
                </p>
              </div>
            </div>

            {/* Criteria Scores */}
            {criteriaScores && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Performance Breakdown
                </h2>
                <div className="space-y-6">
                  {Object.entries(criteriaScores).map(([criterion, score]: [string, any]) => (
                    <div key={criterion}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {criterion}
                        </h3>
                        <span
                          className={`text-lg font-bold ${getScoreColor(
                            score
                          )}`}
                        >
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r ${getScoreGradient(
                            score
                          )} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Areas for Improvement
                </h2>
                <ul className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                What's Next?
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/simulations/${attempt.simulation.id}`}
                  className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Link>
                <Link
                  href="/simulations"
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
                >
                  Browse Simulations
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Training Resources */}
            {trainingLinks && trainingLinks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recommended Training
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Based on your performance, we recommend these resources to
                  help you improve:
                </p>
                <div className="space-y-3">
                  {trainingLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow transition group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition">
                            {link.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {link.provider}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Share Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Share Your Achievement
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your score on social media or with potential employers.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `I just scored ${attempt.score}% on "${attempt.simulation.title}" simulation at SkillTry-On!`
                  );
                  alert('Copied to clipboard!');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Copy Share Text
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
