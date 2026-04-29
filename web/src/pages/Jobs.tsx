import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, IndianRupee, Briefcase, Plus } from 'lucide-react';
import { Input } from '@/components/Input';
import { CardSkeleton } from '@/components/Skeleton';
import { Empty } from '@/components/Empty';
import { Badge } from '@/components/Badge';
import { jobApi } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';
import type { Job, JobStatus } from '@/types/api';

const statusVariant: Record<JobStatus, 'info' | 'warn' | 'success' | 'default'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warn',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const useDebounced = <T,>(value: T, delay = 350): T => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export const JobsPage = (): JSX.Element => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [skill, setSkill] = useState(params.get('skill') ?? '');
  const [city, setCity] = useState(params.get('city') ?? '');

  const dSkill = useDebounced(skill);
  const dCity = useDebounced(city);

  useEffect(() => {
    const p = new URLSearchParams();
    if (dSkill) p.set('skill', dSkill);
    if (dCity) p.set('city', dCity);
    setParams(p, { replace: true });
  }, [dSkill, dCity, setParams]);

  const query = useQuery({
    queryKey: ['jobs', dSkill, dCity],
    queryFn: () => jobApi.search({ skill: dSkill || undefined, city: dCity || undefined, status: 'OPEN' }),
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Open <span className="text-gradient">jobs</span>
          </h1>
          <p className="text-ink-300 mt-1">Apply directly. No middlemen.</p>
        </div>
        {user?.role === 'EMPLOYER' && (
          <Link to="/jobs/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Post a job
          </Link>
        )}
      </header>

      <div className="card mb-8 p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>

      {query.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {query.data && query.data.data.length === 0 && (
        <Empty title="No jobs match your filters" icon={<Briefcase className="h-6 w-6" />} />
      )}

      {query.data && query.data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {query.data.data.map((j, i) => (
            <JobCard key={j.id} j={j} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const JobCard = ({ j, index }: { j: Job; index: number }): JSX.Element => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index, 8) * 0.04 }}
    whileHover={{ y: -4 }}
    className="card relative overflow-hidden"
  >
    <Link to={`/jobs/${j.id}`} className="block space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-lg leading-tight">{j.title}</h3>
        <Badge variant={statusVariant[j.status]}>{j.status.replace('_', ' ')}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-400">
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3 w-3" /> {j.skillRequired}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {j.city}
        </span>
        <span className="inline-flex items-center gap-0.5 text-emerald-300">
          <IndianRupee className="h-3 w-3" /> {j.budget}
        </span>
      </div>
      {j.description && <p className="text-sm text-ink-300 line-clamp-2">{j.description}</p>}
      {j.employer && (
        <div className="text-xs text-ink-400">posted by {j.employer.name}</div>
      )}
    </Link>
  </motion.div>
);

export default JobsPage;
