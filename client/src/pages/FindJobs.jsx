import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Clock, SlidersHorizontal, CheckCircle2, BookmarkCheck, LockKeyhole } from 'lucide-react';
import { useJobs } from '../services/jobs.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatBudget, timeAgo } from '../utils/format.js';
import {
  CATEGORIES,
  BUDGET_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  EXPERIENCE_LEVEL_LABELS,
  JOB_DURATION_LABELS,
  JOB_STATUS_LABELS,
  JOB_SORTS,
} from '../constants/index.js';
import { Select } from '../components/Select.jsx';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';

function JobCard({ job }) {
  const c = job.client || {};
  const proposalStatus = job.viewerState?.proposalStatus;
  const proposalLabel = proposalStatus ? proposalStatus.charAt(0).toUpperCase() + proposalStatus.slice(1) : '';
  return (
    <Link
      to={`/jobs/${job._id || job.id}`}
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 line-clamp-2">{job.title}</h3>
        <span className="shrink-0 text-right text-sm font-semibold text-slate-900">{formatBudget(job.budget)}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        {job.category && <span>{job.category}</span>}
        {job.experienceLevel && <span>{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</span>}
        {job.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {JOB_DURATION_LABELS[job.duration]}</span>}
      </div>

      {(job.viewerState?.applied || job.viewerState?.followed || job.status !== 'open') && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Your activity for this job">
          {job.viewerState?.applied && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Applied{proposalLabel ? ` · ${proposalLabel}` : ''}
            </span>
          )}
          {job.viewerState?.followed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <BookmarkCheck className="h-3.5 w-3.5" /> Followed
            </span>
          )}
          {job.status !== 'open' && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {JOB_STATUS_LABELS[job.status] || job.status}
            </span>
          )}
        </div>
      )}

      <p className="mt-3 line-clamp-3 text-sm text-slate-500">{job.description}</p>

      {job.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 6).map((s) => (
            <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{s}</span>
          ))}
          {job.skills.length > 6 && <span className="text-xs text-slate-400">+{job.skills.length - 6}</span>}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>{c.name ? `Posted by ${c.name}` : 'Client'}</span>
        <span>{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  );
}

export default function FindJobs() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const isFreelancer = hasRole('freelancer');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ q: '', category: '', experienceLevel: '', budgetType: '', activity: '', sort: 'recent', page: 1 });

  const params = { ...filters, limit: 12 };
  if (!isFreelancer) delete params.activity;
  Object.keys(params).forEach((k) => (params[k] === '' || params[k] == null) && delete params[k]);

  const { data, isLoading, isError } = useJobs(
    params,
    { keepPreviousData: true, enabled: !authLoading },
    user?._id || user?.id || 'public',
  );
  const items = data?.items || [];
  const pagination = data?.pagination;

  const submit = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, q: searchInput.trim(), page: 1 }));
  };
  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Find jobs</h1>
        <p className="mt-1 text-slate-500">Browse open projects from clients and find your next opportunity.</p>
      </div>

      {/* Search + filters */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search jobs by title or keyword"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            placeholder="All categories"
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
          />
          <Select
            placeholder="Any experience"
            options={EXPERIENCE_LEVEL_OPTIONS}
            value={filters.experienceLevel}
            onChange={(e) => setFilter('experienceLevel', e.target.value)}
          />
          <Select
            placeholder="Any budget type"
            options={BUDGET_TYPE_OPTIONS}
            value={filters.budgetType}
            onChange={(e) => setFilter('budgetType', e.target.value)}
          />
          <Select options={JOB_SORTS} value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} />
        </div>

        {isFreelancer && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2" aria-label="Filter jobs by your activity">
              {[
                { value: '', label: 'All jobs' },
                { value: 'applied', label: 'Applied' },
                { value: 'followed', label: 'Followed' },
              ].map((option) => (
                <button
                  key={option.value || 'all'}
                  type="button"
                  aria-pressed={filters.activity === option.value}
                  onClick={() => setFilter('activity', option.value)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    filters.activity === option.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                disabled
                title="Completed jobs become available after the contract lifecycle is implemented"
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-400"
              >
                <LockKeyhole className="h-3.5 w-3.5" /> Completed
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">Completed work will appear after contracts and completion tracking are available.</p>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <SlidersHorizontal className="h-4 w-4" />
        {isLoading ? 'Searching…' : `${pagination?.total ?? items.length} job${(pagination?.total ?? items.length) === 1 ? '' : 's'} found`}
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : isError ? (
        <div className="mt-10 text-center text-slate-500">Could not load jobs. Please try again.</div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-medium text-slate-700">
            {filters.activity === 'applied' ? 'No applied jobs yet' : filters.activity === 'followed' ? 'No followed jobs yet' : 'No jobs match your search'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {filters.activity ? 'Choose another activity filter or browse all jobs.' : 'Try adjusting your filters or keywords.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((job) => <JobCard key={job._id || job.id} job={job} />)}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="secondary" size="sm" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="secondary" size="sm" disabled={filters.page >= pagination.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
