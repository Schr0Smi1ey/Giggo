import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Clock, Eye, Inbox, ListChecks, RotateCcw, Sparkles, Star, ThumbsDown, X } from 'lucide-react';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { Select } from '../components/Select.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { VerificationBadges } from '../components/VerificationBadges.jsx';
import {
  PROPOSAL_SORTS,
  PROPOSAL_STATUS_BADGES,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS_OPTIONS,
} from '../constants/index.js';
import { useJob } from '../services/jobs.js';
import { useDecideProposal, useProposal, useReceivedProposals } from '../services/proposals.js';
import { fileUrl, initials, timeAgo } from '../utils/format.js';

const FILTERS = [{ value: '', label: 'All' }, ...PROPOSAL_STATUS_OPTIONS];
const idOf = (value) => value?._id || value?.id || value;
const bidLabel = (bid) => `${bid?.currency || 'USD'} ${Number(bid?.amount || 0).toLocaleString()}${bid?.type === 'hourly' ? '/hr' : ''}`;

export default function ProposalsReceived() {
  const [search, setSearch] = useSearchParams();
  const jobFilter = search.get('job') || '';
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const params = { page, limit: 10, sort, ...(status ? { status } : {}), ...(jobFilter ? { job: jobFilter } : {}) };
  const { data, isLoading, isError } = useReceivedProposals(params, { keepPreviousData: true });
  const { data: job } = useJob(jobFilter, { enabled: Boolean(jobFilter) });
  const decide = useDecideProposal();
  const items = data?.items || [];
  const pagination = data?.pagination;

  const chooseStatus = (value) => {
    setStatus(value);
    setPage(1);
  };
  const onDecide = (id, decision, reviewNote) => decide.mutate(
    { id, decision, reviewNote: reviewNote.trim() || undefined },
    {
      onSuccess: () => toast.success(decision === 'shortlist' ? 'Proposal shortlisted' : decision === 'reject' ? 'Proposal rejected' : 'Proposal returned to review'),
      onError: (error) => toast.error(apiErrorMessage(error, 'Could not update this proposal')),
    },
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Proposals received</h1>
      <p className="mt-1 text-slate-500">Review applicants, share notes, and manage your shortlist.</p>

      {jobFilter && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-brand-100 bg-brand-50/50 p-3 text-sm">
          <span className="text-slate-600">Showing proposals for</span>
          <Link to={`/jobs/${jobFilter}`} className="font-medium text-brand-700 hover:underline">{job?.title || 'this job'}</Link>
          <button type="button" onClick={() => setSearch({}, { replace: true })} className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-white"><X className="h-3.5 w-3.5" /> Show all jobs</button>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Filter received proposals by status">
          {FILTERS.map((filter) => (
            <button key={filter.value || 'all'} type="button" aria-pressed={status === filter.value} onClick={() => chooseStatus(filter.value)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === filter.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {filter.label}
            </button>
          ))}
        </div>
        <div className="w-48"><Select name="proposalSort" aria-label="Sort proposals" options={PROPOSAL_SORTS} value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} /></div>
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-44" />)}</div>
      ) : isError ? (
        <p className="mt-8 rounded-xl bg-red-50 p-5 text-red-700" role="alert">Could not load received proposals.</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-medium text-slate-700">No proposals found</p>
          <p className="mt-1 text-sm text-slate-500">{status ? 'Nothing matches this status.' : 'Freelancers will appear here when they apply.'}</p>
          <Link to="/dashboard/jobs" className="mt-4 inline-block"><Button size="sm">My jobs</Button></Link>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-4">
            {items.map((proposal) => (
              <ReceivedProposalCard
                key={idOf(proposal)}
                proposal={proposal}
                showJob={!jobFilter}
                onDecide={onDecide}
                busy={decide.isPending && decide.variables?.id === idOf(proposal)}
              />
            ))}
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

function ReceivedProposalCard({ proposal, showJob, onDecide, busy }) {
  const id = idOf(proposal);
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(proposal.reviewNote || '');
  const { data: detail } = useProposal(id, { enabled: expanded });
  const item = detail || proposal;
  const freelancer = item.freelancer || {};
  const profile = item.freelancerProfile || {};
  const decidable = !['withdrawn', 'accepted'].includes(item.status);

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        {freelancer.avatar ? <img src={fileUrl(freelancer.avatar)} alt={freelancer.name} className="h-12 w-12 shrink-0 rounded-full object-cover" /> : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">{initials(freelancer.name)}</div>}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/freelancers/${idOf(freelancer)}`} className="font-semibold text-slate-900 hover:text-brand-600">{freelancer.name || 'Freelancer'}</Link>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROPOSAL_STATUS_BADGES[item.status] || 'bg-slate-100 text-slate-600'}`}>{PROPOSAL_STATUS_LABELS[item.status] || item.status}</span>
            {item.aiAssisted && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700" title="The freelancer disclosed using an AI draft"><Sparkles className="h-3 w-3" /> AI-assisted</span>}
          </div>
          {profile.title && <p className="text-sm text-slate-600">{profile.title}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            {profile.hourlyRate > 0 && <span>USD {Number(profile.hourlyRate).toLocaleString()}/hr</span>}
            {profile.completeness > 0 && <span>{profile.completeness}% profile</span>}
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeAgo(item.createdAt)}</span>
            {item.viewedAt && <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Read</span>}
          </div>
        </div>
        <div className="shrink-0 text-right"><div className="font-semibold text-slate-900">{bidLabel(item.bid)}</div><div className="text-xs text-slate-400">{item.estimatedDays} days</div></div>
      </div>

      {showJob && item.job?.title && <p className="mt-3 text-xs text-slate-400">for <Link to={`/jobs/${idOf(item.job)}`} className="font-medium text-slate-600 hover:text-brand-600">{item.job.title}</Link></p>}
      <VerificationBadges badges={profile.badges || []} size="sm" className="mt-3" />
      {profile.skills?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{profile.skills.slice(0, 6).map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{skill}</span>)}</div>}
      <p className={`mt-3 whitespace-pre-line text-sm text-slate-600 ${expanded ? '' : 'line-clamp-3'}`}>{item.coverLetter}</p>

      {expanded && item.milestones?.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><ListChecks className="h-4 w-4 text-brand-600" /> Proposed milestones</div>
          <ul className="mt-2 space-y-2 text-sm">{item.milestones.map((milestone, index) => <li key={milestone._id || index} className="flex justify-between gap-3"><span className="text-slate-700">{milestone.title}{milestone.description && <span className="block text-xs text-slate-500">{milestone.description}</span>}</span><span className="shrink-0 text-slate-500">{item.bid?.currency || 'USD'} {Number(milestone.amount).toLocaleString()}</span></li>)}</ul>
        </div>
      )}

      <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        {expanded ? <><ChevronUp className="h-4 w-4" /> Show less</> : <><ChevronDown className="h-4 w-4" /> Read full proposal</>}
      </button>

      {decidable ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Textarea label="Note for the freelancer (optional)" name={`reviewNote-${id}`} rows={2} value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Share useful context with your decision." />
          <div className="mt-3 flex flex-wrap gap-2">
            {item.status !== 'shortlisted' && <Button size="sm" loading={busy} onClick={() => onDecide(id, 'shortlist', note)}><Star className="h-4 w-4" /> Shortlist</Button>}
            {item.status !== 'rejected' && <Button size="sm" variant="secondary" loading={busy} onClick={() => onDecide(id, 'reject', note)}><ThumbsDown className="h-4 w-4" /> Not a fit</Button>}
            {['shortlisted', 'rejected'].includes(item.status) && <Button size="sm" variant="ghost" loading={busy} onClick={() => onDecide(id, 'reconsider', note)}><RotateCcw className="h-4 w-4" /> Reconsider</Button>}
          </div>
          <p className="mt-2 text-xs text-slate-400">Shortlisting is not hiring. Offers and contracts are handled separately.</p>
        </div>
      ) : <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">{item.status === 'withdrawn' ? 'The freelancer withdrew this proposal.' : 'This proposal is already tied to a hiring decision.'}</p>}
    </li>
  );
}
