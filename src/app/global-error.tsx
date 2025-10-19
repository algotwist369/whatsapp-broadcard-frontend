'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                An unexpected error occurred. Please try again.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="btn btn-primary w-full btn-lg"
              >
                Try again
              </button>

              <Link
                href="/"
                className="btn btn-secondary w-full btn-lg flex items-center justify-center"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
