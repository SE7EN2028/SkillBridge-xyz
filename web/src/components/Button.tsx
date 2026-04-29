import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled' | 'name' | 'value'> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger:
    'btn bg-red-500/90 hover:bg-red-500 text-white shadow-[0_0_40px_-10px_rgba(239,68,68,0.6)]',
};

export const Button = ({
  variant = 'primary',
  loading,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps): JSX.Element => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    whileHover={{ y: -1 }}
    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    className={clsx(variantClass[variant], className)}
    disabled={disabled ?? loading}
    {...rest}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
    {children}
  </motion.button>
);
