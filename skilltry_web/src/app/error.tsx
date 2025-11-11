'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry or other error tracking service
    console.error('Global error:', error);

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          errorBoundary: 'global',
        },
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Something went wrong
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 text-center mb-6">
          We're sorry for the inconvenience. An unexpected error occurred while
          loading this page.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-sm font-semibold text-red-900 mb-2">
              Error Details (Development Mode)
            </h2>
            <pre className="text-xs text-red-800 overflow-x-auto whitespace-pre-wrap">
              {error.message}
              {error.digest && `\nError Digest: ${error.digest}`}
            </pre>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-900 cursor-pointer hover:text-red-700">
                  Stack Trace
                </summary>
                <pre className="text-xs text-red-800 mt-2 overflow-x-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Error ID for Support */}
        {error.digest && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Error ID:{' '}
              <code className="font-mono text-gray-900">{error.digest}</code>
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Please include this ID when contacting support
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Support Message */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            If this problem persists, please{' '}
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              contact support
            </a>
            .
          </p>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Quick troubleshooting tips:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Refresh the page and try again</li>
            <li>• Clear your browser cache and cookies</li>
            <li>• Try using a different browser</li>
            <li>• Check your internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
