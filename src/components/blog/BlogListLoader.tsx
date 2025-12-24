import { cn } from '../../lib/utils';

interface BlogListLoaderProps {
  count?: number;
  className?: string;
}

export default function BlogListLoader({ count = 2, className }: BlogListLoaderProps) {
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
          {/* Image skeleton */}
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-6" />

          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />

          {/* Metadata skeleton */}


          {/* Excerpt skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>

          {/* Tags skeleton */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-4" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>

          {/* Read more skeleton */}
          <div className="h-5 bg-gray-200 rounded w-24" />
        </article>
      ))}
      <span className="sr-only">Loading blog posts</span>
    </div>
  );
}
