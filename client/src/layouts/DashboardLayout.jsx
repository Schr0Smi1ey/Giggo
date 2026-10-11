import { Outlet, NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Bell, Briefcase, Bookmark, FileSignature, FileText, FolderKanban, Handshake, Inbox, LayoutDashboard, Menu, MessageCircle, Settings, ShieldCheck, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationsApi } from '../api/notifications.js';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { Logo } from '../components/brand/Logo.jsx';

const items = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminItems = [
  { to: '/dashboard/admin/verification', label: 'Review Queue', icon: ShieldCheck },
];

const freelancerItems = [
  { to: '/dashboard/proposals', label: 'My proposals', icon: FileText },
  { to: '/dashboard/offers', label: 'My offers', icon: Handshake },
  { to: '/dashboard/cv-analysis', label: 'CV Analyzer', icon: Sparkles },
  { to: '/dashboard/saved-jobs', label: 'Saved jobs', icon: Bookmark },
  { to: '/dashboard/verification', label: 'Verification', icon: ShieldCheck },
];

const clientItems = [
  { to: '/dashboard/jobs', label: 'My jobs', icon: Briefcase },
  { to: '/dashboard/proposals/received', label: 'Proposals received', icon: Inbox },
  { to: '/dashboard/offers', label: 'Offers sent', icon: Handshake },
];

export function DashboardLayout() {
  const { hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notifications } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.list({ limit: 5 }), refetchInterval: 30_000 });
  const nav = [
    ...items,
    ...((hasRole('client') || hasRole('freelancer')) ? [{ to: '/dashboard/contracts', label: 'Contracts', icon: FileSignature }] : []),
    ...((hasRole('client') || hasRole('freelancer')) ? [{ to: '/dashboard/projects', label: 'Projects', icon: FolderKanban }] : []),
    ...(hasRole('client') ? clientItems : []),
    ...(hasRole('freelancer') ? freelancerItems : []),
    ...(hasRole('admin') ? adminItems : []),
  ];
  const navigation = (
    <nav className="space-y-1" aria-label="Dashboard">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950/45 dark:text-brand-200 dark:ring-brand-900'
                : 'text-subtle hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {to === '/dashboard/notifications' && notifications?.unreadCount > 0 && (
            <span className="rounded-full bg-brand-700 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-brand-400 dark:text-brand-950">
              {notifications.unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-64 shrink-0 rounded-xl border border-border bg-surface p-4 shadow-soft md:block">
          <Link to="/" className="mb-6 inline-flex rounded-lg" aria-label="Giggo home">
            <Logo />
          </Link>
          {navigation}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="presentation">
            <button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close dashboard menu" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[min(20rem,85vw)] overflow-y-auto border-r border-border bg-surface p-4 shadow-lift">
              <div className="mb-5 flex items-center justify-between">
                <Link to="/" onClick={() => setMobileOpen(false)} aria-label="Giggo home">
                  <Logo />
                </Link>
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-subtle hover:bg-muted hover:text-foreground" aria-label="Close menu">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {navigation}
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-5 hidden items-center justify-end md:flex">
            <ThemeToggle />
          </div>
          <div className="mb-5 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 shadow-soft md:hidden">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-subtle hover:bg-muted hover:text-foreground" aria-label="Open dashboard menu">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link to="/" aria-label="Giggo home">
              <Logo compact markClassName="h-8 w-8" />
            </Link>
            <div className="flex gap-1">
              <ThemeToggle className="hidden min-[430px]:inline-flex" />
              <Link to="/dashboard/messages" className="rounded-lg p-2 text-subtle hover:bg-muted hover:text-foreground" aria-label="Messages">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to="/dashboard/notifications" className="relative rounded-lg p-2 text-subtle hover:bg-muted hover:text-foreground" aria-label="Notifications">
                <Bell className="h-5 w-5" aria-hidden="true" />
                {notifications?.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{notifications.unreadCount}</span>}
              </Link>
            </div>
          </div>
          <div className="mb-5 min-[430px]:hidden">
            <ThemeToggle />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
