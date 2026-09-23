import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, FileSignature, MessageCircle, TrendingUp, UserRound, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { MilestoneWorkspace } from '../components/MilestoneWorkspace.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { CONTRACT_STATUS_BADGES, CONTRACT_STATUS_LABELS } from '../constants/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useProject, useUpdateProjectProgress } from '../services/projects.js';
import { timeAgo } from '../utils/format.js';

const idOf = (value) => String(value?._id || value?.id || value || '');
const dateLabel = (value) => value ? new Date(value).toLocaleDateString() : 'Not specified';
const money = (contract) => `${contract?.budget?.currency || 'USD'} ${Number(contract?.budget?.amount || 0).toLocaleString()}${contract?.budget?.type === 'hourly' ? '/hr' : ''}`;

function ProgressBar({ value }) {
  return <div><div className="mb-2 flex items-end justify-between"><span className="text-sm font-medium text-slate-700">Delivery progress</span><strong className="text-2xl text-brand-700">{value}%</strong></div><div className="h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Delivery progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}><div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${value}%` }} /></div></div>;
}

function ProgressDialog({ current, pending, onClose, onSubmit }) {
  const [progress, setProgress] = useState(Math.min(99, current + 10));
  const [note, setNote] = useState('');
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape' && !pending) onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose, pending]);
  const submit = (event) => { event.preventDefault(); onSubmit({ progress: Number(progress), note: note.trim() }); };
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"><form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="progress-dialog-title" className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="progress-dialog-title" className="font-semibold text-slate-900">Report project progress</h2><p className="mt-1 text-sm text-slate-500">Progress can move forward to 99%. The client completes the contract to record 100%.</p></div><button type="button" onClick={onClose} disabled={pending} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close progress dialog"><X className="h-5 w-5" /></button></div><label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="project-progress">Progress percentage</label><input id="project-progress" type="number" min={current + 1} max="99" value={progress} onChange={(event) => setProgress(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" autoFocus /><div className="mt-4"><Textarea label="Update note" name="projectProgressNote" rows={4} minLength={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Describe what was completed and what comes next" /></div><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button><Button type="submit" loading={pending} disabled={!Number.isInteger(Number(progress)) || Number(progress) <= current || Number(progress) > 99 || note.trim().length < 3}>Save update</Button></div></form></div>;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: project, isLoading, isError } = useProject(id);
  const updateProgress = useUpdateProjectProgress();
  const [showProgress, setShowProgress] = useState(false);

  if (isLoading) return <div className="mx-auto max-w-5xl space-y-4"><Skeleton className="h-28" /><Skeleton className="h-80" /></div>;
  if (isError || !project) return <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-6 text-center text-red-700" role="alert">This project is unavailable or you do not have permission to view it.</div>;

  const contract = project.contract || {};
  const isClient = idOf(contract.client) === idOf(user);
  const isFreelancer = idOf(contract.freelancer) === idOf(user);
  const counterpart = isClient ? contract.freelancer : contract.client;
  const closeProgress = () => { if (!updateProgress.isPending) setShowProgress(false); };
  const submitProgress = (payload) => updateProgress.mutate({ id, ...payload }, {
    onSuccess: () => { toast.success('Project progress updated'); setShowProgress(false); },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not update project progress')),
  });

  return (
    <div className="mx-auto max-w-5xl pb-16">
      {showProgress && <ProgressDialog current={project.progress} pending={updateProgress.isPending} onClose={closeProgress} onSubmit={submitProgress} />}
      <Link to="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Back to projects</Link>
      <header className="mt-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1><span className={`rounded-full px-2 py-1 text-xs font-medium ${CONTRACT_STATUS_BADGES[project.status]}`}>{CONTRACT_STATUS_LABELS[project.status]}</span></div><p className="mt-1 text-sm text-slate-500">{contract.job?.title} · working with {counterpart?.name || 'Marketplace user'}</p></div><div className="flex flex-wrap gap-2">{isFreelancer && project.status === 'active' && project.progress < 99 && <Button size="sm" onClick={() => setShowProgress(true)}><TrendingUp className="h-4 w-4" /> Update progress</Button>}<Link to={`/dashboard/contracts/${idOf(contract)}`} className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"><FileSignature className="h-4 w-4" /> {isClient ? 'Manage contract' : 'View contract'}</Link>{project.conversationId && <Link to={`/dashboard/messages?conversation=${project.conversationId}`} className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"><MessageCircle className="h-4 w-4" /> Open messages</Link>}</div></div>
        {project.status !== 'active' && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Progress reporting is unavailable while this contract is {project.status}. Contract lifecycle actions remain available from the contract page.</p>}
      </header>

      <div className="mt-6">
        <MilestoneWorkspace
          projectId={id}
          milestones={project.milestones || []}
          contractStatus={project.status}
          currency={contract.budget?.currency || 'USD'}
          isClient={isClient}
          isFreelancer={isFreelancer}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5" aria-label="Project overview">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><ProgressBar value={project.progress} /><p className="mt-3 text-xs text-slate-500">{project.progressUpdatedAt ? `Last progress update ${timeAgo(project.progressUpdatedAt)}` : 'No progress has been reported yet.'}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Project summary</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{contract.description}</p><dl className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2"><div><dt className="text-xs text-slate-400">Contract value</dt><dd className="font-medium text-slate-700">{money(contract)}</dd></div><div><dt className="text-xs text-slate-400">Estimated delivery</dt><dd className="font-medium text-slate-700">{contract.estimatedDays} days</dd></div><div><dt className="text-xs text-slate-400">Start date</dt><dd className="font-medium text-slate-700">{dateLabel(contract.startDate)}</dd></div><div><dt className="text-xs text-slate-400">End date</dt><dd className="font-medium text-slate-700">{dateLabel(contract.endDate)}</dd></div></dl></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><UserRound className="h-5 w-5 text-brand-600" /><h2 className="text-lg font-semibold text-slate-900">Participants</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-slate-100 p-4"><p className="text-xs uppercase tracking-wide text-slate-400">Client</p><strong className="mt-1 block text-slate-800">{contract.client?.name || 'Marketplace client'}</strong></div><div className="rounded-lg border border-slate-100 p-4"><p className="text-xs uppercase tracking-wide text-slate-400">Freelancer</p><strong className="mt-1 block text-slate-800">{contract.freelancer?.name || 'Marketplace freelancer'}</strong></div></div></div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="progress-history-heading"><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-brand-600" /><h2 id="progress-history-heading" className="text-lg font-semibold text-slate-900">Progress history</h2></div><ol className="mt-5 space-y-4">{[...(project.progressHistory || [])].reverse().map((entry) => <li key={idOf(entry)} className="relative border-l-2 border-brand-100 pl-4"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-brand-500" /><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-800">{entry.to}% complete</strong><span className="text-xs text-slate-400">{timeAgo(entry.at)}</span></div><p className="mt-1 text-xs text-slate-500">{entry.actor?.name || 'Giggo system'} · {entry.actorRole}</p>{entry.note && <p className="mt-1 rounded-lg bg-slate-50 p-2 text-sm text-slate-600">{entry.note}</p>}</li>)}</ol></section>
      </div>
    </div>
  );
}
