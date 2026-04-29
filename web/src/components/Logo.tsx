import { motion } from 'framer-motion';

interface Props {
  size?: number;
  withWordmark?: boolean;
}

export const Logo = ({ size = 36, withWordmark = true }: Props): JSX.Element => (
  <div className="inline-flex items-center gap-2.5">
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      initial={{ rotate: -8, scale: 0.9, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#48b6ff" />
          <stop offset="1" stopColor="#ff9f1c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#0b0e1c" stroke="rgba(255,255,255,0.08)" />
      <motion.path
        d="M14 40c8-18 28-18 36 0"
        stroke="url(#lg)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <circle cx="14" cy="40" r="4" fill="#1f93ff" />
      <circle cx="50" cy="40" r="4" fill="#ff9f1c" />
    </motion.svg>
    {withWordmark && (
      <span className="font-display text-lg font-bold tracking-tight">
        Skill<span className="text-gradient">Bridge</span>
      </span>
    )}
  </div>
);
