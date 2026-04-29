import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, IndianRupee, Calendar, MessageSquare } from 'lucide-react';
import { workerApi, reviewApi } from '@/lib/endpoints';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Rating } from '@/components/Rating';
import { Skeleton, CardSkeleton } from '@/components/Skeleton';
import { Empty } from '@/components/Empty';

export const WorkerDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const workerQ = useQuery({
    queryKey: ['worker', id],
    queryFn: () => workerApi.get(id!),
    enabled: !!id,
  });
  const reviewsQ = useQuery({
    queryKey: ['worker-reviews', id],
    queryFn: () => reviewApi.byWorker(id!),
    enabled: !!id,
  });

  if (workerQ.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (workerQ.isError || !workerQ.data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <Empty title="Worker not found" />
      </div>
    );
  }

  const w = workerQ.data;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar name={w.user?.name ?? 'Worker'} src={w.photoUrl ?? null} size={96} className="self-start" />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{w.user?.name ?? 'Worker'}</h1>
              {w.isVerified ? (
                <Badge variant="info">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="warn">Unverified</Badge>
              )}
              <Badge variant={w.isAvailable ? 'success' : 'default'}>
                {w.isAvailable ? 'Available' : 'Busy'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {w.city}
              </span>
              <span className="inline-flex items-center gap-1">
                <IndianRupee className="h-4 w-4" /> {w.hourlyRate} / hour
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Joined {new Date(w.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Rating value={w.averageRating} reviewCount={w.reviewCount} showValue />
            {w.bio && <p className="text-ink-200 leading-relaxed">{w.bio}</p>}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h2 className="font-display text-lg font-semibold mb-4">Skills</h2>
          {w.skills && w.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {w.skills.map((s, i) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="chip"
                >
                  <span className="font-medium text-white">{s.skillName}</span>
                  <span className="text-ink-400">· {s.yearsExp}y</span>
                  {s.certificateUrl && (
                    <a
                      href={s.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-300 hover:underline"
                    >
                      cert
                    </a>
                  )}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">No skills listed yet.</p>
          )}
        </div>

        <div className="card">
          <h2 className="font-display text-lg font-semibold mb-4">Reputation</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-300">Average rating</span>
              <span className="font-semibold">{w.averageRating.toFixed(1)} ★</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-300">Total reviews</span>
              <span className="font-semibold">{w.reviewCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-300">Status</span>
              <span className="font-semibold">{w.isVerified ? 'Verified' : 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-display text-lg font-semibold mb-4">Reviews</h2>
        {reviewsQ.isLoading && <Skeleton className="h-20 w-full" />}
        {reviewsQ.data && reviewsQ.data.length === 0 && (
          <p className="text-sm text-ink-400">No reviews yet.</p>
        )}
        {reviewsQ.data && reviewsQ.data.length > 0 && (
          <div className="space-y-4">
            {reviewsQ.data.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={r.reviewer?.name ?? '?'} size={36} />
                  <div className="flex-1">
                    <div className="font-medium">{r.reviewer?.name ?? 'Anonymous'}</div>
                    <div className="text-xs text-ink-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Rating value={r.rating} />
                </div>
                {r.comment && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-ink-200">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-ink-400" />
                    <p>{r.comment}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDetailPage;
