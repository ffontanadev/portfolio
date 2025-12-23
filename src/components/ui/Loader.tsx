import { cn } from '../../lib/utils';

type LoaderSize = 'sm' | 'md' | 'lg' | 'full';

interface BaseLoaderProps {
  className?: string;
  'aria-label'?: string;
}

interface SpinnerLoaderProps extends BaseLoaderProps {
  variant: 'spinner';
  size?: LoaderSize;
}

interface SkeletonLoaderProps extends BaseLoaderProps {
  variant: 'skeleton';
  lines?: number;
  width?: string;
}

type LoaderProps = SpinnerLoaderProps | SkeletonLoaderProps;

const sizeClasses: Record<LoaderSize, string> = {
  sm: 'w-6 h-6 border-2',
  md: 'w-12 h-12 border-3',
  lg: 'w-16 h-16 border-4',
  full: 'w-12 h-12 border-3',
};

export default function Loader(props: LoaderProps) {
  if (props.variant === 'spinner') {
    const size = props.size || 'md';
    const isFullPage = size === 'full';

    const spinner = (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={props['aria-label'] || 'Loading content'}
        className={cn(
          'inline-block rounded-full border-cream-200 border-t-coral-500 animate-spin',
          sizeClasses[size],
          props.className
        )}
      >
        <span className="sr-only">{props['aria-label'] || 'Loading content'}</span>
      </div>
    );

    if (isFullPage) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          {spinner}
        </div>
      );
    }

    return spinner;
  }

  // Skeleton variant
  const lines = props.lines || 3;
  const width = props.width || 'w-full';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={props['aria-label'] || 'Loading content'}
      className={cn('space-y-3', props.className)}
    >
      {Array.from({ length: lines }).map((_, index) => {
        // Vary the width of the last line for more realistic appearance
        const isLastLine = index === lines - 1;
        const lineWidth = isLastLine ? 'w-5/6' : width;

        return (
          <div
            key={index}
            className={cn(
              'h-4 bg-cream-200 rounded animate-pulse',
              lineWidth
            )}
          />
        );
      })}
      <span className="sr-only">{props['aria-label'] || 'Loading content'}</span>
    </div>
  );
}
