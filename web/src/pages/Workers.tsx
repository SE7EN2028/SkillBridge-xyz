import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Filter, MapPin, Search, ShieldCheck, IndianRupee } from 'lucide-react';
import { Input, Select } from '@/components/Input';
import { Button } from '@/components/Button';
import { CardSkeleton } from '@/components/Skeleton';
import { Empty } from '@/components/Empty';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Rating } from '@/components/Rating';
import { workerApi } from '@/lib/endpoints';
import type { WorkerProfile } from '@/types/api';

const useDebounced = <T,>(value: T, delay = 350): T => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export const WorkersPage = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const [skill, setSkill] = useState(params.get('skill') ?? '');
  const [city, setCity] = useState(params.get('city') ?? '');
  const [maxRate, setMaxRate] = useState(params.get('maxRate') ?? '');
  const [minRating, setMinRating] = useState(params.get('minRating') ?? '');

  const dSkill = useDebounced(skill);
  const dCity = useDebounced(city);
  const dMaxRate = useDebounced(maxRate);
  const dMinRating = useDebounced(minRating);

  useEffect(() => {
    const p = new URLSearchParams();
    if (dSkill) p.set('skill', dSkill);
    if (dCity) p.set('city', dCity);
    if (dMaxRate) p.set('maxRate', dMaxRate);
    if (dMinRating) p.set('minRating', dMinRating);
    setParams(p, { replace: true });
  }, [dSkill, dCity, dMaxRate, dMinRating, setParams]);

  const query = useQuery({
    queryKey: ['workers', dSkill, dCity, dMaxRate, dMinRating],
    queryFn: () =>
      workerApi.search({
        skill: dSkill || undefined,
        city: dCity || undefined,
        maxRate: dMaxRate || undefined,
        minRating: dMinRating || undefined,
      }),
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Find <span className="text-gradient">verified workers</span>
        </h1>
        <p className="text-ink-300">Filter by skill, city, rate and rating.</p>
      </header>

      <div className="card mb-8 p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Skill (e.g. plumber)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="md:col-span-1"
          />
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            placeholder="Max ₹/hr"
            type="number"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
          />
          <Select
            options={[
              { label: 'Any rating', value: '' },
              { label: '4+ stars', value: '4' },
              { label: '3+ stars', value: '3' },
              { label: '2+ stars', value: '2' },
            ]}
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>
      </div>

      {query.isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {query.isError && (
        <Empty
          title="Couldn't load workers"
          description="The API isn't reachable right now."
          action={
            <Button variant="secondary" onClick={() => query.refetch()} icon={<Search className="h-4 w-4" />}>
              Retry
            </Button>
          }
        />
      )}

      {query.data && query.data.data.length === 0 && (
        <Empty
          title="No workers match your filters"
          description="Try widening your search."
          icon={<Filter className="h-6 w-6" />}
        />
      )}

      {query.data && query.data.data.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {query.data.data.map((w, i) => (
            <WorkerCard key={w.id} w={w} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

const WorkerCard = ({ w, index }: { w: WorkerProfile; index: number }): JSX.Element => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.35 }}
    whileHover={{ y: -4 }}
    className="card relative overflow-hidden"
  >
    <Link to={`/workers/${w.id}`} className="block space-y-3">
      <div className="flex items-start gap-3">
        <Avatar name={w.user?.name ?? 'Worker'} src={w.photoUrl ?? null} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{w.user?.name ?? 'Worker'}</h3>
            {w.isVerified && (
              <Badge variant="info">
                <ShieldCheck className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {w.city}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3" /> {w.hourlyRate}/hr
            </span>
          </div>
        </div>
      </div>
      <Rating value={w.averageRating} reviewCount={w.reviewCount} showValue />
      {w.bio && <p className="text-sm text-ink-300 line-clamp-2">{w.bio}</p>}
      {w.skills && w.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {w.skills.slice(0, 4).map((s) => (
            <span key={s.id} className="chip">
              {s.skillName}
            </span>
          ))}
          {w.skills.length > 4 && <span className="chip">+{w.skills.length - 4}</span>}
        </div>
      )}
    </Link>
  </motion.div>
);

export default WorkersPage;
