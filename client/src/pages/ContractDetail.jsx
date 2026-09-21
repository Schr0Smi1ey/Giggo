import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleStop, FileClock, PauseCircle, PlayCircle, ShieldCheck, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { CONTRACT_STATUS_BADGES, CONTRACT_STATUS_LABELS } from '../constants/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useContract, useTransitionContract } from '../services/contracts.js';
import { timeAgo } from '../utils/format.js';

const idOf = (value) => String(value?._id || value?.id || value || '');
const money = (contract) => `${contract?.budget?.currency || 'USD'} ${Number(contract?.budget?.amount || 0).toLocaleString()}${contract?.budget?.type === 'hourly' ? '/hr' : ''}`;
const dateLabel = (value) => value ? new Date(value).toLocaleDateString() : 'Not specified';
const ACTION_LABELS = { active: 'Resume contract', paused: 'Pause contract', completed: 'Complete contract', cancelled: 'Cancel contract' };

function StatusDialog({ action, note, pending, onNote, onClose, onSubmit }) {
  useEffect(() => {
    if (!action) return undefined;
    const close = (event) => { if (event.key === 'Escape' && !pending) onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [action, onClose, pending]);
  if (!action) return null;
  const cancelling = action === 'cancelled';
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"><form onSubmit={onSubmit} role="dialog" aria-modal="true" aria-labelledby="contract-action-title" className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="contract-action-title" className="font-semibold text-slate-900">{ACTION_LABELS[action]}?</h2><p className="mt-1 text-sm text-slate-500">{cancelling ? 'Cancellation is final and the reason becomes part of the audit history.' : 'This status change will be visible to both participants.'}</p></div><button type="button" onClick={onClose} disabled={pending} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close contract action"><X className="h-5 w-5" /></button></div><div className="mt-4"><Textarea label={cancelling ? 'Cancellation reason' : 'Audit note (optional)'} name="contractStatusNote" rows={3} maxLength={1000} value={note} onChange={(event) => onNote(event.target.value)} placeholder={cancelling ? 'Explain why this contract is being cancelled' : 'Add context for the other participant'} autoFocus /></div><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Keep current status</Button><Button type="submit" variant={cancelling ? 'danger' : 'primary'} loading={pending} disabled={cancelling && note.trim().length < 3}>{ACTION_LABELS[action]}</Button></div></form></div>;
}

export default function ContractDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: contract, isLoading, isError } = useContract(id);
  const transition = useTransitionContract();
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');

  if (isLoading) return <div className="mx-auto max-w-5xl space-y-4"><Skeleton className="h-28" /><Skeleton className="h-80" /></div>;
  if (isError || !contract) return <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-6 text-center text-red-700" role="alert">This contract is unavailable or you do not have permission to view it.</div>;

  const isClient = idOf(contract.client) === idOf(user);
  const counterpart = isClient ? contract.freelancer : contract.client;
  const actions = isClient
    ? contract.status === 'active' ? ['paused', 'completed', 'cancelled'] : contract.status === 'paused' ? ['active', 'cancelled'] : []
    : ['active', 'paused'].includes(contract.status) ? ['cancelled'] : [];
  const icons = { active: PlayCircle, paused: PauseCircle, completed: CheckCircle2, cancelled: CircleStop };
  const submit = (event) => {
    event.preventDefault();
    transition.mutate({ id, status: action, note: note.trim() }, {
      onSuccess: () => { toast.success(`Contract ${action}`); setAction(''); setNote(''); },
      onError: (error) => toast.error(apiErrorMessage(error, 'Could not update the contract')),
    });
  };
  const close = () => { if (!transition.isPending) { setAction(''); setNote(''); } };

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <StatusDialog action={action} note={note} pending={transition.isPending} onNote={setNote} onClose={close} onSubmit={submit} />
      <Link to="/dashboard/contracts" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Back to contracts</Link>
      <header className="mt-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1><span className={`rounded-full px-2 py-1 text-xs font-medium ${CONTRACT_STATUS_BADGES[contract.status]}`}>{CONTRACT_STATUS_LABELS[contract.status]}</span></div><p className="mt-1 text-sm text-slate-500">{contract.job?.title} · with {counterpart?.name || 'Marketplace user'}</p></div><div className="text-right"><strong className="text-lg text-slate-900">{money(contract)}</strong><p className="text-xs capitalize text-slate-500">{contract.budget?.type} contract</p></div></div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{contract.project && <Link to={`/dashboard/projects/${idOf(contract.project)}`} className="inline-flex rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Open project workspace</Link>}{actions.map((status) => { const Icon = icons[status]; return <Button key={status} size="sm" variant={status === 'cancelled' ? 'danger' : status === 'completed' ? 'primary' : 'secondary'} onClick={() => setAction(status)}><Icon className="h-4 w-4" /> {ACTION_LABELS[status]}</Button>; })}</div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5" aria-labelledby="terms-heading">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-600" /><h2 id="terms-heading" className="text-lg font-semibold text-slate-900">Accepted terms</h2></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{contract.description}</p><dl className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3"><div><dt className="text-xs text-slate-400">Delivery</dt><dd className="font-medium text-slate-700">{contract.estimatedDays} days</dd></div><div><dt className="text-xs text-slate-400">Start</dt><dd className="font-medium text-slate-700">{dateLabel(contract.startDate)}</dd></div><div><dt className="text-xs text-slate-400">End</dt><dd className="font-medium text-slate-700">{dateLabel(contract.endDate)}</dd></div></dl>{contract.terms && <div className="mt-5"><h3 className="font-medium text-slate-900">Additional terms</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{contract.terms}</p></div>}<div className="mt-5 border-t border-slate-100 pt-4"><Link to={`/dashboard/offers/${idOf(contract.offer)}`} className="text-sm font-medium text-brand-700 hover:underline">View accepted offer and negotiation</Link></div></div>
          {contract.milestones?.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Contract milestones</h2><ul className="mt-3 divide-y divide-slate-100">{contract.milestones.map((milestone) => <li key={idOf(milestone)} className="flex flex-wrap justify-between gap-3 py-3"><div><strong className="text-sm text-slate-800">{milestone.title}</strong>{milestone.description && <p className="mt-1 text-xs text-slate-500">{milestone.description}</p>}{milestone.dueDate && <p className="mt-1 text-xs text-slate-400">Due {dateLabel(milestone.dueDate)}</p>}</div><strong className="text-sm text-slate-800">{contract.budget.currency} {Number(milestone.amount).toLocaleString()}</strong></li>)}</ul></div>}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="history-heading"><div className="flex items-center gap-2"><FileClock className="h-5 w-5 text-brand-600" /><h2 id="history-heading" className="text-lg font-semibold text-slate-900">Status history</h2></div><ol className="mt-5 space-y-4">{[...(contract.statusHistory || [])].reverse().map((entry) => <li key={idOf(entry)} className="relative border-l-2 border-brand-100 pl-4"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-brand-500" /><div className="flex flex-wrap items-center gap-2"><strong className="text-sm capitalize text-slate-800">{entry.to}</strong><span className="text-xs text-slate-400">{timeAgo(entry.at)}</span></div><p className="mt-1 text-xs text-slate-500">{entry.actor?.name || 'Giggo system'} · {entry.actorRole}</p>{entry.note && <p className="mt-1 rounded-lg bg-slate-50 p-2 text-sm text-slate-600">{entry.note}</p>}</li>)}</ol></section>
      </div>
    </div>
  );
}
