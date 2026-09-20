import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Handshake, ListChecks, Pencil, RotateCcw, Sparkles, Star, ThumbsDown, Undo2 } from 'lucide-react';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { Textarea } from '../components/Textarea.jsx';
import {
  ACTIVE_PROPOSAL_STATUSES,
  ACTIVE_OFFER_STATUSES,
  OFFER_STATUS_LABELS,
  PROPOSAL_STATUS_BADGES,
  PROPOSAL_STATUS_LABELS,
} from '../constants/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDecideProposal, useProposal, useWithdrawProposal } from '../services/proposals.js';
import { timeAgo } from '../utils/format.js';

const idOf = (value) => value?._id || value?.id || value;
const bidLabel = (bid) => `${bid?.currency || 'USD'} ${Number(bid?.amount || 0).toLocaleString()}${bid?.type === 'hourly' ? '/hr' : ''}`;

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: proposal, isLoading, isError } = useProposal(id);
  const withdraw = useWithdrawProposal();
  const decide = useDecideProposal();
  const [note, setNote] = useState('');

  if (isLoading) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-80" /></div>;
  if (isError || !proposal) return <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-6 text-center text-red-700" role="alert">This proposal is unavailable or you do not have permission to view it.</div>;

  const isAuthor = String(idOf(proposal.freelancer)) === String(idOf(user));
  const isClient = String(proposal.client) === String(idOf(user));
  const active = ACTIVE_PROPOSAL_STATUSES.includes(proposal.status);
  const activeOffer = proposal.offer && ACTIVE_OFFER_STATUSES.includes(proposal.offer.status);
  const canCreateOffer = proposal.status === 'shortlisted' && (!proposal.offer || ['rejected', 'withdrawn'].includes(proposal.offer.status));
  const jobId = idOf(proposal.job);
  const reviewNote = note || proposal.reviewNote || '';

  const onWithdraw = () => {
    if (!window.confirm('Withdraw this proposal?')) return;
    withdraw.mutate(id, {
      onSuccess: () => toast.success('Proposal withdrawn'),
      onError: (error) => toast.error(apiErrorMessage(error)),
    });
  };
  const onDecision = (decision) => decide.mutate(
    { id, decision, reviewNote: reviewNote.trim() || undefined },
    {
      onSuccess: () => toast.success('Proposal updated'),
      onError: (error) => toast.error(apiErrorMessage(error)),
    },
  );

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Proposal</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PROPOSAL_STATUS_BADGES[proposal.status] || 'bg-slate-100 text-slate-600'}`}>{PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status}</span>
              {proposal.aiAssisted && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700"><Sparkles className="h-3.5 w-3.5" /> AI-assisted</span>}
            </div>
            {jobId && <Link to={`/jobs/${jobId}`} className="mt-1 block font-medium text-brand-700 hover:underline">{proposal.job?.title}</Link>}
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> Submitted {timeAgo(proposal.createdAt)}</p>
          </div>
          <div className="text-right"><div className="text-xl font-bold text-slate-900">{bidLabel(proposal.bid)}</div><div className="text-sm text-slate-500">{proposal.estimatedDays} days</div></div>
        </div>

        <section className="mt-6 border-t border-slate-100 pt-5">
          <h2 className="font-semibold text-slate-900">Cover letter</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{proposal.coverLetter}</p>
        </section>

        {proposal.milestones?.length > 0 && (
          <section className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><ListChecks className="h-4 w-4 text-brand-600" /> Milestones</h2>
            <ul className="mt-3 space-y-2">{proposal.milestones.map((milestone, index) => <li key={milestone._id || index} className="rounded-lg bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3 font-medium text-slate-800"><span>{milestone.title}</span><span>{proposal.bid?.currency || 'USD'} {Number(milestone.amount).toLocaleString()}</span></div>{milestone.description && <p className="mt-1 text-slate-500">{milestone.description}</p>}</li>)}</ul>
          </section>
        )}

        {proposal.reviewNote && <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Client note</div><p className="mt-1 text-sm text-slate-700">{proposal.reviewNote}</p></div>}

        {isAuthor && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            {active && <Link to={`/dashboard/proposals/${id}/edit`}><Button variant="secondary" size="sm"><Pencil className="h-4 w-4" /> Revise</Button></Link>}
            {active && <Button variant="ghost" size="sm" onClick={onWithdraw} loading={withdraw.isPending}><Undo2 className="h-4 w-4" /> Withdraw</Button>}
            {proposal.status === 'withdrawn' && proposal.job?.status === 'open' && <Link to={`/jobs/${jobId}/propose`}><Button size="sm"><RotateCcw className="h-4 w-4" /> Apply again</Button></Link>}
          </div>
        )}

        {isClient && !['withdrawn', 'accepted'].includes(proposal.status) && !activeOffer && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <Textarea label="Note for the freelancer (optional)" name="reviewNote" rows={3} value={reviewNote} onChange={(event) => setNote(event.target.value)} maxLength={1000} />
            <div className="mt-3 flex flex-wrap gap-2">
              {proposal.status !== 'shortlisted' && <Button size="sm" loading={decide.isPending} onClick={() => onDecision('shortlist')}><Star className="h-4 w-4" /> Shortlist</Button>}
              {proposal.status !== 'rejected' && <Button size="sm" variant="secondary" loading={decide.isPending} onClick={() => onDecision('reject')}><ThumbsDown className="h-4 w-4" /> Not a fit</Button>}
              {['shortlisted', 'rejected'].includes(proposal.status) && <Button size="sm" variant="ghost" loading={decide.isPending} onClick={() => onDecision('reconsider')}><RotateCcw className="h-4 w-4" /> Reconsider</Button>}
              {canCreateOffer && <Link to={`/dashboard/proposals/${id}/offer/new`}><Button size="sm"><Handshake className="h-4 w-4" /> {proposal.offer ? 'Create another offer' : 'Create offer'}</Button></Link>}
            </div>
          </div>
        )}
        {isClient && activeOffer && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600"><span>Offer: <strong>{OFFER_STATUS_LABELS[proposal.offer.status] || proposal.offer.status}</strong></span><Link to="/dashboard/offers" className="font-medium text-brand-700 hover:underline">Manage offer</Link></div>}
      </div>
    </div>
  );
}
