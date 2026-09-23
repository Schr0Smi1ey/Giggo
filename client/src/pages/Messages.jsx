import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  Bookmark,
  Edit3,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  Plus,
  Reply,
  Search,
  Send,
  Smile,
  Trash2,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { messagesApi } from '../api/messages.js';
import { apiErrorMessage } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Skeleton } from '../components/Loaders.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { timeAgo } from '../utils/format.js';

const idOf = (value) => String(value?._id || value?.id || value || '');
const messageKey = (conversationId) => ['messages', conversationId];
const BASIC_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '👏', '😊'];

function otherParticipants(conversation, userId) {
  return (conversation?.participants || []).map((item) => item.user).filter((item) => idOf(item) !== idOf(userId));
}

function conversationName(conversation, userId) {
  if (conversation?.type === 'group') return conversation.title;
  return otherParticipants(conversation, userId)[0]?.name || 'Conversation';
}

function Avatar({ user, online = false }) {
  return (
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
      {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : (user?.name || '?').slice(0, 1).toUpperCase()}
      {online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" aria-label="Online" />}
    </span>
  );
}

function ConversationComposer({ initialMode = 'direct', onClose, onCreated }) {
  const [mode, setMode] = useState(initialMode);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState('');
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['conversation-contacts', search],
    queryFn: () => messagesApi.contacts(search),
  });
  const create = useMutation({ mutationFn: messagesApi.createConversation });

  const submit = async () => {
    if (!selected.length) return toast.error('Choose at least one person');
    if (mode === 'group' && selected.length < 2) return toast.error('Choose at least two people for a group');
    if (mode === 'group' && title.trim().length < 2) return toast.error('Add a group name');
    try {
      const conversation = await create.mutateAsync({ participantIds: selected, title: mode === 'group' ? title.trim() : '' });
      onCreated(conversation);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not create the conversation'));
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/35 p-4" role="dialog" aria-modal="true" aria-labelledby="new-conversation-title">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between"><h2 id="new-conversation-title" className="font-semibold text-slate-900">{mode === 'group' ? 'Create a group' : 'New message'}</h2><button type="button" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button></div>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Conversation type">
            <button type="button" role="tab" aria-selected={mode === 'direct'} onClick={() => { setMode('direct'); setSelected([]); setTitle(''); }} className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'direct' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}><MessageCircle className="mr-1 inline h-4 w-4" /> Direct</button>
            <button type="button" role="tab" aria-selected={mode === 'group'} onClick={() => { setMode('group'); setSelected([]); }} className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'group' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}><Users className="mr-1 inline h-4 w-4" /> Group</button>
          </div>
          <Input label="Find people" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" />
          {mode === 'group' && <Input label="Group name" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="For example: Website delivery team" />}
          <p className="text-xs text-slate-500">{mode === 'group' ? 'Select at least two people. You will be the group owner.' : 'Select one person to start or reopen a private conversation.'}</p>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {isLoading ? <Skeleton className="h-16" /> : contacts.length ? contacts.map((contact) => {
              const checked = selected.includes(idOf(contact));
              return <label key={idOf(contact)} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50"><input type={mode === 'group' ? 'checkbox' : 'radio'} name="conversation-contact" checked={checked} onChange={() => setSelected((current) => mode === 'group' ? (checked ? current.filter((item) => item !== idOf(contact)) : [...current, idOf(contact)]) : [idOf(contact)])} /><Avatar user={contact} /><span><strong className="block text-sm text-slate-800">{contact.name}</strong><span className="text-xs capitalize text-slate-500">{contact.role}</span></span></label>;
            }) : <p className="p-5 text-center text-sm text-slate-500">No matching people.</p>}
          </div>
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={create.isPending} onClick={submit}>{mode === 'group' ? 'Create group' : 'Start conversation'}</Button></div>
        </div>
      </div>
    </div>
  );
}

function MessageActions({ item, mine, pinned, saved, myReaction, onReply, onEdit, onDelete, onReact, onPin, onSave }) {
  const [showReactions, setShowReactions] = useState(false);
  if (item.deletedAt) return null;
  return (
    <div className={`relative mt-1 flex flex-wrap items-center gap-1 text-xs ${mine ? 'justify-end' : ''}`}>
      <button type="button" className="rounded p-1 hover:bg-black/10" onClick={onReply} title="Reply"><Reply className="h-3.5 w-3.5" /></button>
      <button type="button" className={`rounded p-1 hover:bg-black/10 ${myReaction ? 'bg-amber-100 text-amber-700' : ''}`} onClick={() => setShowReactions((value) => !value)} title="React" aria-expanded={showReactions}><Smile className={`h-3.5 w-3.5 ${myReaction ? 'fill-current' : ''}`} /></button>
      <button type="button" className={`rounded p-1 hover:bg-black/10 ${pinned ? 'text-amber-500' : ''}`} onClick={onPin} title={pinned ? 'Unpin for me' : 'Pin for me'} aria-pressed={pinned}><Pin className={`h-3.5 w-3.5 ${pinned ? 'fill-current' : ''}`} /></button>
      <button type="button" className={`rounded p-1 hover:bg-black/10 ${saved ? 'text-sky-500' : ''}`} onClick={onSave} title={saved ? 'Remove from saved' : 'Save for me'} aria-pressed={saved}><Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} /></button>
      {mine && <button type="button" className="rounded p-1 hover:bg-black/10" onClick={onEdit} title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>}
      {mine && <button type="button" className="rounded p-1 hover:bg-black/10" onClick={onDelete} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>}
      {showReactions && <div className={`absolute bottom-full z-10 mb-1 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5 text-base shadow-lg ${mine ? 'right-0' : 'left-0'}`} role="menu" aria-label="Choose a reaction">{BASIC_EMOJIS.map((emoji) => <button type="button" role="menuitem" key={emoji} onClick={() => { onReact(emoji === myReaction ? '' : emoji); setShowReactions(false); }} className={`rounded-full p-1 hover:bg-slate-100 ${emoji === myReaction ? 'bg-amber-100' : ''}`} aria-label={`React with ${emoji}`}>{emoji}</button>)}{myReaction && <button type="button" role="menuitem" onClick={() => { onReact(''); setShowReactions(false); }} className="rounded-full px-2 py-1 text-xs text-red-600 hover:bg-red-50">Remove</button>}</div>}
    </div>
  );
}

function MessageDialog({ dialog, editDraft, pending, onEditDraft, onClose, onConfirm }) {
  useEffect(() => {
    if (!dialog) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !pending) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [dialog, onClose, pending]);

  if (!dialog) return null;
  const editing = dialog.type === 'edit';
  const unchanged = editDraft.trim() === dialog.item.body;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/35 p-4" role="presentation">
      <form
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-dialog-title"
        aria-describedby="message-dialog-description"
        onSubmit={onConfirm}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="message-dialog-title" className="font-semibold text-slate-900">{editing ? 'Edit message' : 'Delete message?'}</h2>
            <p id="message-dialog-description" className="mt-1 text-sm text-slate-500">
              {editing ? 'Update the message without leaving this conversation.' : 'The message content will be removed for everyone in this conversation.'}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={pending} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Close message dialog"><X className="h-5 w-5" /></button>
        </div>

        {editing ? (
          <div className="mt-4">
            <Textarea
              label="Message"
              name="editMessage"
              rows={4}
              maxLength={4000}
              value={editDraft}
              onChange={(event) => onEditDraft(event.target.value)}
              hint={`${editDraft.length}/4000 characters`}
              autoFocus
            />
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
            <p className="line-clamp-4 whitespace-pre-wrap break-words text-sm text-slate-700">{dialog.item.body}</p>
            <p className="mt-2 text-xs text-red-700">A “This message was deleted” placeholder will remain in the conversation.</p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" variant={editing ? 'primary' : 'danger'} loading={pending} disabled={editing && (!editDraft.trim() || unchanged)}>
            {editing ? <><Edit3 className="h-4 w-4" /> Save changes</> : <><Trash2 className="h-4 w-4" /> Delete message</>}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { socket, status, presence, joinConversation } = useSocket();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('conversation') || '';
  const [conversationSearch, setConversationSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState('direct');
  const [showConversationList, setShowConversationList] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showComposerEmojis, setShowComposerEmojis] = useState(false);
  const [messageDialog, setMessageDialog] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [messageActionPending, setMessageActionPending] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');
  const [filter, setFilter] = useState('all');
  const endRef = useRef(null);
  const typingTimer = useRef(null);

  const { data: conversationData, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', conversationSearch],
    queryFn: () => messagesApi.conversations({ limit: 50, search: conversationSearch }),
  });
  const conversations = conversationData?.items || [];
  const { data: conversation } = useQuery({
    queryKey: ['conversation', selectedId],
    queryFn: () => messagesApi.conversation(selectedId),
    enabled: Boolean(selectedId),
  });
  const { data: messageData, isLoading: loadingMessages, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [...messageKey(selectedId), messageSearch, filter],
    queryFn: ({ pageParam }) => messagesApi.messages(selectedId, { cursor: pageParam, limit: 30, search: messageSearch, pinned: filter === 'pinned', saved: filter === 'saved' }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: Boolean(selectedId),
  });
  const messages = useMemo(() => [...(messageData?.pages || [])].reverse().flatMap((page) => page.items), [messageData]);
  const counterpart = otherParticipants(conversation, user)[0];
  const online = conversation?.type === 'direct' && presence[idOf(counterpart)];
  const owner = conversation?.participants?.find((item) => idOf(item.user) === idOf(user))?.role === 'owner';
  const { data: availableContacts = [] } = useQuery({
    queryKey: ['conversation-contacts', ''],
    queryFn: () => messagesApi.contacts(''),
    enabled: Boolean(showDetails && owner && conversation?.type === 'group'),
  });

  useEffect(() => {
    if (!selectedId || !socket) return undefined;
    void joinConversation(selectedId);
    const onTypingStart = ({ conversationId, userId }) => {
      if (conversationId === selectedId && userId !== idOf(user)) setTypingUsers((current) => [...new Set([...current, userId])]);
    };
    const onTypingStop = ({ conversationId, userId }) => {
      if (conversationId === selectedId) setTypingUsers((current) => current.filter((item) => item !== userId));
    };
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    return () => {
      socket.emit('conversation:leave', { conversationId: selectedId });
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [joinConversation, selectedId, socket, user]);

  useEffect(() => {
    if (!selectedId || !messages.length) return;
    void messagesApi.markRead(selectedId).then(() => Promise.all([
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    ])).catch(() => {});
  }, [messages.length, queryClient, selectedId]);

  useEffect(() => {
    if (!messages.length) return;
    endRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }, [messages.length, selectedId]);

  useEffect(() => {
    setMessageDialog(null);
    setEditDraft('');
  }, [selectedId]);

  const mutateMessage = async (action, fallback) => {
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: messageKey(selectedId) });
      await queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error, fallback));
      return false;
    }
  };

  const send = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId) return;
    const clientMessageId = crypto.randomUUID();
    setDraft('');
    setShowComposerEmojis(false);
    socket?.emit('typing:stop', { conversationId: selectedId });
    try {
      await messagesApi.send(selectedId, { body, clientMessageId, replyTo: replyTo ? idOf(replyTo) : null });
      setReplyTo(null);
      await queryClient.invalidateQueries({ queryKey: messageKey(selectedId) });
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      setDraft(body);
      toast.error(apiErrorMessage(error, 'Could not send the message'));
    }
  };

  const draftChanged = (value) => {
    setDraft(value);
    if (!socket || !selectedId) return;
    socket.emit('typing:start', { conversationId: selectedId });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => socket.emit('typing:stop', { conversationId: selectedId }), 1000);
  };

  const openMessageDialog = (type, item) => {
    setEditDraft(type === 'edit' ? item.body : '');
    setMessageDialog({ type, item });
  };

  const closeMessageDialog = () => {
    if (messageActionPending) return;
    setMessageDialog(null);
    setEditDraft('');
  };

  const confirmMessageDialog = async (event) => {
    event.preventDefault();
    if (!messageDialog || messageActionPending) return;
    const body = editDraft.trim();
    if (messageDialog.type === 'edit' && (!body || body === messageDialog.item.body)) return;
    setMessageActionPending(true);
    const succeeded = messageDialog.type === 'edit'
      ? await mutateMessage(() => messagesApi.edit(idOf(messageDialog.item), body), 'Could not edit the message')
      : await mutateMessage(() => messagesApi.remove(idOf(messageDialog.item)), 'Could not delete the message');
    setMessageActionPending(false);
    if (succeeded) {
      setMessageDialog(null);
      setEditDraft('');
    }
  };

  const filteredConversations = useMemo(() => conversations.filter((item) => !item.mySettings?.archivedAt), [conversations]);
  const layoutColumns = showConversationList
    ? (showDetails && selectedId ? 'md:grid-cols-[19rem_minmax(0,1fr)_18rem]' : 'md:grid-cols-[19rem_minmax(0,1fr)]')
    : (showDetails && selectedId ? 'md:grid-cols-[minmax(0,1fr)_18rem]' : 'md:grid-cols-[minmax(0,1fr)]');
  const openComposer = (mode) => {
    setComposerMode(mode);
    setShowComposer(true);
  };

  return (
    <div className="relative min-h-[42rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {showComposer && <ConversationComposer initialMode={composerMode} onClose={() => setShowComposer(false)} onCreated={(created) => { setShowComposer(false); queryClient.invalidateQueries({ queryKey: ['conversations'] }); setParams({ conversation: idOf(created) }); }} />}
      <div className={`grid h-[calc(100vh-3rem)] min-h-[42rem] max-h-[52rem] ${layoutColumns}`}>
        <aside className={`${selectedId ? 'hidden md:flex' : 'flex'} ${showConversationList ? 'md:flex' : 'md:hidden'} min-h-0 flex-col border-r border-slate-200`}>
          <header className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <div><h1 className="text-xl font-bold text-slate-900">Messages</h1><p className="text-xs text-slate-500">{status === 'online' ? 'Live updates connected' : 'Reconnecting…'}</p></div>
              {selectedId && <button type="button" onClick={() => setShowConversationList(false)} className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:inline-flex" aria-label="Hide conversation panel" title="Hide conversation panel"><PanelLeftClose className="h-5 w-5" /></button>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="secondary" onClick={() => openComposer('direct')}><Plus className="h-4 w-4" /> Message</Button>
              <Button size="sm" variant="secondary" onClick={() => openComposer('group')}><Users className="h-4 w-4" /> Group</Button>
            </div>
            <div className="relative mt-3"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm" placeholder="Search conversations" value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} /></div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingConversations ? <div className="space-y-2 p-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : filteredConversations.length ? filteredConversations.map((item) => {
              const others = otherParticipants(item, user);
              const active = idOf(item) === selectedId;
              return <button type="button" key={idOf(item)} onClick={() => { setParams({ conversation: idOf(item) }); setShowDetails(false); }} className={`flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left ${active ? 'bg-brand-50' : 'hover:bg-slate-50'}`}><Avatar user={others[0]} online={item.type === 'direct' && presence[idOf(others[0])]} /><span className="min-w-0 flex-1"><span className="flex justify-between gap-2"><strong className="truncate text-sm text-slate-800">{conversationName(item, user)}</strong>{item.lastMessageAt && <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(item.lastMessageAt)}</span>}</span><span className="mt-0.5 flex items-center justify-between gap-2"><span className="truncate text-xs text-slate-500">{item.lastMessage?.deletedAt ? 'Message deleted' : item.lastMessage?.body || 'Start the conversation'}</span>{item.unreadCount > 0 && <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{item.unreadCount}</span>}</span></span></button>;
            }) : <div className="p-8 text-center text-sm text-slate-500"><MessageCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />No conversations yet.</div>}
          </div>
        </aside>

        {selectedId && conversation ? <section className="relative flex min-h-0 flex-col">
          <MessageDialog dialog={messageDialog} editDraft={editDraft} pending={messageActionPending} onEditDraft={setEditDraft} onClose={closeMessageDialog} onConfirm={confirmMessageDialog} />
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 p-3 sm:p-4">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" className="md:hidden" onClick={() => { setParams({}); setShowConversationList(true); }} aria-label="Back to conversations"><X className="h-5 w-5" /></button>
              {!showConversationList && <button type="button" className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:inline-flex" onClick={() => setShowConversationList(true)} aria-label="Show conversation panel" title="Show conversation panel"><PanelLeftOpen className="h-5 w-5" /></button>}
              <Avatar user={counterpart} online={online} />
              <div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{conversationName(conversation, user)}</h2><p className="text-xs text-slate-500">{typingUsers.length ? 'Typing…' : conversation.type === 'group' ? `${conversation.participants.length} participants` : online ? 'Online' : counterpart?.lastActiveAt ? `Active ${timeAgo(counterpart.lastActiveAt)}` : 'Offline'}</p></div>
            </div>
            <button type="button" onClick={() => setShowDetails((value) => !value)} className={`rounded-lg p-2 hover:bg-slate-100 ${showDetails ? 'bg-brand-50 text-brand-700' : 'text-slate-500'}`} aria-label={showDetails ? 'Hide user details panel' : 'Show user details panel'} title={showDetails ? 'Hide details' : 'Show details'}>{showDetails ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}</button>
          </header>
          <div className="border-b border-slate-100 p-2"><div className="flex flex-wrap items-center gap-2"><div className="relative min-w-[12rem] flex-1"><Search className="absolute left-3 top-2 h-4 w-4 text-slate-400" /><input value={messageSearch} onChange={(event) => setMessageSearch(event.target.value)} placeholder="Search messages" className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-sm" /></div>{['all', 'pinned', 'saved'].map((value) => <button type="button" key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-1 text-xs capitalize ${filter === value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{value}</button>)}</div></div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4" aria-live="polite">
            {hasNextPage && <div className="text-center"><Button size="sm" variant="ghost" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>Load older messages</Button></div>}
            {loadingMessages ? <Skeleton className="h-24" /> : messages.length ? messages.map((item) => {
              const mine = idOf(item.sender) === idOf(user);
              const pinned = item.pinnedBy?.some((entry) => idOf(entry) === idOf(user));
              const myReaction = item.reactions?.find((reaction) => idOf(reaction.user) === idOf(user))?.emoji || '';
              return <article key={idOf(item)} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-xl px-3 py-2 ${mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{item.replyTo && <div className="mb-2 block w-full truncate rounded border-l-2 border-current bg-black/5 px-2 py-1 text-left text-xs opacity-75">{item.replyTo.deletedAt ? 'Deleted message' : `${item.replyTo.sender?.name || 'User'}: ${item.replyTo.body}`}</div>}<p className="text-xs font-medium opacity-70">{item.sender?.name || (item.kind === 'system' ? 'System' : 'Deleted user')}</p><p className={`mt-1 whitespace-pre-wrap break-words text-sm ${item.deletedAt ? 'italic opacity-60' : ''}`}>{item.deletedAt ? 'This message was deleted.' : item.body}</p><div className="mt-1 text-[10px] opacity-65">{timeAgo(item.createdAt)}{item.editedAt ? ' · edited' : ''}</div>{item.reactions?.length > 0 && <div className="mt-1 flex gap-1">{item.reactions.map((reaction) => <span key={`${idOf(reaction.user)}-${reaction.emoji}`} className="rounded-full bg-white/70 px-1.5 text-xs text-slate-700">{reaction.emoji}</span>)}</div>}<MessageActions item={item} mine={mine} pinned={pinned} saved={item.savedByMe} myReaction={myReaction} onReply={() => setReplyTo(item)} onEdit={() => openMessageDialog('edit', item)} onDelete={() => openMessageDialog('delete', item)} onReact={(emoji) => mutateMessage(() => messagesApi.react(idOf(item), emoji), 'Could not react to the message')} onPin={() => mutateMessage(() => messagesApi.pin(idOf(item)), 'Could not update the pin')} onSave={() => mutateMessage(() => messagesApi.save(idOf(item)), 'Could not update saved messages')} /></div></article>;
            }) : <p className="py-12 text-center text-sm text-slate-500">{messageSearch || filter !== 'all' ? 'No messages match this filter.' : 'Send the first message.'}</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
            {replyTo && <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600"><span className="truncate">Replying to {replyTo.sender?.name}: {replyTo.body}</span><button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply"><X className="h-4 w-4" /></button></div>}
            <div className="flex items-end gap-2">
              <Textarea label="Message" className="min-h-[4rem]" rows={2} maxLength={4000} value={draft} onChange={(event) => draftChanged(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Write a message…" />
              <div className="relative"><button type="button" onClick={() => setShowComposerEmojis((value) => !value)} className={`rounded-lg border p-2.5 ${showComposerEmojis ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`} aria-label="Choose emoji" aria-expanded={showComposerEmojis}><Smile className="h-4 w-4" /></button>{showComposerEmojis && <div className="absolute bottom-full right-0 z-10 mb-2 grid grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-white p-2 text-xl shadow-lg" role="menu" aria-label="Message emojis">{BASIC_EMOJIS.map((emoji) => <button type="button" role="menuitem" key={emoji} onClick={() => { draftChanged(`${draft}${emoji}`); setShowComposerEmojis(false); }} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label={`Insert ${emoji}`}>{emoji}</button>)}</div>}</div>
              <Button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send className="h-4 w-4" /></Button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Enter to send · Shift+Enter for a new line · Attachments are disabled until the retention and scanning policy is approved.</p>
          </form>
        </section> : <section className="hidden items-center justify-center p-8 text-center text-slate-500 md:flex"><div><Users className="mx-auto mb-3 h-12 w-12 text-slate-300" /><h2 className="font-semibold text-slate-700">Choose a conversation</h2><p className="mt-1 text-sm">Your message history stays available across sessions.</p></div></section>}

        {selectedId && conversation && showDetails && <aside className="absolute inset-y-0 right-0 z-20 flex w-full max-w-xs flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl md:static md:z-auto md:w-auto md:shadow-none" aria-label="Conversation details">
          <header className="flex items-center justify-between border-b border-slate-200 p-4"><h2 className="font-semibold text-slate-900">{conversation.type === 'group' ? 'Group details' : 'User details'}</h2><button type="button" onClick={() => setShowDetails(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close details panel"><PanelRightClose className="h-5 w-5" /></button></header>
          <div className="p-4 text-sm">
            <div className="flex flex-col items-center text-center">{conversation.type === 'group' ? <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Users className="h-7 w-7" /></span> : <Avatar user={counterpart} online={online} />}<h3 className="mt-3 font-semibold text-slate-900">{conversationName(conversation, user)}</h3><p className="text-xs capitalize text-slate-500">{conversation.type === 'group' ? `${conversation.participants.length} participants` : counterpart?.role || 'Giggo user'}</p></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><Button size="sm" variant="ghost" onClick={() => mutateMessage(() => messagesApi.settings(selectedId, { muted: !conversation.mySettings?.muted }), 'Could not update conversation')}>{conversation.mySettings?.muted ? 'Unmute' : 'Mute'}</Button><Button size="sm" variant="ghost" onClick={() => mutateMessage(() => messagesApi.settings(selectedId, { archived: true }), 'Could not archive conversation')}><Archive className="h-4 w-4" /> Archive</Button></div>
            {conversation.type === 'group' && <div className="mt-6"><p className="mb-2 font-medium text-slate-700">Participants</p><div className="space-y-2">{conversation.participants.map((item) => <div key={idOf(item.user)} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2"><Avatar user={item.user} online={presence[idOf(item.user)]} /><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-slate-800">{item.user.name}</strong><span className="text-[11px] capitalize text-slate-500">{item.role}</span></span>{owner && item.role !== 'owner' && <button type="button" onClick={() => mutateMessage(() => messagesApi.removeParticipant(selectedId, idOf(item.user)), 'Could not remove participant')} className="rounded p-1 text-red-500 hover:bg-red-50" aria-label={`Remove ${item.user.name}`}><UserMinus className="h-4 w-4" /></button>}</div>)}</div>{owner && <div className="mt-3 space-y-2"><select value={newParticipant} onChange={(event) => setNewParticipant(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Add a participant…</option>{availableContacts.filter((contact) => !conversation.participantIds.map(idOf).includes(idOf(contact))).map((contact) => <option key={idOf(contact)} value={idOf(contact)}>{contact.name}</option>)}</select><Button className="w-full" size="sm" disabled={!newParticipant} onClick={() => mutateMessage(async () => { await messagesApi.addParticipant(selectedId, newParticipant); setNewParticipant(''); }, 'Could not add participant')}>Add participant</Button></div>}</div>}
          </div>
        </aside>}
      </div>
    </div>
  );
}
