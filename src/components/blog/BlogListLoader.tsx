import { cn } from '../../lib/utils';

interface BlogListLoaderProps {
  count?: number;
  className?: string;
}

export default function BlogListLoader({ count = 3, className }: BlogListLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading blog posts"
      className={cn('space-y-12', className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="border-b border-cream-200 pb-8 last:border-0 animate-pulse"
        >
          {/* Featured image skeleton */}
          <div className="w-full h-64 bg-cream-200 rounded-lg mb-6" />

          {/* Title skeleton */}
          <div className="h-8 bg-cream-200 rounded w-3/4 mb-3" />

          {/* Metadata row skeleton */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Date */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-cream-200 rounded" />
              <div className="h-3 bg-cream-200 rounded w-24" />
            </div>
            {/* Reading time */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-cream-200 rounded" />
              <div className="h-3 bg-cream-200 rounded w-16" />
            </div>
            {/* Author */}
            <div className="h-3 bg-cream-200 rounded w-20" />
          </div>

          {/* Excerpt skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-cream-200 rounded w-full" />
            <div className="h-4 bg-cream-200 rounded w-full" />
            <div className="h-4 bg-cream-200 rounded w-5/6" />
          </div>

          {/* Tags skeleton */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-cream-200 rounded" />
            <div className="h-5 bg-cream-200 rounded-full w-14 px-3 py-1" />
            <div className="h-5 bg-cream-200 rounded-full w-16 px-3 py-1" />
          </div>

          {/* Read more link skeleton */}
          <div className="h-5 bg-cream-200 rounded w-24" />
        </article>
      ))}

      <span className="sr-only">Loading blog posts</span>
    </div>
  );
}
