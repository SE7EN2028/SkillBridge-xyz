import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { HttpError } from '@/lib/api';

export const LoginPage = (): JSX.Element => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof HttpError ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16">
      <Link to="/" className="mb-8"><Logo /></Link>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card w-full"
      >
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-300">Log in to continue.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            name="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" icon={<LogIn className="h-4 w-4" />}>
            Log in
          </Button>
        </form>
        <div className="mt-6 text-sm text-ink-300 text-center">
          New here?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
