import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, X, Users, Briefcase, CheckSquare } from 'lucide-react';
import { adminApi } from '@/lib/endpoints';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { Empty } from '@/components/Empty';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { HttpError } from '@/lib/api';

const statTiles = [
  { key: 'totalUsers' as const, label: 'Users', icon: Users, color: 'text-brand-300' },
  { key: 'totalWorkers' as const, label: 'Workers', icon: ShieldCheck, color: 'text-emerald-300' },
  { key: 'totalEmployers' as const, label: 'Employers', icon: Briefcase, color: 'text-accent-500' },
  { key: 'totalJobs' as const, label: 'Jobs', icon: Briefcase, color: 'text-violet-300' },
  { key: 'totalApplications' as const, label: 'Applications', icon: CheckSquare, color: 'text-pink-300' },
  { key: 'totalCompletedJobs' as const, label: 'Completed', icon: CheckSquare, color: 'text-emerald-300' },
];

export const AdminDashboard = (): JSX.Element => {
  const qc = useQueryClient();
  const statsQ = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.stats });
  const unverifiedQ = useQuery({
    queryKey: ['admin-unverified'],
    queryFn: adminApi.unverifiedWorkers,
  });

  const verifyM = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      adminApi.verifyWorker(id, verified),
    onSuccess: () => {
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['admin-unverified'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err) => toast.error(err instanceof HttpError ? err.message : 'Failed'),
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin</h1>
        <p className="text-ink-300 mt-1">Verify workers, watch the platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statTiles.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card"
          >
            <t.icon className={`h-5 w-5 ${t.color}`} />
            <div className="mt-3 text-2xl font-display font-bold">
              {statsQ.isLoading ? '—' : statsQ.data?.[t.key] ?? 0}
            </div>
            <div className="text-xs text-ink-400 mt-1">{t.label}</div>
          </motion.div>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">Pending verification</h2>
        {unverifiedQ.isLoading && <Skeleton className="h-20 w-full" />}
        {unverifiedQ.data && unverifiedQ.data.length === 0 && (
          <Empty title="All caught up" description="No workers waiting for verification." />
        )}
        {unverifiedQ.data && unverifiedQ.data.length > 0 && (
          <div className="space-y-3">
            {unverifiedQ.data.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-3"
              >
                <Avatar name={w.user?.name ?? '?'} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{w.user?.name}</div>
                  <div className="text-xs text-ink-400 truncate">
                    {w.city} · {w.skills?.length ?? 0} skill(s)
                  </div>
                </div>
                <Button
                  variant="secondary"
                  icon={<X className="h-4 w-4" />}
                  onClick={() => verifyM.mutate({ id: w.id, verified: false })}
                >
                  Skip
                </Button>
                <Button
                  icon={<ShieldCheck className="h-4 w-4" />}
                  onClick={() => verifyM.mutate({ id: w.id, verified: true })}
                >
                  Verify
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
