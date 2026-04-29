import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, IndianRupee, Send } from 'lucide-react';
import { jobApi, applicationApi } from '@/lib/endpoints';
import { Empty } from '@/components/Empty';
import { CardSkeleton } from '@/components/Skeleton';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Input';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import { HttpError } from '@/lib/api';
import type { ApplicationStatus, JobStatus } from '@/types/api';

const jobStatusVariant: Record<JobStatus, 'info' | 'warn' | 'success' | 'default'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warn',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const appStatusVariant: Record<ApplicationStatus, 'info' | 'warn' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warn',
  ACCEPTED: 'info',
  REJECTED: 'danger',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export const JobDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();

  const jobQ = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.get(id!),
    enabled: !!id,
  });

  const appsQ = useQuery({
    queryKey: ['job-applications', id],
    queryFn: () => jobApi.applications(id!),
    enabled: !!id && user?.role === 'EMPLOYER' && jobQ.data?.employerId === user.id,
  });

  const [coverNote, setCoverNote] = useState('');
  const applyM = useMutation({
    mutationFn: () => jobApi.apply(id!, coverNote || undefined),
    onSuccess: () => {
      toast.success('Application sent');
      setCoverNote('');
    },
    onError: (err) => toast.error(err instanceof HttpError ? err.message : 'Failed'),
  });

  const setStatusM = useMutation({
    mutationFn: (status: ApplicationStatus) =>
      applicationApi.setStatus(currentTargetAppId.current!, status),
    onSuccess: () => {
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['job-applications', id] });
      qc.invalidateQueries({ queryKey: ['job', id] });
    },
    onError: (err) => toast.error(err instanceof HttpError ? err.message : 'Failed'),
  });

  const currentTargetAppId = { current: null as string | null };

  if (jobQ.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <CardSkeleton />
      </div>
    );
  }
  if (jobQ.isError || !jobQ.data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <Empty title="Job not found" />
      </div>
    );
  }

  const j = jobQ.data;
  const isWorker = user?.role === 'WORKER';
  const isOwner = user?.id === j.employerId;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card"
      >
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl md:text-3xl font-bold">{j.title}</h1>
          <Badge variant={jobStatusVariant[j.status]}>{j.status.replace('_', ' ')}</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-300">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" /> {j.skillRequired}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {j.city}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <IndianRupee className="h-4 w-4" /> {j.budget}
          </span>
        </div>
        {j.description && (
          <p className="mt-4 leading-relaxed text-ink-200 whitespace-pre-line">{j.description}</p>
        )}
        {j.employer && (
          <div className="mt-5 flex items-center gap-2 text-xs text-ink-400">
            <Avatar name={j.employer.name} size={24} /> Posted by {j.employer.name}
          </div>
        )}
      </motion.div>

      {isWorker && j.status === 'OPEN' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="font-display text-lg font-semibold mb-3">Apply to this job</h2>
          <Textarea
            label="Cover note (optional)"
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            placeholder="Briefly explain why you're a good fit"
            maxLength={500}
          />
          <div className="mt-4">
            <Button
              icon={<Send className="h-4 w-4" />}
              loading={applyM.isPending}
              onClick={() => applyM.mutate()}
            >
              Send application
            </Button>
          </div>
        </motion.div>
      )}

      {isOwner && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold mb-4">Applications</h2>
          {appsQ.isLoading && <CardSkeleton />}
          {appsQ.data && appsQ.data.length === 0 && (
            <p className="text-sm text-ink-400">No applications yet.</p>
          )}
          {appsQ.data && appsQ.data.length > 0 && (
            <div className="space-y-3">
              {appsQ.data.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar name={app.workerProfile?.user?.name ?? '?'} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {app.workerProfile?.user?.name ?? 'Worker'}
                      </div>
                      {app.coverNote && (
                        <div className="text-xs text-ink-400 line-clamp-2">{app.coverNote}</div>
                      )}
                    </div>
                    <Badge variant={appStatusVariant[app.status]}>{app.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.status === 'PENDING' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            currentTargetAppId.current = app.id;
                            setStatusM.mutate('REJECTED');
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            currentTargetAppId.current = app.id;
                            setStatusM.mutate('ACCEPTED');
                          }}
                        >
                          Accept
                        </Button>
                      </>
                    )}
                    {app.status === 'ACCEPTED' && (
                      <Button
                        onClick={() => {
                          currentTargetAppId.current = app.id;
                          setStatusM.mutate('COMPLETED');
                        }}
                      >
                        Mark complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
