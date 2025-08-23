import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md w-full space-y-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-gray-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Page not found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => window.history.back()}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              ← Go back to previous page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};