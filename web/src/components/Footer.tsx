import { Logo } from './Logo';

export const Footer = (): JSX.Element => (
  <footer className="border-t border-white/5 mt-24">
    <div className="mx-auto max-w-7xl px-5 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <Logo />
        <p className="text-sm text-ink-400 max-w-md">
          Verified workers. Structured hiring. Fair pay. Built for India's gig economy.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-400">
        <a href="#" className="hover:text-white">Privacy</a>
        <a href="#" className="hover:text-white">Terms</a>
        <a href="#" className="hover:text-white">Status</a>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
      </div>
      <div className="text-xs text-ink-500">© {new Date().getFullYear()} SkillBridge</div>
    </div>
  </footer>
);
