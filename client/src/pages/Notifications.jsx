import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationsApi } from '../api/notifications.js';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { timeAgo } from '../utils/format.js';

export default function Notifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 100 }),
    refetchInterval: 30_000,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
  const readAll = useMutation({ mutationFn: notificationsApi.readAll, onSuccess: refresh });
  const act = async (action, fallback) => {
    try { await action(); await refresh(); } catch (error) { toast.error(apiErrorMessage(error, fallback)); }
  };
  const open = async (item) => {
    if (!item.readAt) await act(() => notificationsApi.read(item._id), 'Could not mark notification as read');
    if (item.actionUrl) navigate(item.actionUrl);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Notifications</h1><p className="mt-1 text-sm text-slate-500">Updates that need your attention, kept across sessions.</p></div><Button size="sm" variant="secondary" loading={readAll.isPending} disabled={!data?.unreadCount} onClick={() => readAll.mutate()}><CheckCheck className="h-4 w-4" /> Mark all read</Button></header>
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-live="polite">
        {isLoading ? <div className="space-y-3 p-4"><Skeleton className="h-20" /><Skeleton className="h-20" /></div> : data?.items?.length ? data.items.map((item) => <article key={item._id} className={`flex gap-3 border-b border-slate-100 p-4 last:border-0 ${item.readAt ? '' : 'bg-brand-50/60'}`}><span className={`mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.readAt ? 'bg-slate-100 text-slate-500' : 'bg-brand-100 text-brand-700'}`}><Bell className="h-4 w-4" /></span><button type="button" onClick={() => open(item)} className="min-w-0 flex-1 text-left"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-900">{item.title}</strong>{!item.readAt && <span className="h-2 w-2 rounded-full bg-brand-600" aria-label="Unread" />}</span>{item.body && <span className="mt-1 block text-sm text-slate-600">{item.body}</span>}<span className="mt-1 block text-xs text-slate-400">{timeAgo(item.createdAt)}</span></button><button type="button" onClick={() => act(() => notificationsApi.archive(item._id), 'Could not archive notification')} className="self-start rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Archive notification"><Archive className="h-4 w-4" /></button></article>) : <div className="p-12 text-center text-slate-500"><Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="font-medium text-slate-700">You are all caught up</p><p className="mt-1 text-sm">New marketplace activity will appear here.</p></div>}
      </section>
    </div>
  );
}
