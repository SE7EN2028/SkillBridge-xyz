import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const PageTransition = ({ children }: { children: ReactNode }): JSX.Element => {
  const location = useLocation();
  return (
    <motion.main
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="min-h-[calc(100vh-65px)]"
    >
      {children}
    </motion.main>
  );
};

export const Layout = ({ children }: { children: ReactNode }): JSX.Element => (
  <div className="relative flex min-h-screen flex-col">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh opacity-60" />
    <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-40" />
    <Navbar />
    <PageTransition>{children}</PageTransition>
    <Footer />
  </div>
);
