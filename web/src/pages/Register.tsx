import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Hammer, UserPlus, Briefcase } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { HttpError } from '@/lib/api';
import clsx from 'clsx';

type Role = 'WORKER' | 'EMPLOYER';

export const RegisterPage = (): JSX.Element => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('WORKER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password, role });
      toast.success('Account created');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Registration failed');
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
        <h1 className="font-display text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-ink-300">Pick how you'll use SkillBridge.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(['WORKER', 'EMPLOYER'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={clsx(
                'rounded-xl border px-4 py-3 text-left transition-all',
                role === r
                  ? 'border-brand-400 bg-brand-500/10'
                  : 'border-white/10 hover:border-white/20',
              )}
            >
              <div className="flex items-center gap-2">
                {r === 'WORKER' ? (
                  <Hammer className="h-4 w-4 text-brand-300" />
                ) : (
                  <Briefcase className="h-4 w-4 text-accent-500" />
                )}
                <span className="font-medium text-sm">
                  {r === 'WORKER' ? 'Worker' : 'Employer'}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {r === 'WORKER' ? 'Get hired for your skills' : 'Hire verified workers'}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            name="name"
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            required
          />
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
            autoComplete="new-password"
            minLength={8}
            hint="At least 8 characters"
            required
          />
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" icon={<UserPlus className="h-4 w-4" />}>
            Create account
          </Button>
        </form>

        <div className="mt-6 text-sm text-ink-300 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
