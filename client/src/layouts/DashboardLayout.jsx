import { Outlet, NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, Briefcase, Bookmark, FileSignature, FileText, Handshake, Inbox, LayoutDashboard, MessageCircle, User, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationsApi } from '../api/notifications.js';

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
  const { data: notifications } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.list({ limit: 5 }), refetchInterval: 30_000 });
  const nav = [
    ...items,
    ...((hasRole('client') || hasRole('freelancer')) ? [{ to: '/dashboard/contracts', label: 'Contracts', icon: FileSignature }] : []),
    ...(hasRole('client') ? clientItems : []),
    ...(hasRole('freelancer') ? freelancerItems : []),
    ...(hasRole('admin') ? adminItems : []),
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <Link to="/" className="mb-6 flex items-center gap-2 font-bold text-brand-700">
            <Briefcase className="h-6 w-6" />
            <span>Giggo</span>
          </Link>
          <nav className="space-y-1" aria-label="Dashboard">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>
                {to === '/dashboard/notifications' && notifications?.unreadCount > 0 && <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">{notifications.unreadCount}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between md:hidden"><Link to="/" className="font-bold text-brand-700">Giggo</Link><div className="flex gap-2"><Link to="/dashboard/messages" className="rounded-lg bg-white p-2 text-slate-600 shadow-sm" aria-label="Messages"><MessageCircle className="h-5 w-5" /></Link><Link to="/dashboard/notifications" className="relative rounded-lg bg-white p-2 text-slate-600 shadow-sm" aria-label="Notifications"><Bell className="h-5 w-5" />{notifications?.unreadCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white">{notifications.unreadCount}</span>}</Link></div></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
