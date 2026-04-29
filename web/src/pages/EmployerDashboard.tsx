import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Plus, IndianRupee } from 'lucide-react';
import { jobApi } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { Empty } from '@/components/Empty';
import { Badge } from '@/components/Badge';
import type { JobStatus } from '@/types/api';

const v: Record<JobStatus, 'info' | 'warn' | 'success' | 'default'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warn',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export const EmployerDashboard = (): JSX.Element => {
  const { user } = useAuth();
  const jobsQ = useQuery({
    queryKey: ['my-jobs', user?.id],
    queryFn: () => jobApi.search({ employerId: user!.id, limit: 50 }),
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">My jobs</h1>
          <p className="text-ink-300 mt-1">Manage open positions and applications.</p>
        </div>
        <Link to="/jobs/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Post a job
        </Link>
      </div>

      {jobsQ.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {jobsQ.data && jobsQ.data.data.length === 0 && (
        <Empty
          title="You haven't posted any jobs yet"
          description="Post your first job to start receiving applications."
        />
      )}

      {jobsQ.data && jobsQ.data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobsQ.data.data.map((j, i) => (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card>
                <Link to={`/jobs/${j.id}`} className="block space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{j.title}</h3>
                    <Badge variant={v[j.status]}>{j.status.replace('_', ' ')}</Badge>
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
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
