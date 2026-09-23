import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  FileCheck2,
  History,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import {
  useReviewMilestoneSubmission,
  useStartMilestone,
  useSubmitMilestoneWork,
} from '../services/projects.js';
import { timeAgo } from '../utils/format.js';
import { Button } from './Button.jsx';
import { Textarea } from './Textarea.jsx';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In progress',
  submitted: 'Awaiting review',
  revision_requested: 'Revision requested',
  approved: 'Approved',
};
const STATUS_STYLES = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  submitted: 'bg-violet-50 text-violet-700',
  revision_requested: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
};
const SUBMISSION_STYLES = {
  submitted: 'bg-violet-50 text-violet-700',
  revision_requested: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
};

const idOf = (value) => String(value?._id || value?.id || value || '');
const dateLabel = (value) => value ? new Date(value).toLocaleDateString() : '';

function parseLinks(value) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

function validLinks(items) {
  if (items.length > 10) return false;
  return items.every((item) => {
    try {
      const value = new URL(item);
      return ['http:', 'https:'].includes(value.protocol);
    } catch {
      return false;
    }
  });
}

function MilestoneIcon({ status }) {
  if (status === 'approved') return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
  if (status === 'in_progress' || status === 'submitted') return <Clock3 className="h-5 w-5 text-blue-600" aria-hidden="true" />;
  if (status === 'revision_requested') return <RotateCcw className="h-5 w-5 text-amber-600" aria-hidden="true" />;
  return <Circle className="h-5 w-5 text-slate-300" aria-hidden="true" />;
}

function ActionDialog({ dialog, pending, onClose, onSubmit }) {
  const [description, setDescription] = useState('');
  const [linksText, setLinksText] = useState('');
  const [feedback, setFeedback] = useState('');
  const links = useMemo(() => parseLinks(linksText), [linksText]);
  const linksAreValid = validLinks(links);

  useEffect(() => {
    if (!dialog) return;
    setDescription('');
    setLinksText('');
    setFeedback('');
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return undefined;
    const close = (event) => { if (event.key === 'Escape' && !pending) onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [dialog, onClose, pending]);

  if (!dialog) return null;
  const submitting = dialog.kind === 'submit';
  const revising = dialog.kind === 'revision';
  const title = submitting
    ? dialog.milestone.status === 'revision_requested' ? 'Submit revised work' : 'Submit milestone work'
    : revising ? 'Request a revision' : 'Approve milestone';
  const disabled = submitting
    ? description.trim().length < 3 || !linksAreValid
    : revising && feedback.trim().length < 3;

  const submit = (event) => {
    event.preventDefault();
    onSubmit(submitting
      ? { description: description.trim(), links }
      : { decision: revising ? 'revision' : 'approve', feedback: feedback.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="milestone-action-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="milestone-action-title" className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{dialog.milestone.title}</p>
          </div>
          <button type="button" onClick={onClose} disabled={pending} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close milestone action">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitting ? (
          <div className="mt-5 space-y-4">
            <Textarea
              label="Completed work"
              name="milestoneSubmissionDescription"
              rows={5}
              minLength={3}
              maxLength={5000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what you completed and what the client should review"
              autoFocus
            />
            <Textarea
              label="Delivery links (optional)"
              name="milestoneSubmissionLinks"
              rows={4}
              value={linksText}
              onChange={(event) => setLinksText(event.target.value)}
              placeholder={'https://example.com/delivery\nhttps://github.com/example/repository'}
              hint="One HTTP or HTTPS link per line, up to 10 links."
              error={linksText.trim() && !linksAreValid ? 'Use one valid HTTP or HTTPS URL per line, with no more than 10 links.' : ''}
            />
          </div>
        ) : (
          <div className="mt-5">
            <Textarea
              label={revising ? 'Required changes' : 'Approval feedback (optional)'}
              name="milestoneReviewFeedback"
              rows={4}
              minLength={revising ? 3 : undefined}
              maxLength={2000}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder={revising ? 'Explain exactly what needs to change' : 'Add a note for the freelancer'}
              autoFocus
            />
            <p className={`mt-3 rounded-lg p-3 text-sm ${revising ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
              {revising ? 'The freelancer can submit a new version while the complete history remains available.' : 'Approval is final for this milestone. The contract can be completed after every milestone is approved.'}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" loading={pending} disabled={disabled} variant={revising ? 'secondary' : 'primary'}>
            {submitting ? 'Submit for review' : revising ? 'Request revision' : 'Approve milestone'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SubmissionHistory({ submissions }) {
  if (!submissions?.length) return null;
  return (
    <details className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-slate-700">
        <History className="h-4 w-4 text-brand-600" /> Submission history ({submissions.length})
      </summary>
      <ol className="mt-3 space-y-3">
        {submissions.map((submission) => (
          <li key={idOf(submission)} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <strong className="text-sm text-slate-800">Version {submission.version}</strong>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STYLES[submission.status] || 'bg-slate-100 text-slate-600'}`}>{STATUS_LABELS[submission.status] || submission.status.replaceAll('_', ' ')}</span>
              </div>
              <span className="text-xs text-slate-400">{timeAgo(submission.submittedAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{submission.description}</p>
            {submission.links?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {submission.links.map((link) => <li key={link}><a href={link} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 break-all text-sm text-brand-700 hover:underline"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{link}</a></li>)}
              </ul>
            )}
            <p className="mt-2 text-xs text-slate-400">Submitted by {submission.submittedBy?.name || 'Freelancer'} on {dateLabel(submission.submittedAt)}</p>
            {submission.feedback && (
              <div className={`mt-3 rounded-lg p-3 text-sm ${submission.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                <strong className="block text-xs uppercase tracking-wide">Client feedback</strong>
                <p className="mt-1 whitespace-pre-wrap">{submission.feedback}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}

export function MilestoneWorkspace({ projectId, milestones = [], contractStatus, currency = 'USD', isClient, isFreelancer }) {
  const start = useStartMilestone();
  const submitWork = useSubmitMilestoneWork();
  const review = useReviewMilestoneSubmission();
  const [dialog, setDialog] = useState(null);
  const pending = start.isPending || submitWork.isPending || review.isPending;
  const active = contractStatus === 'active';

  const closeDialog = useCallback(() => { if (!pending) setDialog(null); }, [pending]);
  const startMilestone = (milestone) => start.mutate(
    { projectId, milestoneId: idOf(milestone) },
    {
      onSuccess: () => toast.success('Milestone started'),
      onError: (error) => toast.error(apiErrorMessage(error, 'Could not start the milestone')),
    },
  );
  const submitDialog = (payload) => {
    if (!dialog) return;
    if (dialog.kind === 'submit') {
      submitWork.mutate(
        { projectId, milestoneId: idOf(dialog.milestone), ...payload },
        {
          onSuccess: () => { toast.success('Work submitted for review'); setDialog(null); },
          onError: (error) => toast.error(apiErrorMessage(error, 'Could not submit milestone work')),
        },
      );
      return;
    }
    review.mutate(
      {
        projectId,
        milestoneId: idOf(dialog.milestone),
        submissionId: idOf(dialog.submission),
        ...payload,
      },
      {
        onSuccess: () => { toast.success(payload.decision === 'approve' ? 'Milestone approved' : 'Revision requested'); setDialog(null); },
        onError: (error) => toast.error(apiErrorMessage(error, 'Could not review the submission')),
      },
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="milestones-heading">
      <ActionDialog dialog={dialog} pending={pending} onClose={closeDialog} onSubmit={submitDialog} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-brand-600" /><h2 id="milestones-heading" className="text-lg font-semibold text-slate-900">Milestones and submissions</h2></div>
          <p className="mt-1 text-sm text-slate-500">Deliver, review, and revise accepted fixed-price work without losing earlier versions.</p>
        </div>
        {milestones.length > 0 && <span className="text-sm text-slate-500">{milestones.filter((item) => item.status === 'approved').length} of {milestones.length} approved</span>}
      </div>

      {!active && milestones.length > 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Milestone actions are paused while the contract is {contractStatus}.</p>}
      {milestones.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <p className="font-medium text-slate-700">No fixed-price milestones</p>
          <p className="mt-1 text-sm text-slate-500">Hourly delivery will be managed through the upcoming time-tracking workspace.</p>
        </div>
      ) : (
        <ol className="mt-5 space-y-4">
          {milestones.map((milestone, index) => {
            const latest = milestone.submissions?.[0];
            const awaiting = milestone.submissions?.find((submission) => submission.status === 'submitted');
            return (
              <li key={idOf(milestone)} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <MilestoneIcon status={milestone.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Milestone {index + 1}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[milestone.status]}`}>{STATUS_LABELS[milestone.status]}</span>
                    </div>
                    <h3 className="mt-1 font-semibold text-slate-900">{milestone.title}</h3>
                    {milestone.description && <p className="mt-1 text-sm leading-6 text-slate-600">{milestone.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{currency} {Number(milestone.amount || 0).toLocaleString()}</span>
                      {milestone.dueDate && <span>Due {dateLabel(milestone.dueDate)}</span>}
                      {milestone.startedAt && <span>Started {timeAgo(milestone.startedAt)}</span>}
                    </div>
                  </div>
                </div>

                {milestone.status === 'revision_requested' && latest?.feedback && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><strong>Revision requested:</strong> {latest.feedback}</p>}
                {milestone.status === 'submitted' && <p className="mt-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-800">Version {awaiting?.version || latest?.version} is awaiting client review.</p>}
                {milestone.status === 'approved' && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">This milestone has been approved.</p>}

                {active && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {isFreelancer && milestone.status === 'pending' && <Button size="sm" loading={start.isPending} disabled={pending} onClick={() => startMilestone(milestone)}><Clock3 className="h-4 w-4" /> Start milestone</Button>}
                    {isFreelancer && ['in_progress', 'revision_requested'].includes(milestone.status) && <Button size="sm" disabled={pending} onClick={() => setDialog({ kind: 'submit', milestone })}><Send className="h-4 w-4" /> {milestone.status === 'revision_requested' ? 'Submit revision' : 'Submit work'}</Button>}
                    {isClient && milestone.status === 'submitted' && awaiting && <><Button size="sm" disabled={pending} onClick={() => setDialog({ kind: 'approve', milestone, submission: awaiting })}><CheckCircle2 className="h-4 w-4" /> Approve</Button><Button size="sm" variant="secondary" disabled={pending} onClick={() => setDialog({ kind: 'revision', milestone, submission: awaiting })}><RotateCcw className="h-4 w-4" /> Request revision</Button></>}
                  </div>
                )}

                <SubmissionHistory submissions={milestone.submissions} />
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
