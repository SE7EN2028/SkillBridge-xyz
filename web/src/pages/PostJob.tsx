import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';
import { Input, Textarea } from '@/components/Input';
import { Button } from '@/components/Button';
import { jobApi } from '@/lib/endpoints';
import { HttpError } from '@/lib/api';

export const PostJobPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    skillRequired: '',
    city: '',
    budget: '',
  });
  const [error, setError] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () =>
      jobApi.create({
        title: form.title,
        description: form.description || undefined,
        skillRequired: form.skillRequired,
        city: form.city,
        budget: Number(form.budget),
      }),
    onSuccess: (job) => {
      toast.success('Job posted');
      navigate(`/jobs/${job.id}`);
    },
    onError: (err) => setError(err instanceof HttpError ? err.message : 'Failed'),
  });

  const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-brand-400" /> Post a job
        </h1>
        <p className="mt-1 text-sm text-ink-300">Reach verified workers in seconds.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            m.mutate();
          }}
          className="mt-6 space-y-4"
        >
          <Input label="Title" name="title" value={form.title} onChange={handle('title')} minLength={5} required />
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handle('description')}
            placeholder="What needs to be done?"
            maxLength={2000}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Skill required"
              name="skillRequired"
              value={form.skillRequired}
              onChange={handle('skillRequired')}
              placeholder="e.g. plumber"
              required
            />
            <Input label="City" name="city" value={form.city} onChange={handle('city')} required />
          </div>
          <Input
            label="Budget (₹)"
            name="budget"
            type="number"
            value={form.budget}
            onChange={handle('budget')}
            min={0}
            required
          />
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <Button type="submit" loading={m.isPending} className="w-full">
            Publish
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default PostJobPage;
