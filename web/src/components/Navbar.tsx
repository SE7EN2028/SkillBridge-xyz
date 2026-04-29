import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Logo } from './Logo';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/workers', label: 'Find workers' },
  { to: '/jobs', label: 'Browse jobs' },
];

export const Navbar = (): JSX.Element => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink-950/70 border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center" aria-label="SkillBridge home">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                clsx(
                  'relative rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive ? 'text-white' : 'text-ink-300 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-white/5 border border-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NavLink to="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
                <Avatar name={user.name} size={32} />
                <div className="text-sm leading-tight">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-ink-400">{user.role.toLowerCase()}</div>
                </div>
              </NavLink>
              <Button variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-lg p-2 text-ink-100 hover:bg-white/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/5"
          >
            <div className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-2">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-ink-100 hover:bg-white/5"
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-ink-100 hover:bg-white/5"
                  >
                    Dashboard
                  </NavLink>
                  <button onClick={handleLogout} className="text-left rounded-lg px-3 py-2 text-sm text-ink-100 hover:bg-white/5">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
