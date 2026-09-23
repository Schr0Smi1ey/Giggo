import { useState } from 'react';
import { CheckCircle2, Clock, FileSignature, MessageSquare, Pencil, Send, Undo2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { OFFER_STATUS_BADGES, OFFER_STATUS_LABELS, OFFER_STATUS_OPTIONS } from '../constants/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAcceptOffer, useOffers, useRejectOffer, useRequestOfferChanges, useSendOffer, useWithdrawOffer } from '../services/offers.js';
import { timeAgo } from '../utils/format.js';

const FILTERS = [{ value: '', label: 'All' }, ...OFFER_STATUS_OPTIONS];
const idOf = (value) => value?._id || value?.id || value;
const money = (offer) => `${offer.budget?.currency || 'USD'} ${Number(offer.budget?.amount || 0).toLocaleString()}${offer.budget?.type === 'hourly' ? '/hr' : ''}`;

export default function MyOffers() {
  const { hasRole } = useAuth();
  const isClient = hasRole('client');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const params = { page, limit: 10, ...(status ? { status } : {}) };
  const { data, isLoading, isError } = useOffers(params, { keepPreviousData: true });
  const items = data?.items || [];
  const pagination = data?.pagination;
  const availableFilters = isClient ? FILTERS : FILTERS.filter((filter) => filter.value !== 'draft');

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <h1 className="text-2xl font-bold text-slate-900">{isClient ? 'Offers sent' : 'My offers'}</h1>
      <p className="mt-1 text-slate-500">{isClient ? 'Manage offer terms and track freelancer responses.' : 'Review and respond to offers from clients.'}</p>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter offers by status">
        {availableFilters.map((filter) => <button key={filter.value || 'all'} type="button" aria-pressed={status === filter.value} onClick={() => { setStatus(filter.value); setPage(1); }} className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === filter.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{filter.label}</button>)}
      </div>

      {isLoading ? <div className="mt-5 space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-52" />)}</div>
        : isError ? <p className="mt-8 rounded-xl bg-red-50 p-5 text-red-700" role="alert">Could not load offers.</p>
          : items.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center"><FileSignature className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 font-medium text-slate-700">No offers found</p><p className="mt-1 text-sm text-slate-500">{isClient ? 'Create an offer from a shortlisted proposal.' : 'Offers sent by clients will appear here.'}</p>{isClient && <Link to="/dashboard/proposals/received" className="mt-4 inline-block"><Button size="sm">Review proposals</Button></Link>}</div>
            : <ul className="mt-5 space-y-4">{items.map((offer) => <OfferCard key={idOf(offer)} offer={offer} isClient={isClient} />)}</ul>}

      {pagination?.totalPages > 1 && <div className="mt-6 flex items-center justify-center gap-3"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span><Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
    </div>
  );
}

function OfferCard({ offer, isClient }) {
  const id = idOf(offer);
  const [changeRequest, setChangeRequest] = useState('');
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const send = useSendOffer();
  const withdraw = useWithdrawOffer();
  const accept = useAcceptOffer();
  const reject = useRejectOffer();
  const requestChanges = useRequestOfferChanges();
  const busy = send.isPending || withdraw.isPending || accept.isPending || reject.isPending || requestChanges.isPending;

  const run = (mutation, success, variables = id) => mutation.mutate(variables, {
    onSuccess: () => { toast.success(success); setShowChangeRequest(false); setChangeRequest(''); },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not update the offer')),
  });
  const confirmWithdraw = () => {
    if (window.confirm('Withdraw this offer? The freelancer will no longer be able to accept it.')) run(withdraw, 'Offer withdrawn');
  };
  const submitChangeRequest = () => {
    if (changeRequest.trim().length < 3) return toast.error('Describe the requested change');
    run(requestChanges, 'Change request sent', { id, message: changeRequest.trim() });
  };
  const counterpart = isClient ? offer.freelancer : offer.client;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{offer.title}</h2><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OFFER_STATUS_BADGES[offer.status] || 'bg-slate-100 text-slate-600'}`}>{OFFER_STATUS_LABELS[offer.status] || offer.status}</span><span className="text-xs text-slate-400">Revision {offer.displayRevision || offer.revision}</span></div><p className="mt-1 text-sm text-slate-500">{isClient ? 'For' : 'From'} {counterpart?.name || 'Marketplace user'} · {offer.job?.title}</p></div>
        <div className="text-right"><div className="font-semibold text-slate-900">{money(offer)}</div><div className="text-xs text-slate-400">{offer.estimatedDays} days</div></div>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{offer.description}</p>
      <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3"><div><span className="text-xs text-slate-400">Sent</span><p className="font-medium text-slate-700">{offer.sentAt ? timeAgo(offer.sentAt) : 'Not sent'}</p></div><div><span className="text-xs text-slate-400">Starts</span><p className="font-medium text-slate-700">{offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'As agreed'}</p></div><div><span className="text-xs text-slate-400">Expires</span><p className="font-medium text-slate-700">{offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : 'After sending'}</p></div></div>
      {offer.terms && <div className="mt-4"><h3 className="text-sm font-semibold text-slate-900">Additional terms</h3><p className="mt-1 whitespace-pre-line text-sm text-slate-600">{offer.terms}</p></div>}
      {offer.milestones?.length > 0 && <div className="mt-4"><h3 className="text-sm font-semibold text-slate-900">Milestones</h3><ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">{offer.milestones.map((milestone, index) => <li key={milestone._id || index} className="flex justify-between gap-3 p-3 text-sm"><span>{milestone.title}{milestone.description && <span className="block text-xs text-slate-500">{milestone.description}</span>}</span><strong className="shrink-0">{offer.budget?.currency || 'USD'} {Number(milestone.amount || 0).toLocaleString()}</strong></li>)}</ul></div>}
      {offer.changeRequest && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Requested change</p><p className="mt-1 text-sm text-amber-900">{offer.changeRequest}</p></div>}
      {showChangeRequest && <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"><Textarea label="What should the client change?" rows={3} value={changeRequest} onChange={(event) => setChangeRequest(event.target.value)} maxLength={1000} /><div className="mt-3 flex gap-2"><Button size="sm" onClick={submitChangeRequest} loading={busy}>Send request</Button><Button size="sm" variant="ghost" onClick={() => setShowChangeRequest(false)}>Cancel</Button></div></div>}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {offer.sentAt && <Link to={`/dashboard/offers/${id}`}><Button size="sm" variant="secondary"><MessageSquare className="h-4 w-4" /> Open negotiation</Button></Link>}
        {isClient && ['draft', 'sent', 'changes_requested', 'revising'].includes(offer.status) && <Link to={`/dashboard/offers/${id}/edit`}><Button size="sm" variant="secondary"><Pencil className="h-4 w-4" /> Revise</Button></Link>}
        {isClient && ['draft', 'revising'].includes(offer.status) && <Button size="sm" onClick={() => run(send, 'Offer sent')} loading={busy}><Send className="h-4 w-4" /> Send</Button>}
        {isClient && ['draft', 'sent', 'changes_requested', 'revising'].includes(offer.status) && <Button size="sm" variant="ghost" onClick={confirmWithdraw} loading={busy}><Undo2 className="h-4 w-4" /> Withdraw</Button>}
        {!isClient && offer.status === 'sent' && <><Button size="sm" onClick={() => run(accept, 'Offer accepted and contract activated.', { id, revision: offer.revision })} loading={busy}><CheckCircle2 className="h-4 w-4" /> Accept revision {offer.revision}</Button><Button size="sm" variant="secondary" onClick={() => setShowChangeRequest(true)} disabled={busy}><Clock className="h-4 w-4" /> Request changes</Button><Button size="sm" variant="ghost" onClick={() => run(reject, 'Offer declined')} loading={busy}><XCircle className="h-4 w-4" /> Decline</Button></>}
        {offer.status === 'accepted' && offer.contract && <Link to={`/dashboard/contracts/${idOf(offer.contract)}`}><Button size="sm"><FileSignature className="h-4 w-4" /> Open contract</Button></Link>}
      </div>
      {offer.status === 'accepted' && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Offer accepted. Its terms are locked into the active contract.</p>}
    </li>
  );
}
