import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Eye, EyeOff, FileText, Pencil, RotateCcw, Sparkles, Undo2 } from 'lucide-react';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import {
  ACTIVE_PROPOSAL_STATUSES,
  PROPOSAL_STATUS_BADGES,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS_OPTIONS,
} from '../constants/index.js';
import { useMyProposals, useWithdrawProposal } from '../services/proposals.js';
import { formatBudget, timeAgo } from '../utils/format.js';

const FILTERS = [{ value: '', label: 'All' }, ...PROPOSAL_STATUS_OPTIONS];
const idOf = (value) => value?._id || value?.id || value;
const bidLabel = (bid) => `${bid?.currency || 'USD'} ${Number(bid?.amount || 0).toLocaleString()}${bid?.type === 'hourly' ? '/hr' : ''}`;

export default function MyProposals() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const params = { page, limit: 10, ...(status ? { status } : {}) };
  const { data, isLoading, isError } = useMyProposals(params, { keepPreviousData: true });
  const withdraw = useWithdrawProposal();
  const items = data?.items || [];
  const pagination = data?.pagination;

  const chooseStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const onWithdraw = (id) => {
    if (!window.confirm('Withdraw this proposal? The client will no longer be able to shortlist it.')) return;
    withdraw.mutate(id, {
      onSuccess: () => toast.success('Proposal withdrawn'),
      onError: (error) => toast.error(apiErrorMessage(error, 'Could not withdraw the proposal')),
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">My proposals</h1>
      <p className="mt-1 text-slate-500">Track, revise, withdraw, or resubmit your applications.</p>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter proposals by status">
        {FILTERS.map((filter) => (
          <button
            key={filter.value || 'all'}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => chooseStatus(filter.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === filter.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div>
      ) : isError ? (
        <p className="mt-8 rounded-xl bg-red-50 p-5 text-red-700" role="alert">Could not load your proposals.</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-medium text-slate-700">No proposals found</p>
          <p className="mt-1 text-sm text-slate-500">Browse available jobs and submit a proposal when you find a good fit.</p>
          <Link to="/find-jobs" className="mt-4 inline-block"><Button size="sm">Browse jobs</Button></Link>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
            {items.map((proposal) => {
              const id = idOf(proposal);
              const jobId = idOf(proposal.job);
              const active = ACTIVE_PROPOSAL_STATUSES.includes(proposal.status);
              return (
                <li key={id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/dashboard/proposals/${id}`} className="font-semibold text-slate-900 hover:text-brand-600">
                          {proposal.job?.title || 'Job no longer available'}
                        </Link>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROPOSAL_STATUS_BADGES[proposal.status] || 'bg-slate-100 text-slate-600'}`}>
                          {PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status}
                        </span>
                        {proposal.aiAssisted && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700"><Sparkles className="h-3 w-3" /> AI-assisted</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">Your bid {bidLabel(proposal.bid)}</span>
                        <span>{proposal.estimatedDays} days</span>
                        {proposal.job?.budget && <span>Budget {formatBudget(proposal.job.budget)}</span>}
                        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeAgo(proposal.createdAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          {proposal.viewedAt ? <><Eye className="h-3.5 w-3.5" /> Viewed {timeAgo(proposal.viewedAt)}</> : <><EyeOff className="h-3.5 w-3.5" /> Not viewed</>}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {active && <Link to={`/dashboard/proposals/${id}/edit`}><Button variant="secondary" size="sm"><Pencil className="h-4 w-4" /> Revise</Button></Link>}
                      {active && <Button variant="ghost" size="sm" onClick={() => onWithdraw(id)} loading={withdraw.isPending && withdraw.variables === id}><Undo2 className="h-4 w-4" /> Withdraw</Button>}
                      {proposal.status === 'withdrawn' && jobId && proposal.job?.status === 'open' && <Link to={`/jobs/${jobId}/propose`}><Button size="sm"><RotateCcw className="h-4 w-4" /> Apply again</Button></Link>}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">{proposal.coverLetter}</p>
                  {proposal.reviewNote && <div className="mt-3 rounded-lg bg-slate-50 p-3"><div className="text-xs font-medium uppercase tracking-wide text-slate-400">Client note</div><p className="mt-1 text-sm text-slate-700">{proposal.reviewNote}</p></div>}
                </li>
              );
            })}
          </ul>
          {pagination?.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
              <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
