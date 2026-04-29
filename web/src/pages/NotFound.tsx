import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const NotFoundPage = (): JSX.Element => (
  <div className="mx-auto max-w-xl px-5 py-24 text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="font-display text-7xl font-bold text-gradient">404</div>
      <h1 className="mt-3 font-display text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink-300">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back home
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
