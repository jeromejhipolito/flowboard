import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'card';
}

function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton-shimmer',
        variant === 'text' && 'h-4 w-full rounded-md',
        variant === 'circle' && 'h-10 w-10 rounded-full',
        variant === 'card' && 'h-32 w-full rounded-lg',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
