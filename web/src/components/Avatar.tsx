import clsx from 'clsx';

const palette = [
  'from-brand-500 to-brand-300',
  'from-accent-500 to-accent-400',
  'from-emerald-500 to-emerald-300',
  'from-fuchsia-500 to-pink-400',
  'from-violet-500 to-indigo-400',
];

const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

const colorFor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length]!;
};

interface Props {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export const Avatar = ({ name, src, size = 44, className }: Props): JSX.Element => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={clsx('rounded-full object-cover ring-2 ring-white/10', className)}
      />
    );
  }
  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br text-white font-semibold ring-2 ring-white/10',
        colorFor(name),
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-label={name}
    >
      {initials(name) || '?'}
    </div>
  );
};
