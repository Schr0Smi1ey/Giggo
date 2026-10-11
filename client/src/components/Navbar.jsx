import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { NAV_LINKS } from '../constants/index.js';
import { Button } from './Button.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { Logo } from './brand/Logo.jsx';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Link to="/" className="rounded-lg" aria-label="Giggo home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-1 text-sm font-medium transition ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-subtle hover:text-foreground'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-subtle transition hover:bg-muted hover:text-foreground">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {user?.name?.split(' ')[0] || 'Dashboard'}
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /> Log out</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-subtle hover:text-foreground">Sign in</Link>
              <Link to="/register"><Button size="sm">Get started</Button></Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-subtle hover:bg-muted hover:text-foreground md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-4 shadow-soft md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/45 dark:text-brand-200' : 'text-subtle hover:bg-muted hover:text-foreground'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-border" />
            <ThemeToggle className="w-fit" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-subtle hover:bg-muted hover:text-foreground">Dashboard</Link>
                <Button variant="secondary" size="sm" onClick={handleLogout}>Log out</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-subtle hover:bg-muted hover:text-foreground">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)}><Button size="sm" className="w-full">Get started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
