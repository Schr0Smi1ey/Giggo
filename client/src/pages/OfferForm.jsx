import { useEffect, useState } from 'react';
import { ArrowLeft, Handshake, ListChecks, Save, Send } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { RepeatableList } from '../components/RepeatableList.jsx';
import { Select } from '../components/Select.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { useCreateOffer, useOffer, useSendOffer, useUpdateOffer } from '../services/offers.js';
import { useProposal } from '../services/proposals.js';

const CURRENCIES = ['USD', 'BDT', 'EUR', 'GBP'].map((value) => ({ value, label: value }));
const OFFER_TYPES = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'hourly', label: 'Hourly rate' },
];
const MILESTONE_FIELDS = [
  { name: 'title', label: 'Milestone', colSpan: 2, placeholder: 'e.g. Working release' },
  { name: 'amount', label: 'Amount', type: 'number' },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'description', label: 'Deliverables', type: 'textarea', placeholder: 'Describe what will be delivered.' },
];

const futureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const dateInput = (value) => (value ? String(value).slice(0, 10) : '');
const idOf = (value) => value?._id || value?.id || value;
const EMPTY = {
  title: '',
  description: '',
  budget: { amount: '', type: 'fixed', currency: 'USD' },
  estimatedDays: '',
  startDate: '',
  endDate: '',
  expiresAt: futureDate(7),
  terms: '',
  milestones: [],
};

function offerFormValue(source) {
  return {
    title: source.title || '',
    description: source.description || '',
    budget: {
      amount: source.budget?.amount ?? '',
      type: source.budget?.type || 'fixed',
      currency: source.budget?.currency || 'USD',
    },
    estimatedDays: source.estimatedDays ?? '',
    startDate: dateInput(source.startDate),
    endDate: dateInput(source.endDate),
    expiresAt: dateInput(source.expiresAt) || futureDate(7),
    terms: source.terms || '',
    milestones: (source.milestones || []).map((milestone) => ({
      title: milestone.title || '',
      amount: milestone.amount ?? '',
      dueDate: dateInput(milestone.dueDate),
      description: milestone.description || '',
    })),
  };
}

export default function OfferForm({ mode = 'create' }) {
  const { proposalId, id } = useParams();
  const isEdit = mode === 'edit';
  const navigate = useNavigate();
  const { data: proposal, isLoading: proposalLoading, isError: proposalError } = useProposal(proposalId, { enabled: !isEdit });
  const { data: offer, isLoading: offerLoading, isError: offerError } = useOffer(id, { enabled: isEdit });
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const sendOffer = useSendOffer();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit || !proposal) return;
    setForm(offerFormValue({
      title: proposal.job?.title || 'Marketplace engagement',
      description: `Offer based on the shortlisted proposal. ${(proposal.coverLetter || '').slice(0, 600)}`,
      budget: proposal.bid,
      estimatedDays: proposal.estimatedDays,
      milestones: proposal.bid?.type === 'fixed' ? proposal.milestones : [],
    }));
  }, [isEdit, proposal]);

  useEffect(() => {
    if (offer) setForm(offerFormValue(offer));
  }, [offer]);

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const setBudget = (name, value) => setForm((current) => ({
    ...current,
    budget: { ...current.budget, [name]: value },
    ...(name === 'type' && value === 'hourly' ? { milestones: [] } : {}),
  }));

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 2) next.title = 'Enter an offer title';
    if (form.description.trim().length < 20) next.description = 'Write at least 20 characters';
    if (!(Number(form.budget.amount) > 0)) next.budget = 'Enter an amount greater than zero';
    if (!Number.isInteger(Number(form.estimatedDays)) || Number(form.estimatedDays) < 1) next.estimatedDays = 'Enter at least one day';
    if (form.startDate && form.endDate && form.endDate <= form.startDate) next.endDate = 'End date must be after the start date';
    if (form.expiresAt && form.expiresAt <= new Date().toISOString().slice(0, 10)) next.expiresAt = 'Choose a future date';
    const invalidMilestone = form.milestones.find((item) => item.title.trim().length < 2 || !(Number(item.amount) > 0));
    if (invalidMilestone) next.milestones = 'Every milestone needs a title and an amount greater than zero';
    const milestoneTotal = form.milestones.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    if (form.budget.type === 'fixed' && form.milestones.length > 0 && Math.abs(milestoneTotal - Number(form.budget.amount)) > 0.01) {
      next.milestones = 'Milestone amounts must equal the total offer amount';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const payload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    budget: { amount: Number(form.budget.amount), type: form.budget.type, currency: form.budget.currency },
    estimatedDays: Number(form.estimatedDays),
    ...(form.startDate ? { startDate: form.startDate } : {}),
    ...(form.endDate ? { endDate: form.endDate } : {}),
    ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
    terms: form.terms.trim(),
    milestones: form.milestones.map((item) => ({
      title: item.title.trim(),
      amount: Number(item.amount),
      ...(item.dueDate ? { dueDate: item.dueDate } : {}),
      description: (item.description || '').trim(),
    })),
  });

  const save = async (event, shouldSend) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      const saved = isEdit
        ? await updateOffer.mutateAsync({ id, ...payload() })
        : await createOffer.mutateAsync({ proposal: proposalId, ...payload() });
      if (shouldSend) {
        await sendOffer.mutateAsync(idOf(saved));
        toast.success(isEdit ? 'Revised offer sent' : 'Offer sent');
      } else {
        toast.success(isEdit ? 'Offer revision saved as a draft' : 'Offer draft saved');
      }
      navigate('/dashboard/offers');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not save the offer'));
    }
  };

  if (proposalLoading || offerLoading) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-96" /></div>;
  if (proposalError || offerError || (!isEdit && !proposal) || (isEdit && !offer)) {
    return <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-6 text-center text-red-700" role="alert">This offer source is unavailable or you do not have permission to use it.</div>;
  }

  const sourceStatus = isEdit ? offer.status : proposal.status;
  const editBlocked = isEdit && !['draft', 'sent', 'changes_requested', 'revising'].includes(offer.status);
  const createBlocked = !isEdit && proposal.status !== 'shortlisted';
  const busy = createOffer.isPending || updateOffer.isPending || sendOffer.isPending;
  const milestoneTotal = form.milestones.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <Link to={isEdit ? '/dashboard/offers' : `/dashboard/proposals/${proposalId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="mt-3 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700"><Handshake className="h-5 w-5" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Revise offer' : 'Create an offer'}</h1><p className="text-sm text-slate-500">{isEdit ? offer.job?.title : proposal.job?.title}</p></div>
      </div>

      {(editBlocked || createBlocked) ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800" role="status">A {sourceStatus} record cannot be used to create or revise this offer.</div>
      ) : (
        <form className="mt-6 space-y-5" onSubmit={(event) => save(event, false)} noValidate>
          {isEdit && ['sent', 'changes_requested'].includes(offer.status) && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Saving starts a new revision. The freelancer will continue seeing the last published version until you send this revision.</p>}
          {offer?.changeRequest && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Freelancer requested changes</p><p className="mt-1 text-sm text-amber-900">{offer.changeRequest}</p></div>}
          <Input label="Offer title" name="title" value={form.title} onChange={(event) => setField('title', event.target.value)} error={errors.title} maxLength={150} />
          <Textarea label="Scope and deliverables" name="description" rows={7} value={form.description} onChange={(event) => setField('description', event.target.value)} error={errors.description} maxLength={5000} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Engagement type" name="offerType" options={OFFER_TYPES} value={form.budget.type} onChange={(event) => setBudget('type', event.target.value)} />
            <Input label={form.budget.type === 'hourly' ? 'Hourly rate' : 'Total amount'} name="amount" type="number" min="0.01" step="0.01" value={form.budget.amount} onChange={(event) => setBudget('amount', event.target.value)} error={errors.budget} />
            <Select label="Currency" name="currency" options={CURRENCIES} value={form.budget.currency} onChange={(event) => setBudget('currency', event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Estimated days" name="estimatedDays" type="number" min="1" max="3650" value={form.estimatedDays} onChange={(event) => setField('estimatedDays', event.target.value)} error={errors.estimatedDays} />
            <Input label="Offer expires" name="expiresAt" type="date" value={form.expiresAt} onChange={(event) => setField('expiresAt', event.target.value)} error={errors.expiresAt} />
            <Input label="Expected start (optional)" name="startDate" type="date" value={form.startDate} onChange={(event) => setField('startDate', event.target.value)} />
            <Input label="Expected end (optional)" name="endDate" type="date" value={form.endDate} onChange={(event) => setField('endDate', event.target.value)} error={errors.endDate} />
          </div>
          <Textarea label="Additional terms (optional)" name="terms" rows={4} value={form.terms} onChange={(event) => setField('terms', event.target.value)} maxLength={5000} />
          {form.budget.type === 'fixed' && (
            <div>
              <RepeatableList title="Payment milestones (optional)" icon={ListChecks} fields={MILESTONE_FIELDS} value={form.milestones} onChange={(items) => setField('milestones', items.slice(0, 10))} addLabel="Add milestone" emptyText="No milestones added. The offer will use one total amount." renderSummary={(item) => <><div className="font-medium text-slate-900">{item.title || 'Untitled'} · {form.budget.currency} {Number(item.amount || 0).toLocaleString()}</div><div className="text-xs text-slate-500">{item.dueDate ? `Due ${item.dueDate}` : 'No due date'}{item.description ? ` · ${item.description}` : ''}</div></>} />
              {errors.milestones && <p className="mt-2 text-xs text-red-600" role="alert">{errors.milestones}</p>}
              {form.milestones.length > 0 && <p className="mt-2 text-sm text-slate-500">Milestones total: {form.budget.currency} {milestoneTotal.toLocaleString()}</p>}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" variant="secondary" loading={busy}><Save className="h-4 w-4" /> Save draft</Button>
            <Button type="button" loading={busy} onClick={(event) => save(event, true)}><Send className="h-4 w-4" /> {isEdit ? 'Save and send revision' : 'Save and send offer'}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/offers')}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
