import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Search className="w-64 h-64 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Suggestions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Here are some helpful links instead:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <Home className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-blue-600">
                Home
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Back to homepage
              </p>
            </Link>

            <Link
              href="/simulations"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <Search className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-blue-600">
                Simulations
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Browse all simulations
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <ArrowLeft className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-blue-600">
                Dashboard
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Go to your dashboard
              </p>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            href="/"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-sm text-gray-600">
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
