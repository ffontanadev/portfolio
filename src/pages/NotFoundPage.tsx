import { Link, useLocation } from 'react-router-dom';
import { SearchX, Home, BookOpen, ArrowUp } from 'lucide-react';

export default function NotFoundPage() {
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <>
        <title>404 - Page Not Found</title>
        <meta name="robots" content="noindex, nofollow" />
      </>

      <main className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <SearchX
              className="w-24 h-24 text-coral-500"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>

          {/* 404 Text */}
          <h1 className="text-9xl font-bold text-dark-900 mb-4">404</h1>

          {/* Message */}
          <h2 className="text-3xl font-bold text-dark-900 mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-dark-600 mb-2">
            We couldn't find the page you're looking for.
          </p>

          {/* Current path display */}
          <p className="text-sm text-dark-500 mb-8 font-mono bg-cream-100 px-4 py-2 rounded inline-block">
            {location.pathname}
          </p>

          {/* Helpful description */}
          <p className="text-dark-600 mb-12 max-w-md mx-auto">
            The page may have been moved, deleted, or the URL might be incorrect.
            Try navigating back to a familiar section of the site.
          </p>

          {/* Navigation options */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 text-white font-medium rounded-lg hover:bg-coral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cream-100 text-dark-900 font-medium rounded-lg hover:bg-cream-200 transition-colors focus:outline-none focus:ring-2 focus:ring-dark-900 focus:ring-offset-2"
            >
              <BookOpen className="w-5 h-5" />
              View Blog
            </Link>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cream-100 text-dark-900 font-medium rounded-lg hover:bg-cream-200 transition-colors focus:outline-none focus:ring-2 focus:ring-dark-900 focus:ring-offset-2"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
              Back to Top
            </button>
          </div>

          {/* Additional help */}
          <p className="text-sm text-dark-500 mt-12">
            Need help? Check the{' '}
            <Link
              to="/"
              className="text-coral-500 hover:text-coral-600 underline focus:outline-none focus:ring-2 focus:ring-coral-500 rounded"
            >
              homepage
            </Link>
            {' '}for navigation options.
          </p>
        </div>
      </main>
    </>
  );
}
