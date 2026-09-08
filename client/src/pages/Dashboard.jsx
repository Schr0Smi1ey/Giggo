import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyProfile } from '../services/profile.js';
import { CheckCircle2, Circle, ArrowRight, Search } from 'lucide-react';

const cards = {
  freelancer: [
    ['Profile completion', '40%'],
    ['Active proposals', '0'],
    ['Active contracts', '0'],
    ['Available balance', '$0.00'],
  ],
  client: [
    ['Company profile', '0%'],
    ['Proposals received', '0'],
    ['Active contracts', '0'],
    ['Total spending', '$0.00'],
  ],
  admin: [
    ['Total users', '3'],
    ['Pending verifications', '0'],
    ['Open disputes', '0'],
    ['Platform revenue', '$0.00'],
  ],
};

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const role = hasRole('admin') ? 'admin' : hasRole('client') ? 'client' : 'freelancer';
  const isFreelancer = role === 'freelancer';
  const isClient = role === 'client';
  const hasMarketplaceProfile = isFreelancer || isClient;
  const { data: profile } = useMyProfile({ enabled: hasMarketplaceProfile });
  const completeness = profile?.completeness ?? 0;
  const profileDone = completeness >= 80;

  const metrics = cards[role].map(([label, value]) =>
    (label === 'Profile completion' || label === 'Company profile') ? [label, `${completeness}%`] : [label, value]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-slate-500 capitalize">{role} dashboard</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Getting started</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-brand-600" /> Account created
          </li>
          <li className={`flex items-center gap-2 ${user?.emailVerified ? 'text-slate-700' : 'text-slate-500'}`}>
            {user?.emailVerified ? (
              <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4" aria-hidden="true" />
            )}
            {user?.emailVerified ? 'Email verified' : 'Verify your email'}
          </li>
          {hasMarketplaceProfile && (
            <li>
              <Link
                to={profile?.onboardingCompleted ? '/dashboard/profile' : '/onboarding'}
                className="group flex items-center gap-2 text-slate-700 hover:text-brand-700"
              >
                {profileDone ? (
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {profileDone
                  ? `${isClient ? 'Company' : 'Profile'} complete`
                  : profile?.onboardingCompleted
                    ? `Complete your ${isClient ? 'company' : 'profile'} (${completeness}%)`
                    : `Set up your ${isClient ? 'company' : 'freelancer'} profile`}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </Link>
            </li>
          )}
        </ul>
      </div>

      {isClient && (
        <div className="mt-6">
          <Link to="/find-talent" className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Search className="h-5 w-5" /></div>
          <div className="min-w-0">
              <div className="font-semibold text-slate-900">Find talent</div>
              <div className="text-sm text-slate-500">Browse public freelancer profiles and save candidates for a later phase.</div>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-600" />
          </Link>
        </div>
      )}
    </div>
  );
}
