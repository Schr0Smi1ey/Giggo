import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { CheckCircle2, Circle } from 'lucide-react';

const cards = {
  freelancer: [
    ['Profile completion', '40%'],
    ['Active proposals', '0'],
    ['Active contracts', '0'],
    ['Available balance', '$0.00'],
  ],
  client: [
    ['Active jobs', '0'],
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
  const metrics = cards[role];

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
          <li className="flex items-center gap-2 text-slate-500">
            <Circle className="h-4 w-4" /> {user?.emailVerified ? 'Email verified' : 'Verify your email'}
          </li>
        </ul>
      </div>
    </div>
  );
}
