import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Info, Lightbulb, ListChecks, Send, Sparkles, Wand2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { RepeatableList } from '../components/RepeatableList.jsx';
import { Select } from '../components/Select.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useJob } from '../services/jobs.js';
import { useDraftProposal } from '../services/ai.js';
import { useCreateProposal, useMyProposalForJob, useProposal, useUpdateProposal } from '../services/proposals.js';
import { formatBudget } from '../utils/format.js';
import { ACTIVE_PROPOSAL_STATUSES, PROPOSAL_TONE_OPTIONS } from '../constants/index.js';

const COVER_LETTER_MIN = 100;
const COVER_LETTER_MAX = 5000;
const MAX_MILESTONES = 10;
const CURRENCIES = ['USD', 'BDT', 'EUR', 'GBP'].map((value) => ({ value, label: value }));
const BID_TYPES = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'hourly', label: 'Hourly rate' },
];
const MILESTONE_FIELDS = [
  { name: 'title', label: 'Milestone', colSpan: 2, placeholder: 'e.g. Working prototype' },
  { name: 'amount', label: 'Amount', type: 'number' },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'description', label: 'Deliverables', type: 'textarea', placeholder: 'Describe what the client receives.' },
];
const EMPTY = {
  coverLetter: '',
  bid: { amount: '', type: 'fixed', currency: 'USD' },
  estimatedDays: '',
  milestones: [],
  aiAssisted: false,
};

const idOf = (value) => value?._id || value?.id || value;

function Notice({ title, children }) {
  return (
    <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" role="status">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <div className="mt-1 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export default function SubmitProposal({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = mode === 'edit';
  const { data: proposal, isLoading: editProposalLoading, isError: editProposalError } = useProposal(id, { enabled: isEdit });
  const jobId = isEdit ? idOf(proposal?.job) : id;
  const { data: job, isLoading: jobLoading, isError: jobError } = useJob(jobId, { enabled: Boolean(jobId) });
  const { data: existingProposal, isLoading: proposalLoading } = useMyProposalForJob(jobId, { enabled: !isEdit && Boolean(jobId) });
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const draftProposal = useDraftProposal();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [tone, setTone] = useState('professional');
  const [notes, setNotes] = useState('');
  const [draftInfo, setDraftInfo] = useState(null);

  useEffect(() => {
    if (!proposal) return;
    setForm({
      coverLetter: proposal.coverLetter || '',
      bid: {
        amount: proposal.bid?.amount ?? '',
        type: proposal.bid?.type || 'fixed',
        currency: proposal.bid?.currency || 'USD',
      },
      estimatedDays: proposal.estimatedDays ?? '',
      milestones: (proposal.milestones || []).map((milestone) => ({
        title: milestone.title || '',
        amount: milestone.amount ?? '',
        dueDate: milestone.dueDate ? String(milestone.dueDate).slice(0, 10) : '',
        description: milestone.description || '',
      })),
      aiAssisted: Boolean(proposal.aiAssisted),
    });
  }, [proposal]);

  useEffect(() => {
    if (isEdit || !job?.budget?.type) return;
    setForm((current) => ({ ...current, bid: { ...current.bid, type: job.budget.type } }));
  }, [isEdit, job?.budget?.type]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setBid = (field, value) => setForm((current) => ({ ...current, bid: { ...current.bid, [field]: value } }));

  const validate = () => {
    const next = {};
    const coverLength = form.coverLetter.trim().length;
    if (coverLength < COVER_LETTER_MIN) next.coverLetter = `Write at least ${COVER_LETTER_MIN} characters (${coverLength} so far)`;
    if (!(Number(form.bid.amount) > 0)) next.bid = 'Enter a bid greater than zero';
    if (!Number.isInteger(Number(form.estimatedDays)) || Number(form.estimatedDays) < 1) next.estimatedDays = 'Enter at least one day';
    const invalidMilestone = form.milestones.find((item) => (item.title || '').trim().length < 2 || !(Number(item.amount) > 0));
    if (invalidMilestone) next.milestones = 'Every milestone needs a title and an amount greater than zero';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = {
      coverLetter: form.coverLetter.trim(),
      bid: { amount: Number(form.bid.amount), type: form.bid.type, currency: form.bid.currency },
      estimatedDays: Number(form.estimatedDays),
      milestones: form.milestones.map((item) => ({
        title: item.title.trim(),
        amount: Number(item.amount),
        ...(item.dueDate ? { dueDate: item.dueDate } : {}),
        description: (item.description || '').trim(),
      })),
      aiAssisted: form.aiAssisted,
    };
    const mutation = isEdit ? updateProposal : createProposal;
    mutation.mutate(isEdit ? { id, ...payload } : { job: jobId, ...payload }, {
      onSuccess: () => { toast.success(isEdit ? 'Proposal updated' : 'Proposal submitted'); navigate('/dashboard/proposals'); },
      onError: (error) => toast.error(apiErrorMessage(error, 'Could not submit your proposal')),
    });
  };

  const generateDraft = async () => {
    try {
      const result = await draftProposal.mutateAsync({ job: jobId, tone, notes: notes.trim() });
      setDraftInfo(result);
      setForm((current) => ({
        ...current,
        coverLetter: result.coverLetter,
        aiAssisted: true,
        bid: {
          ...current.bid,
          amount: current.bid.amount || result.suggestedBid?.amount || '',
          type: result.suggestedBid?.type || current.bid.type,
          currency: result.suggestedBid?.currency || current.bid.currency,
        },
        estimatedDays: current.estimatedDays || result.suggestedDays || '',
      }));
      toast.success('Draft ready — review and edit it before submitting');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not generate a proposal draft'));
    }
  };

  if ((isEdit && editProposalLoading) || jobLoading || proposalLoading) {
    return <div className="mx-auto max-w-3xl space-y-4 px-4 py-8"><Skeleton className="h-24" /><Skeleton className="h-96" /></div>;
  }

  if (jobError || editProposalError || !job) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-slate-900">Job not available</h1>
        <p className="mt-2 text-sm text-slate-500">This job may have been closed or removed.</p>
        <Link to="/find-jobs" className="mt-6 inline-block"><Button variant="secondary">Browse jobs</Button></Link>
      </div>
    );
  }

  const isOwner = String(idOf(job.client)) === String(idOf(user));
  const existingBlocksSubmission = existingProposal && existingProposal.status !== 'withdrawn';
  const editBlocked = isEdit && proposal && (!ACTIVE_PROPOSAL_STATUSES.includes(proposal.status) || job.status !== 'open');
  const milestoneTotal = form.milestones.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  const busy = createProposal.isPending || updateProposal.isPending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
      <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to job
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">{isEdit ? 'Revise your proposal' : 'Submit a proposal'}</h1>
      <p className="mt-1 text-slate-500">{job.title} · <span className="font-medium text-slate-700">{formatBudget(job.budget)}</span></p>

      {isOwner ? (
        <Notice title="This is your job">You cannot submit a proposal to a job you posted.</Notice>
      ) : editBlocked ? (
        <Notice title="This proposal cannot be revised">
          {job.status !== 'open' ? 'The job is no longer open, so this proposal is read-only.' : <>A <span className="font-medium">{proposal.status}</span> proposal is read-only.</>}{' '}
          <Link to={`/dashboard/proposals/${id}`} className="font-medium text-brand-700 hover:underline">View proposal</Link>.
        </Notice>
      ) : existingBlocksSubmission ? (
        <Notice title="Proposal already submitted">
          Your proposal is currently <span className="font-medium">{existingProposal.status}</span>.{' '}
          <Link to={`/dashboard/proposals/${idOf(existingProposal)}`} className="font-medium text-brand-700 hover:underline">View it</Link>.
        </Notice>
      ) : (
        <>
          {!isEdit && existingProposal?.status === 'withdrawn' && <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Submitting again will reactivate and replace your withdrawn proposal.</p>}

          <section className="mt-6 rounded-xl border border-brand-100 bg-brand-50/40 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><Sparkles className="h-5 w-5 text-brand-600" /> Proposal draft assistant</h2>
            <p className="mt-1 text-sm text-slate-500">Creates an editable local draft from this job and your saved profile. It never submits for you.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Select label="Tone" name="tone" options={PROPOSAL_TONE_OPTIONS} value={tone} onChange={(event) => setTone(event.target.value)} />
              <div className="sm:col-span-2"><Input label="Anything to emphasize? (optional)" name="draftNotes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} placeholder="e.g. accessible charts and early feedback" /></div>
            </div>
            <Button type="button" variant="secondary" className="mt-3" onClick={generateDraft} loading={draftProposal.isPending}><Wand2 className="h-4 w-4" /> {form.coverLetter ? 'Regenerate draft' : 'Generate draft'}</Button>
            {draftInfo && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{draftInfo.disclaimer}</p></div>
                {draftInfo.talkingPoints?.length > 0 && <div className="rounded-lg border border-slate-200 bg-white p-3"><div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Lightbulb className="h-4 w-4 text-brand-600" /> Make it specific</div><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{draftInfo.talkingPoints.map((point) => <li key={point}>{point}</li>)}</ul></div>}
              </div>
            )}
          </section>

        <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
          <Textarea
            label="Cover letter"
            name="coverLetter"
            rows={10}
            value={form.coverLetter}
            onChange={(event) => setField('coverLetter', event.target.value)}
            error={errors.coverLetter}
            hint={`${form.coverLetter.trim().length} / ${COVER_LETTER_MAX} characters`}
            maxLength={COVER_LETTER_MAX}
            placeholder="Explain your relevant experience and how you will approach this job."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Bid type" name="bidType" options={BID_TYPES} value={form.bid.type} onChange={(event) => setBid('type', event.target.value)} />
            <Input
              label={form.bid.type === 'hourly' ? 'Hourly rate' : 'Total bid'}
              name="bidAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.bid.amount}
              onChange={(event) => setBid('amount', event.target.value)}
              error={errors.bid}
              hint={`Client budget: ${formatBudget(job.budget)}`}
            />
            <Select label="Currency" name="currency" options={CURRENCIES} value={form.bid.currency} onChange={(event) => setBid('currency', event.target.value)} />
          </div>

          <Input
            label="Estimated delivery time (days)"
            name="estimatedDays"
            type="number"
            min="1"
            max="3650"
            value={form.estimatedDays}
            onChange={(event) => setField('estimatedDays', event.target.value)}
            error={errors.estimatedDays}
          />

          <div>
            <RepeatableList
              title="Payment milestones (optional)"
              icon={ListChecks}
              fields={MILESTONE_FIELDS}
              value={form.milestones}
              onChange={(items) => setField('milestones', items.slice(0, MAX_MILESTONES))}
              addLabel="Add milestone"
              emptyText="No milestones added. The proposal will use one total bid."
              renderSummary={(item) => (
                <>
                  <div className="font-medium text-slate-900">{item.title || 'Untitled'} · {form.bid.currency} {Number(item.amount || 0).toLocaleString()}</div>
                  <div className="text-xs text-slate-500">{item.dueDate ? `Due ${item.dueDate}` : 'No due date'}{item.description ? ` · ${item.description}` : ''}</div>
                </>
              )}
            />
            {errors.milestones && <p className="mt-2 text-xs text-red-600" role="alert">{errors.milestones}</p>}
            {form.milestones.length > 0 && (
              <p className="mt-2 text-sm text-slate-500">Milestones total: {form.bid.currency} {milestoneTotal.toLocaleString()}</p>
            )}
          </div>

          <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.aiAssisted}
              onChange={(event) => setField('aiAssisted', event.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            I used AI assistance while drafting this proposal. This disclosure will be visible to the client.
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={busy}><Send className="h-4 w-4" aria-hidden="true" /> {isEdit ? 'Save changes' : 'Submit proposal'}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate(`/jobs/${jobId}`)}>Cancel</Button>
          </div>
        </form>
        </>
      )}
    </div>
  );
}
