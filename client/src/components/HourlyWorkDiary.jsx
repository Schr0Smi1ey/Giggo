import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Clock3, History, Pencil, Play, Plus, Square, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import {
  useCreateTimeEntry,
  useDeleteTimeEntry,
  useHeartbeatTimer,
  useHourlyWork,
  useStartTimer,
  useStopTimer,
  useUpdateTimeEntry,
} from '../services/projects.js';
import { Button } from './Button.jsx';
import { Skeleton } from './Loaders.jsx';
import { Textarea } from './Textarea.jsx';

const requestKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const localDateTime = (date) => {
  const value = new Date(date);
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};
const hoursLabel = (minutes = 0) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
const money = (amount, currency = 'USD') => `${currency} ${Number(amount || 0).toFixed(2)}`;
const dateTimeLabel = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const canChange = (entry) => entry.status === 'completed' && Date.now() - new Date(entry.endedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;

function Dialog({ title, description, pending, onClose, children, submitLabel, submitDisabled, danger = false, onSubmit }) {
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape' && !pending) onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose, pending]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <form onSubmit={onSubmit} role="dialog" aria-modal="true" aria-labelledby="time-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div><h3 id="time-dialog-title" className="text-lg font-semibold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>
          <button type="button" onClick={onClose} disabled={pending} aria-label="Close dialog" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button><Button type="submit" variant={danger ? 'danger' : 'primary'} loading={pending} disabled={submitDisabled}>{submitLabel}</Button></div>
      </form>
    </div>
  );
}

function TimeEntryDialog({ mode, entry, pending, onClose, onSave }) {
  const now = new Date();
  const [startedAt, setStartedAt] = useState(localDateTime(entry?.startedAt || new Date(now.getTime() - 60 * 60 * 1000)));
  const [endedAt, setEndedAt] = useState(localDateTime(entry?.endedAt || now));
  const [description, setDescription] = useState(entry?.description || '');
  const [reason, setReason] = useState('');
  const isDelete = mode === 'delete';
  const isEdit = mode === 'edit';
  const timesEditable = !isEdit || entry?.source === 'manual';
  const submit = (event) => {
    event.preventDefault();
    if (isDelete) return onSave({ revision: entry.revision, reason: reason.trim() });
    const payload = {
      description: description.trim(),
      ...(timesEditable ? { startedAt: new Date(startedAt).toISOString(), endedAt: new Date(endedAt).toISOString() } : {}),
      ...(isEdit ? { revision: entry.revision, reason: reason.trim() } : {}),
    };
    onSave(payload);
  };
  return (
    <Dialog
      title={isDelete ? 'Remove time entry' : isEdit ? 'Edit time entry' : 'Add manual time'}
      description={isDelete ? 'The entry will remain visible as deleted in the audit history.' : isEdit ? 'Changes are versioned and visible to both participants.' : 'Manual time must be in the past, non-overlapping, and no longer than 12 hours.'}
      pending={pending}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={isDelete ? 'Remove entry' : isEdit ? 'Save changes' : 'Add time'}
      danger={isDelete}
      submitDisabled={isDelete ? reason.trim().length < 3 : description.trim().length < 3 || (isEdit && reason.trim().length < 3) || (timesEditable && (!startedAt || !endedAt || new Date(endedAt) <= new Date(startedAt)))}
    >
      {!isDelete && timesEditable && <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Start time<input type="datetime-local" value={startedAt} max={localDateTime(new Date())} onChange={(event) => setStartedAt(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" required /></label><label className="text-sm font-medium text-slate-700">End time<input type="datetime-local" value={endedAt} max={localDateTime(new Date())} onChange={(event) => setEndedAt(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" required /></label></div>}
      {!isDelete && <Textarea label="Work description" name="timeEntryDescription" value={description} onChange={(event) => setDescription(event.target.value)} minLength={3} maxLength={500} rows={3} placeholder="Describe the work completed" required />}
      {(isEdit || isDelete) && <Textarea label={isDelete ? 'Removal reason' : 'Change reason'} name="timeEntryReason" value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} rows={3} placeholder="Explain why this change is needed" required />}
    </Dialog>
  );
}

function RunningTimer({ timer, pending, onStop }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const elapsed = Math.max(0, now - new Date(timer.startedAt).getTime());
  const seconds = Math.floor(elapsed / 1000);
  const label = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
  return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-emerald-800"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /><strong>Timer running</strong>{timer.stale && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Connection delayed</span>}</div><p className="mt-1 text-sm text-emerald-900">{timer.description}</p><p className="mt-2 font-mono text-2xl font-semibold text-emerald-800" aria-live="polite">{label}</p></div><Button variant="danger" onClick={onStop} loading={pending}><Square className="h-4 w-4 fill-current" /> Stop timer</Button></div></div>;
}

export function HourlyWorkDiary({ projectId, contractStatus, isFreelancer }) {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, refetch } = useHourlyWork(projectId, params);
  const startTimer = useStartTimer();
  const heartbeat = useHeartbeatTimer();
  const stopTimer = useStopTimer();
  const createEntry = useCreateTimeEntry();
  const updateEntry = useUpdateTimeEntry();
  const deleteEntry = useDeleteTimeEntry();
  const [timerDescription, setTimerDescription] = useState('');
  const startKey = useRef(requestKey());
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const timerId = data?.activeTimer?._id;
    if (!timerId || contractStatus !== 'active') return undefined;
    const interval = window.setInterval(() => heartbeat.mutate({ projectId, timerId }, { onError: () => refetch() }), 30_000);
    return () => window.clearInterval(interval);
  }, [contractStatus, data?.activeTimer?._id, heartbeat.mutate, projectId, refetch]);

  const error = (value, fallback) => toast.error(apiErrorMessage(value, fallback));
  const start = (event) => {
    event.preventDefault();
    startTimer.mutate({ projectId, description: timerDescription.trim(), idempotencyKey: startKey.current }, {
      onSuccess: () => { toast.success('Timer started'); setTimerDescription(''); startKey.current = requestKey(); },
      onError: (value) => error(value, 'Could not start the timer'),
    });
  };
  const stop = () => stopTimer.mutate({ projectId, timerId: data.activeTimer._id }, {
    onSuccess: () => toast.success('Time recorded in the work diary'),
    onError: (value) => error(value, 'Could not stop the timer'),
  });
  const saveDialog = (payload) => {
    if (dialog.mode === 'create') {
      createEntry.mutate({ projectId, ...payload, idempotencyKey: dialog.idempotencyKey }, { onSuccess: () => { toast.success('Manual time added'); setDialog(null); }, onError: (value) => error(value, 'Could not add manual time') });
    } else if (dialog.mode === 'edit') {
      updateEntry.mutate({ projectId, entryId: dialog.entry._id, ...payload }, { onSuccess: () => { toast.success('Time entry updated'); setDialog(null); }, onError: (value) => error(value, 'Could not update the time entry') });
    } else {
      deleteEntry.mutate({ projectId, entryId: dialog.entry._id, ...payload }, { onSuccess: () => { toast.success('Time entry removed'); setDialog(null); }, onError: (value) => error(value, 'Could not remove the time entry') });
    }
  };
  const dialogPending = createEntry.isPending || updateEntry.isPending || deleteEntry.isPending;

  if (isLoading) return <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-48" /></div>;
  if (isError || !data) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert"><p>Could not load the hourly work diary.</p><Button size="sm" variant="secondary" className="mt-3" onClick={() => refetch()}>Try again</Button></div>;
  const summary = data.summary;
  const currency = summary.currency;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="hourly-work-heading">
      {dialog && <TimeEntryDialog mode={dialog.mode} entry={dialog.entry} pending={dialogPending} onClose={() => { if (!dialogPending) setDialog(null); }} onSave={saveDialog} />}
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-brand-600" /><h2 id="hourly-work-heading" className="text-lg font-semibold text-slate-900">Hourly work diary</h2></div><p className="mt-1 text-sm text-slate-500">Tracked totals are estimates at {money(summary.hourlyRate, currency)}/hr. Invoicing is a separate upcoming feature.</p></div>{isFreelancer && <Button size="sm" variant="secondary" onClick={() => setDialog({ mode: 'create', idempotencyKey: requestKey() })} disabled={contractStatus !== 'active'}><Plus className="h-4 w-4" /> Add manual time</Button>}</div>

      {contractStatus !== 'active' && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">New hourly work cannot be recorded while this contract is {contractStatus}. Existing diary history remains visible.</p>}
      {isFreelancer && contractStatus === 'active' && <div className="mt-5">{data.activeTimer ? <RunningTimer timer={data.activeTimer} pending={stopTimer.isPending} onStop={stop} /> : <form onSubmit={start} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><label htmlFor="timer-description" className="text-sm font-medium text-slate-700">What are you working on?</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="timer-description" value={timerDescription} onChange={(event) => setTimerDescription(event.target.value)} minLength={3} maxLength={500} placeholder="Implement project dashboard filters" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100" required /><Button type="submit" loading={startTimer.isPending} disabled={timerDescription.trim().length < 3}><Play className="h-4 w-4 fill-current" /> Start timer</Button></div></form>}</div>}

      <dl className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-brand-50 p-4"><dt className="text-xs font-medium uppercase tracking-wide text-brand-600">Tracked time</dt><dd className="mt-1 text-xl font-semibold text-brand-900">{hoursLabel(summary.totalMinutes)}</dd></div><div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Estimated value</dt><dd className="mt-1 text-xl font-semibold text-slate-900">{money(summary.estimatedAmount, currency)}</dd></div><div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Diary range</dt><dd className="mt-1 text-sm font-semibold text-slate-800">Last 30 days</dd></div></dl>

      {summary.daily.length > 0 && <div className="mt-5"><h3 className="text-sm font-semibold text-slate-800">Daily summary</h3><div className="mt-2 flex gap-2 overflow-x-auto pb-1">{summary.daily.map((day) => <div key={day.date} className="min-w-36 rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">{new Date(`${day.date}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p><strong className="mt-1 block text-sm text-slate-800">{hoursLabel(day.minutes)}</strong><span className="text-xs text-slate-500">{money(day.estimatedAmount, currency)}</span></div>)}</div></div>}

      <div className="mt-6 border-t border-slate-100 pt-5"><div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-500" /><h3 className="font-semibold text-slate-900">Time entries</h3></div>{data.items.length === 0 ? <p className="mt-4 rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">No time has been recorded in this period.</p> : <ol className="mt-4 space-y-3">{data.items.map((entry) => <li key={entry._id} className={`rounded-lg border p-4 ${entry.status === 'deleted' ? 'border-slate-200 bg-slate-50 opacity-75' : 'border-slate-200'}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-900">{entry.status === 'deleted' ? 'Deleted entry' : entry.description}</strong><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">{entry.source}</span>{entry.revision > 1 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Revision {entry.revision}</span>}</div><p className="mt-1 text-xs text-slate-500">{dateTimeLabel(entry.startedAt)} – {dateTimeLabel(entry.endedAt)}</p><p className="mt-2 text-sm font-medium text-slate-700">{hoursLabel(entry.durationMinutes)} · {money(entry.estimatedAmount, entry.currency)}</p>{entry.status === 'deleted' && <p className="mt-2 text-xs text-slate-500">Removed: {entry.deletionReason}</p>}</div>{isFreelancer && canChange(entry) && <div className="flex gap-1"><button type="button" onClick={() => setDialog({ mode: 'edit', entry })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700" aria-label="Edit time entry"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => setDialog({ mode: 'delete', entry })} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="Delete time entry"><Trash2 className="h-4 w-4" /></button></div>}</div>{entry.revisions?.length > 0 && <details className="mt-3 border-t border-slate-100 pt-3"><summary className="flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-600"><History className="h-3.5 w-3.5" /> View change history</summary><ol className="mt-2 space-y-2">{[...entry.revisions].reverse().map((revision) => <li key={revision._id} className="rounded bg-slate-50 p-2 text-xs text-slate-600"><strong className="capitalize">{revision.action}</strong> by {revision.actor?.name || 'Freelancer'} · {dateTimeLabel(revision.at)}<p className="mt-1">{revision.reason}</p><p className="mt-1 text-slate-500">Previous: {revision.previous?.description} · {hoursLabel(revision.previous?.durationMinutes)}</p></li>)}</ol></details>}</li>)}</ol>}</div>
      {data.pagination.totalPages > 1 && <div className="mt-5 flex items-center justify-between"><Button size="sm" variant="secondary" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Previous</Button><span className="text-xs text-slate-500">Page {page} of {data.pagination.totalPages}</span><Button size="sm" variant="secondary" onClick={() => setPage((value) => Math.min(data.pagination.totalPages, value + 1))} disabled={page === data.pagination.totalPages}>Next</Button></div>}
    </section>
  );
}
