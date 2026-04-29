import { Star } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  value: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export const Rating = ({ value, size = 16, showValue, reviewCount, className }: Props): JSX.Element => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={clsx('inline-flex items-center gap-1', className)}>
      <div className="flex">
        {stars.map((s) => (
          <Star
            key={s}
            width={size}
            height={size}
            className={clsx(
              s <= Math.round(value) ? 'text-accent-500 fill-accent-500' : 'text-ink-400',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-ink-200">
          {value.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-ink-400"> ({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
};
