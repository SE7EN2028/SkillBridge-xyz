import clsx from 'clsx';
import type { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warn' | 'info' | 'danger';

const variants: Record<Variant, string> = {
  default: 'bg-white/5 text-ink-100 border-white/10',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  warn: 'bg-amber-500/10 text-amber-300 border-amber-400/20',
  info: 'bg-brand-500/10 text-brand-300 border-brand-400/20',
  danger: 'bg-red-500/10 text-red-300 border-red-400/20',
};

interface Props {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: Props): JSX.Element => (
  <span
    className={clsx(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
      variants[variant],
      className,
    )}
  >
    {children}
  </span>
);
