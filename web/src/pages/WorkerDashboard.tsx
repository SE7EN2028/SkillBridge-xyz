import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle2, MapPin, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { workerApi, applicationApi } from '@/lib/endpoints';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { Empty } from '@/components/Empty';
import { Button } from '@/components/Button';
import { Input, Textarea } from '@/components/Input';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Rating } from '@/components/Rating';
import { HttpError } from '@/lib/api';
import type { ApplicationStatus } from '@/types/api';

const appBadge: Record<ApplicationStatus, 'info' | 'warn' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warn',
  ACCEPTED: 'info',
  REJECTED: 'danger',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export const WorkerDashboard = (): JSX.Element => {
  const qc = useQueryClient();
  const meQ = useQuery({ queryKey: ['me-worker'], queryFn: workerApi.me, retry: false });
  const appsQ = useQuery({ queryKey: ['my-applications'], queryFn: applicationApi.mine });

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ city: '', bio: '', hourlyRate: '' });
  const createM = useMutation({
    mutationFn: () =>
      workerApi.create({
        city: createForm.city,
        bio: createForm.bio || undefined,
        hourlyRate: Number(createForm.hourlyRate),
      }),
    onSuccess: () => {
      toast.success('Profile created');
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ['me-worker'] });
    },
    onError: (err) => toast.error(err instanceof HttpError ? err.message : 'Failed'),
  });

  const [skill, setSkill] = useState({ skillName: '', yearsExp: '' });
  const addSkillM = useMutation({
    mutationFn: () =>
      workerApi.addSkill({ skillName: skill.skillName, yearsExp: Number(skill.yearsExp) }),
    onSuccess: () => {
      toast.success('Skill added');
      setSkill({ skillName: '', yearsExp: '' });
      qc.invalidateQueries({ queryKey: ['me-worker'] });
    },
    onError: (err) => toast.error(err instanceof HttpError ? err.message : 'Failed'),
  });

  const removeSkillM = useMutation({
    mutationFn: (id: string) => workerApi.removeSkill(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me-worker'] }),
  });

  const cancelAppM = useMutation({
    mutationFn: (id: string) => applicationApi.cancel(id),
    onSuccess: () => {
      toast.success('Cancelled');
      qc.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  const profileMissing = meQ.isError && (meQ.error as HttpError | undefined)?.status === 404;

  if (meQ.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (profileMissing || showCreate) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Card>
          <h1 className="font-display text-2xl font-bold">Create your worker profile</h1>
          <p className="mt-1 text-sm text-ink-300">A profile is required before you can apply to jobs.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createM.mutate();
            }}
            className="mt-6 space-y-4"
          >
            <Input label="City" value={createForm.city} onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })} required />
            <Input
              label="Hourly rate (₹)"
              type="number"
              value={createForm.hourlyRate}
              onChange={(e) => setCreateForm({ ...createForm, hourlyRate: e.target.value })}
              required
            />
            <Textarea
              label="Bio"
              value={createForm.bio}
              onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
              maxLength={500}
              placeholder="Tell employers about your experience"
            />
            <Button type="submit" loading={createM.isPending} className="w-full">
              Create profile
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (meQ.isError) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <Empty title="Couldn't load your profile" />
      </div>
    );
  }

  const w = meQ.data!;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-5">
          <Avatar name={w.user?.name ?? 'You'} src={w.photoUrl ?? null} size={88} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{w.user?.name}</h1>
              {w.isVerified ? (
                <Badge variant="info">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="warn">Pending verification</Badge>
              )}
              <Badge variant={w.isAvailable ? 'success' : 'default'}>
                {w.isAvailable ? 'Available' : 'Busy'}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {w.city}
              </span>
              <span>₹{w.hourlyRate}/hr</span>
              <Rating value={w.averageRating} reviewCount={w.reviewCount} showValue />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Skills</h2>
          </div>
          {w.skills && w.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {w.skills.map((s) => (
                <span key={s.id} className="chip">
                  {s.skillName} <span className="text-ink-400">· {s.yearsExp}y</span>
                  <button
                    onClick={() => removeSkillM.mutate(s.id)}
                    className="ml-1 text-ink-400 hover:text-red-300"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400 mb-4">No skills yet.</p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addSkillM.mutate();
            }}
            className="grid grid-cols-3 gap-2"
          >
            <Input
              placeholder="Skill name"
              value={skill.skillName}
              onChange={(e) => setSkill({ ...skill, skillName: e.target.value })}
              minLength={2}
              required
            />
            <Input
              placeholder="Years"
              type="number"
              value={skill.yearsExp}
              onChange={(e) => setSkill({ ...skill, yearsExp: e.target.value })}
              min={0}
              required
            />
            <Button type="submit" loading={addSkillM.isPending} icon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-3">My applications</h2>
          {appsQ.isLoading && <Skeleton className="h-16 w-full" />}
          {appsQ.data && appsQ.data.length === 0 && (
            <p className="text-sm text-ink-400">No applications yet.</p>
          )}
          {appsQ.data && appsQ.data.length > 0 && (
            <div className="space-y-3">
              {appsQ.data.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-brand-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{app.job?.title ?? 'Job'}</div>
                    {app.job && (
                      <div className="text-xs text-ink-400">
                        {app.job.skillRequired} · {app.job.city}
                      </div>
                    )}
                  </div>
                  <Badge variant={appBadge[app.status]}>{app.status}</Badge>
                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => cancelAppM.mutate(app.id)}
                      className="rounded-md p-1.5 text-ink-400 hover:bg-white/5 hover:text-red-300"
                      aria-label="Cancel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
