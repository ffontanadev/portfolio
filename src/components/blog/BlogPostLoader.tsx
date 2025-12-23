import { cn } from '../../lib/utils';

interface BlogPostLoaderProps {
  className?: string;
}

export default function BlogPostLoader({ className }: BlogPostLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading blog post"
      className={cn('max-w-4xl mx-auto px-6 py-20', className)}
    >
      <div className="animate-pulse">
        {/* Back to Blog link skeleton */}
        <div className="h-5 bg-cream-200 rounded w-28 mb-8" />

        <header className="mb-12">
          {/* Featured image skeleton */}
          <div className="w-full h-96 bg-cream-200 rounded-lg mb-8" />

          {/* Title skeleton */}
          <div className="h-12 bg-cream-200 rounded w-3/4 mb-6" />

          {/* Metadata row skeleton */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Date */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-cream-200 rounded" />
              <div className="h-4 bg-cream-200 rounded w-28" />
            </div>
            {/* Reading time */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-cream-200 rounded" />
              <div className="h-4 bg-cream-200 rounded w-20" />
            </div>
            {/* Author */}
            <div className="h-4 bg-cream-200 rounded w-32" />
          </div>

          {/* Tags skeleton */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-5 h-5 bg-cream-200 rounded" />
            <div className="h-6 bg-cream-200 rounded-full w-16 px-3 py-1" />
            <div className="h-6 bg-cream-200 rounded-full w-20 px-3 py-1" />
            <div className="h-6 bg-cream-200 rounded-full w-24 px-3 py-1" />
          </div>
        </header>

        {/* Content skeleton */}
        <div className="space-y-4 mb-12">
          <div className="h-4 bg-cream-200 rounded w-full" />
          <div className="h-4 bg-cream-200 rounded w-full" />
          <div className="h-4 bg-cream-200 rounded w-11/12" />
          <div className="h-4 bg-cream-200 rounded w-full" />
          <div className="h-4 bg-cream-200 rounded w-full" />
          <div className="h-4 bg-cream-200 rounded w-10/12" />
          <div className="h-6 bg-cream-200 rounded w-full mt-6" />
          <div className="h-4 bg-cream-200 rounded w-full" />
          <div className="h-4 bg-cream-200 rounded w-full" />
          <div className="h-4 bg-cream-200 rounded w-9/12" />
        </div>

        {/* Footer skeleton */}
        <div className="border-t border-cream-200 pt-8">
          <div className="h-5 bg-cream-200 rounded w-32" />
        </div>
      </div>

      <span className="sr-only">Loading blog post</span>
    </div>
  );
}
