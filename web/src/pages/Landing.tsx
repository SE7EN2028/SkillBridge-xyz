import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Briefcase,
  CheckCircle2,
  Zap,
} from 'lucide-react';
const stats = [
  { label: 'Workers in India\'s gig sector', value: '500M+' },
  { label: 'Avg time to verify a worker', value: '< 24h' },
  { label: 'Middlemen cut, removed', value: '0%' },
];

const featureCards = [
  {
    icon: ShieldCheck,
    title: 'Verified profiles',
    body: 'Skills and certificates reviewed by admins before workers go live.',
  },
  {
    icon: Star,
    title: 'Reputation built in',
    body: 'Every completed job adds to a worker\'s public, tamper-proof rating.',
  },
  {
    icon: Zap,
    title: 'Structured hiring',
    body: 'Apply → accept → complete → review. Same flow for every job.',
  },
  {
    icon: Sparkles,
    title: 'Fair pay, no middlemen',
    body: 'Workers set their hourly rate. Employers pay them directly.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export const LandingPage = (): JSX.Element => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-200 mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
          Trusted hiring for India's blue-collar workforce
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]"
        >
          The marketplace where{' '}
          <span className="text-gradient">verified workers</span> get hired.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-ink-300"
        >
          SkillBridge gives electricians, plumbers, carpenters, drivers and
          domestic workers a verified digital identity and a structured way to
          get hired by employers and households who trust them.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/register" className="btn-primary">
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/workers" className="btn-secondary">
            Browse workers
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i}
              className="card text-left"
            >
              <div className="text-3xl font-display font-bold text-gradient">{s.value}</div>
              <div className="mt-2 text-sm text-ink-300">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="mx-auto max-w-7xl px-5 pb-20">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">
          Built around <span className="text-gradient">trust</span>.
        </h2>
        <p className="mt-3 text-ink-300 max-w-xl mx-auto">
          Four primitives. Zero noise. Everything else gets out of the way.
        </p>
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {featureCards.map((f, i) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -4 }}
            className="card relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-gradient-to-b from-brand-500/20 to-transparent blur-2xl" />
            <f.icon className="h-6 w-6 text-brand-400" />
            <div className="mt-4 font-semibold">{f.title}</div>
            <div className="mt-1.5 text-sm text-ink-300">{f.body}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>

    {/* How it works */}
    <section className="mx-auto max-w-7xl px-5 pb-24">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-sm uppercase tracking-widest text-brand-300 mb-3">
            How it works
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            One flow. Both sides.
          </h2>
          <p className="mt-4 text-ink-300 max-w-xl">
            Workers list skills. Employers post jobs. SkillBridge matches them with structured states, public reputation, and admin-verified credentials.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">
              <Users className="h-4 w-4" /> I'm a worker
            </Link>
            <Link to="/register" className="btn-secondary">
              <Briefcase className="h-4 w-4" /> I'm hiring
            </Link>
          </div>
        </div>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card p-8 space-y-5"
          >
            {[
              { step: 'PENDING', text: 'Worker applies to a job', tone: 'text-amber-300' },
              { step: 'ACCEPTED', text: 'Employer accepts. Job moves to in-progress.', tone: 'text-brand-300' },
              { step: 'COMPLETED', text: 'Job done. Employer reviews.', tone: 'text-emerald-300' },
              { step: 'REPUTATION', text: 'Worker rating is recomputed automatically.', tone: 'text-accent-500' },
            ].map((row, i) => (
              <motion.div
                key={row.step}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className={`h-5 w-5 mt-0.5 ${row.tone}`} />
                <div>
                  <div className={`text-xs font-mono ${row.tone}`}>{row.step}</div>
                  <div className="text-sm text-ink-100">{row.text}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="mx-auto max-w-5xl px-5 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/20 via-ink-900 to-accent-500/20 p-10 text-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" />
        <h3 className="relative font-display text-3xl md:text-4xl font-bold">
          Ready to build your reputation?
        </h3>
        <p className="relative mt-3 text-ink-200">
          Free to join. No middlemen. Verified in under 24 hours.
        </p>
        <div className="relative mt-6 flex justify-center gap-3">
          <Link to="/register" className="btn-primary">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/jobs" className="btn-secondary">
            Browse open jobs
          </Link>
        </div>
      </motion.div>
    </section>
  </div>
);

export default LandingPage;
