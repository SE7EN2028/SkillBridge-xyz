import clsx from 'clsx';

export const Skeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}): JSX.Element => <div className={clsx('skeleton', className)} style={style} />;

export const CardSkeleton = (): JSX.Element => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);
