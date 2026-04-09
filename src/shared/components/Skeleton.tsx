interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`skeleton-shimmer rounded-xl ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[32px] border border-nquoc-border p-6 space-y-4">
      <div className="flex gap-4">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-[32px] border border-nquoc-border overflow-hidden">
      <div className="p-6 border-b border-nquoc-border">
        <Skeleton className="h-6 w-1/3" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
