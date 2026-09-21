import { FolderKanban, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { CONTRACT_STATUS_BADGES, CONTRACT_STATUS_LABELS } from '../constants/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useProjects } from '../services/projects.js';

const idOf = (value) => String(value?._id || value?.id || value || '');

function Progress({ value }) {
  return <div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Progress</span><strong className="text-slate-700">{value}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Project progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}><div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${value}%` }} /></div></div>;
}

export default function MyProjects() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProjects({ page, limit: 10 }, { keepPreviousData: true });
  const projects = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
      <p className="mt-1 text-slate-500">Track delivery progress and keep each accepted engagement in one workspace.</p>

      {isLoading ? <div className="mt-5 space-y-3"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
        : isError ? <p className="mt-8 rounded-xl bg-red-50 p-5 text-red-700" role="alert">Could not load projects.</p>
          : projects.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center"><FolderKanban className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-2 font-medium text-slate-700">No projects yet</p><p className="mt-1 text-sm text-slate-500">A workspace is created automatically when an offer becomes a contract.</p><Link to="/dashboard/offers" className="mt-4 inline-flex rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">View offers</Link></div>
            : <ul className="mt-5 space-y-4">{projects.map((project) => {
              const contract = project.contract || {};
              const isClient = idOf(contract.client) === idOf(user);
              const counterpart = isClient ? contract.freelancer : contract.client;
              return <li key={idOf(project)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{contract.title}</h2><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CONTRACT_STATUS_BADGES[project.status]}`}>{CONTRACT_STATUS_LABELS[project.status]}</span></div><p className="mt-1 text-sm text-slate-500">{contract.job?.title}</p></div><span className="text-xs text-slate-500">Updated {new Date(project.updatedAt).toLocaleDateString()}</span></div><div className="mt-4"><Progress value={project.progress} /></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><span className="flex items-center gap-2 text-sm text-slate-600"><UserRound className="h-4 w-4" /> {isClient ? 'Freelancer' : 'Client'}: <strong className="text-slate-800">{counterpart?.name || 'Marketplace user'}</strong></span><span className="text-xs text-slate-500">{isClient ? 'Client workspace' : 'Freelancer workspace'}</span></div><div className="mt-4 flex flex-wrap gap-2"><Link to={`/dashboard/projects/${idOf(project)}`} className="inline-flex rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Open workspace</Link><Link to={`/dashboard/contracts/${idOf(contract)}`} className="inline-flex rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">View contract</Link></div></li>;
            })}</ul>}

      {pagination?.totalPages > 1 && <div className="mt-6 flex items-center justify-center gap-3"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span><Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
    </div>
  );
}
