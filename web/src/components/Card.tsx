import type { HTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export const Card = ({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }): JSX.Element => (
  <div className={clsx('card p-6', className)} {...rest}>
    {children}
  </div>
);

export const MotionCard = ({
  className,
  children,
  ...rest
}: HTMLMotionProps<'div'> & { children?: ReactNode }): JSX.Element => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    whileHover={{ y: -3, boxShadow: '0 20px 60px -20px rgba(31,147,255,0.35)' }}
    className={clsx('card p-6 cursor-pointer', className)}
    {...rest}
  >
    {children}
  </motion.div>
);
