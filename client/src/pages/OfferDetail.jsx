import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileClock,
  MessageSquare,
  Pencil,
  RefreshCw,
  Send,
  ShieldCheck,
  Undo2,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { OFFER_STATUS_BADGES, OFFER_STATUS_LABELS } from '../constants/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  useAcceptOffer,
  useOffer,
  useRejectOffer,
  useRequestOfferChanges,
  useSendOfferMessage,
  useWithdrawOffer,
} from '../services/offers.js';
import { timeAgo } from '../utils/format.js';

const idOf = (value) => value?._id || value?.id || value;
const money = (value) => `${value?.budget?.currency || 'USD'} ${Number(value?.budget?.amount || 0).toLocaleString()}${value?.budget?.type === 'hourly' ? '/hr' : ''}`;
const dateLabel = (value) => (value ? new Date(value).toLocaleDateString() : 'Not specified');

function revisionChanges(current, previous) {
  if (!previous) return ['Initial published offer'];
  const changes = [];
  if (current.title !== previous.title) changes.push('Title');
  if (current.description !== previous.description) changes.push('Scope');
  if (JSON.stringify(current.budget) !== JSON.stringify(previous.budget)) changes.push('Budget');
  if (current.estimatedDays !== previous.estimatedDays) changes.push('Delivery time');
  if (dateLabel(current.startDate) !== dateLabel(previous.startDate)) changes.push('Start date');
  if (dateLabel(current.endDate) !== dateLabel(previous.endDate)) changes.push('End date');
  if (dateLabel(current.expiresAt) !== dateLabel(previous.expiresAt)) changes.push('Expiration');
  if (current.terms !== previous.terms) changes.push('Additional terms');
  if (JSON.stringify(current.milestones) !== JSON.stringify(previous.milestones)) changes.push('Milestones');
  return changes.length ? changes : ['Republished without term changes'];
}

function RevisionCard({ revision, previous, accepted }) {
  const changes = revisionChanges(revision, previous);
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4" open={accepted}>
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-900">Revision {revision.number}</strong>
              {accepted && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Accepted version</span>}
            </div>
            <p className="mt-1 text-xs text-slate-500">Published {timeAgo(revision.publishedAt)}</p>
          </div>
          <span className="font-semibold text-slate-800">{money(revision)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">{changes.map((change) => <span key={change} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{change}</span>)}</div>
      </summary>
      <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
        <h3 className="font-semibold text-slate-900">{revision.title}</h3>
        <p className="mt-2 whitespace-pre-line leading-6">{revision.description}</p>
        <dl className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-3">
          <div><dt className="text-xs text-slate-400">Delivery</dt><dd className="font-medium text-slate-700">{revision.estimatedDays} days</dd></div>
          <div><dt className="text-xs text-slate-400">Start</dt><dd className="font-medium text-slate-700">{dateLabel(revision.startDate)}</dd></div>
          <div><dt className="text-xs text-slate-400">End</dt><dd className="font-medium text-slate-700">{dateLabel(revision.endDate)}</dd></div>
        </dl>
        {revision.terms && <div className="mt-4"><h4 className="font-medium text-slate-900">Additional terms</h4><p className="mt-1 whitespace-pre-line">{revision.terms}</p></div>}
        {revision.milestones?.length > 0 && <div className="mt-4"><h4 className="font-medium text-slate-900">Milestones</h4><ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">{revision.milestones.map((milestone, index) => <li key={milestone._id || index} className="flex justify-between gap-3 p-3"><span>{milestone.title}{milestone.description && <span className="block text-xs text-slate-500">{milestone.description}</span>}</span><strong>{revision.budget?.currency || 'USD'} {Number(milestone.amount || 0).toLocaleString()}</strong></li>)}</ul></div>}
      </div>
    </details>
  );
}

export default function OfferDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: offer, isLoading, isError, refetch } = useOffer(id, {
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
  const [message, setMessage] = useState('');
  const [changeRequest, setChangeRequest] = useState('');
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const conversationEndRef = useRef(null);
  const accept = useAcceptOffer();
  const reject = useRejectOffer();
  const withdraw = useWithdrawOffer();
  const requestChanges = useRequestOfferChanges();
  const sendMessage = useSendOfferMessage();

  const revisionsAscending = useMemo(() => [...(offer?.revisions || [])].sort((a, b) => a.number - b.number), [offer?.revisions]);
  const revisionsDescending = [...revisionsAscending].reverse();
  const acceptedRevisionId = idOf(offer?.acceptedRevision);
  const busy = accept.isPending || reject.isPending || withdraw.isPending || requestChanges.isPending;

  useEffect(() => {
    if (!offer?.messages?.length) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    conversationEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }, [offer?.messages?.length]);

  const run = (mutation, variables, success) => mutation.mutate(variables, {
    onSuccess: () => { toast.success(success); setShowChangeRequest(false); setChangeRequest(''); },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not update the offer')),
  });

  const submitMessage = (event) => {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;
    sendMessage.mutate({
      id,
      message: body,
      sender: user,
      senderRole: idOf(offer.client) === idOf(user) ? 'client' : 'freelancer',
    }, {
      onSuccess: () => setMessage(''),
      onError: (error) => toast.error(apiErrorMessage(error, 'Could not send the message')),
    });
  };

  const submitChangeRequest = () => {
    const body = changeRequest.trim();
    if (body.length < 3) return toast.error('Describe the requested change');
    run(requestChanges, { id, message: body }, 'Change request sent');
  };

  if (isLoading) return <div className="mx-auto max-w-5xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-80" /></div>;
  if (isError || !offer) return <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-6 text-center text-red-700" role="alert">This negotiation is unavailable or you do not have permission to view it.</div>;

  const isClient = idOf(offer.client) === idOf(user);
  const counterpart = isClient ? offer.freelancer : offer.client;
  const canMessage = Boolean(offer.sentAt) && !['rejected', 'withdrawn'].includes(offer.status);
  const refreshNow = async () => {
    setManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <Link to="/dashboard/offers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Back to offers</Link>
      <header className="mt-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-slate-900">{offer.title}</h1><span className={`rounded-full px-2 py-1 text-xs font-medium ${OFFER_STATUS_BADGES[offer.status] || 'bg-slate-100 text-slate-600'}`}>{OFFER_STATUS_LABELS[offer.status] || offer.status}</span></div>
            <p className="mt-1 text-sm text-slate-500">Negotiation with {counterpart?.name || 'Marketplace user'} for {offer.job?.title}</p>
          </div>
          <Button type="button" size="sm" variant="ghost" loading={manualRefreshing} onClick={refreshNow}><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </div>
        {offer.revisionPending && <p className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-800">The client is preparing revision {offer.revision}. You are still viewing published revision {offer.displayRevision}.</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {isClient && ['draft', 'sent', 'changes_requested', 'revising'].includes(offer.status) && <Link to={`/dashboard/offers/${id}/edit`}><Button size="sm"><Pencil className="h-4 w-4" /> Revise terms</Button></Link>}
          {isClient && ['draft', 'sent', 'changes_requested', 'revising'].includes(offer.status) && <Button size="sm" variant="ghost" loading={busy} onClick={() => { if (window.confirm('Withdraw this offer?')) run(withdraw, id, 'Offer withdrawn'); }}><Undo2 className="h-4 w-4" /> Withdraw</Button>}
          {!isClient && offer.status === 'sent' && <><Button size="sm" loading={busy} onClick={() => run(accept, { id, revision: offer.revision }, `Revision ${offer.revision} accepted`)}><CheckCircle2 className="h-4 w-4" /> Accept revision {offer.revision}</Button><Button size="sm" variant="secondary" disabled={busy} onClick={() => setShowChangeRequest(true)}><Clock3 className="h-4 w-4" /> Request changes</Button><Button size="sm" variant="ghost" loading={busy} onClick={() => run(reject, id, 'Offer declined')}><XCircle className="h-4 w-4" /> Decline</Button></>}
        </div>
        {showChangeRequest && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><Textarea label="What should the client change?" rows={3} value={changeRequest} onChange={(event) => setChangeRequest(event.target.value)} maxLength={1000} /><div className="mt-3 flex gap-2"><Button size="sm" loading={busy} onClick={submitChangeRequest}>Send request</Button><Button size="sm" variant="ghost" onClick={() => setShowChangeRequest(false)}>Cancel</Button></div></div>}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section aria-labelledby="versions-heading">
          <div className="mb-3 flex items-center gap-2"><FileClock className="h-5 w-5 text-brand-600" /><h2 id="versions-heading" className="text-lg font-semibold text-slate-900">Offer versions</h2></div>
          {revisionsDescending.length ? <div className="space-y-3">{revisionsDescending.map((revision) => {
            const index = revisionsAscending.findIndex((item) => idOf(item) === idOf(revision));
            return <RevisionCard key={idOf(revision)} revision={revision} previous={revisionsAscending[index - 1]} accepted={acceptedRevisionId === idOf(revision)} />;
          })}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No published version yet. The client is still preparing the first offer.</div>}
        </section>

        <section aria-labelledby="conversation-heading">
          <div className="mb-3 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-brand-600" /><h2 id="conversation-heading" className="text-lg font-semibold text-slate-900">Negotiation conversation</h2></div>
          <div className="flex h-[28rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:h-[34rem]">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4" aria-live="polite">
              {(offer.messages || []).length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No conversation yet.</p> : offer.messages.map((item) => {
                const mine = idOf(item.sender) === idOf(user);
                if (item.kind === 'system') return <div key={idOf(item)} className="flex justify-center"><p className="rounded-full bg-slate-100 px-3 py-1.5 text-center text-xs text-slate-500">{item.body} · {timeAgo(item.createdAt)}</p></div>;
                return <div key={idOf(item)} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-xl px-3 py-2 ${item.kind === 'change_request' ? 'border border-amber-200 bg-amber-50 text-amber-900' : mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'} ${item.pending ? 'opacity-70' : ''}`}><p className="text-xs font-medium opacity-75">{item.kind === 'change_request' ? `Change request for revision ${item.revision}` : item.sender?.name || item.senderRole}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{item.body}</p><p className="mt-1 text-[11px] opacity-60">{item.pending ? 'Sending…' : timeAgo(item.createdAt)}</p></div></div>;
              })}
              <div ref={conversationEndRef} />
            </div>
            {canMessage && <form onSubmit={submitMessage} className="shrink-0 border-t border-slate-200 bg-white p-4"><Textarea label="Message" name="offerMessage" rows={3} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} placeholder="Discuss the work. Put agreed term changes into a new offer revision." /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-1 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5" /> {offer.canShareContact ? 'The offer is accepted; contact details may now be shared.' : 'Keep contact details on Giggo until the offer is accepted.'}</p><p className="mt-1 text-xs text-slate-400">New messages appear automatically.</p></div><Button type="submit" size="sm" loading={sendMessage.isPending} disabled={!message.trim()}><Send className="h-4 w-4" /> Send</Button></div></form>}
          </div>
        </section>
      </div>
    </div>
  );
}
