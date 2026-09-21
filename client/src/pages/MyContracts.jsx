import { useState } from 'react';
import { FileSignature, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { CONTRACT_STATUS_BADGES, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_OPTIONS } from '../constants/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useContracts } from '../services/contracts.js';

const FILTERS = [{ value: '', label: 'All' }, ...CONTRACT_STATUS_OPTIONS];
const idOf = (value) => String(value?._id || value?.id || value || '');
const money = (contract) => `${contract.budget?.currency || 'USD'} ${Number(contract.budget?.amount || 0).toLocaleString()}${contract.budget?.type === 'hourly' ? '/hr' : ''}`;

export default function MyContracts() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const params = { page, limit: 10, ...(status ? { status } : {}) };
  const { data, isLoading, isError } = useContracts(params, { keepPreviousData: true });
  const contracts = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
      <p className="mt-1 text-slate-500">Review accepted terms and track the lifecycle of your active work.</p>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter contracts by status">
        {FILTERS.map((filter) => <button key={filter.value || 'all'} type="button" aria-pressed={status === filter.value} onClick={() => { setStatus(filter.value); setPage(1); }} className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === filter.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{filter.label}</button>)}
      </div>

      {isLoading ? <div className="mt-5 space-y-3"><Skeleton className="h-44" /><Skeleton className="h-44" /></div>
        : isError ? <p className="mt-8 rounded-xl bg-red-50 p-5 text-red-700" role="alert">Could not load contracts.</p>
          : contracts.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center"><FileSignature className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-2 font-medium text-slate-700">No contracts found</p><p className="mt-1 text-sm text-slate-500">A contract is created automatically when an offer is accepted.</p><Link to="/dashboard/offers" className="mt-4 inline-block"><Button size="sm" variant="secondary">View offers</Button></Link></div>
            : <ul className="mt-5 space-y-4">{contracts.map((contract) => {
              const isClient = idOf(contract.client) === idOf(user);
              const counterpart = isClient ? contract.freelancer : contract.client;
              return <li key={idOf(contract)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{contract.title}</h2><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CONTRACT_STATUS_BADGES[contract.status]}`}>{CONTRACT_STATUS_LABELS[contract.status]}</span></div><p className="mt-1 text-sm text-slate-500">{contract.job?.title}</p></div><strong className="text-slate-900">{money(contract)}</strong></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><span className="flex items-center gap-2 text-sm text-slate-600"><UserRound className="h-4 w-4" /> {isClient ? 'Freelancer' : 'Client'}: <strong className="text-slate-800">{counterpart?.name || 'Marketplace user'}</strong></span><span className="text-xs text-slate-500">Activated {new Date(contract.activatedAt).toLocaleDateString()}</span></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{contract.description}</p><div className="mt-4 flex flex-wrap gap-2"><Link to={`/dashboard/contracts/${idOf(contract)}`} className="inline-flex rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Open contract</Link>{contract.project && <Link to={`/dashboard/projects/${idOf(contract.project)}`} className="inline-flex rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Open workspace</Link>}</div></li>;
            })}</ul>}

      {pagination?.totalPages > 1 && <div className="mt-6 flex items-center justify-center gap-3"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span><Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
    </div>
  );
}
