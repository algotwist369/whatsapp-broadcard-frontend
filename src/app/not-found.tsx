import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
            <span className="text-4xl font-bold text-red-600">404</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Page not found
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="btn btn-primary w-full btn-lg flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go back home
          </Link>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Or go to login page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
