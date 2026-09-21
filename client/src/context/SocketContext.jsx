import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { getAccessToken } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

function socketOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  try {
    return new URL(apiUrl, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('offline');
  const [presence, setPresence] = useState({});

  useEffect(() => {
    const token = getAccessToken();
    if (!user || !token) {
      setSocket(null);
      setStatus('offline');
      return undefined;
    }
    const connection = io(socketOrigin(), {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    });
    setSocket(connection);
    setStatus('connecting');

    connection.on('connect', () => setStatus('online'));
    connection.on('disconnect', () => setStatus('reconnecting'));
    connection.on('connect_error', () => setStatus('reconnecting'));
    connection.on('presence:update', ({ userId, online }) => setPresence((current) => ({ ...current, [userId]: online })));
    const refreshMessages = ({ conversationId, message }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      const offerId = message?.metadata?.offerId;
      if (offerId) queryClient.invalidateQueries({ queryKey: ['offers', 'detail', offerId] });
    };
    connection.on('message:new', refreshMessages);
    connection.on('message:updated', refreshMessages);
    connection.on('message:read', refreshMessages);
    connection.on('conversation:new', () => queryClient.invalidateQueries({ queryKey: ['conversations'] }));
    connection.on('conversation:updated', () => queryClient.invalidateQueries({ queryKey: ['conversations'] }));
    connection.on('conversation:removed', () => queryClient.invalidateQueries({ queryKey: ['conversations'] }));
    connection.on('notification:new', () => queryClient.invalidateQueries({ queryKey: ['notifications'] }));

    return () => {
      connection.removeAllListeners();
      connection.disconnect();
      setSocket(null);
      setStatus('offline');
      setPresence({});
    };
  }, [queryClient, user]);

  const joinConversation = useCallback((conversationId) => new Promise((resolve) => {
    if (!socket?.connected) return resolve({ success: false });
    socket.emit('conversation:join', { conversationId }, (result) => {
      if (result?.presence) setPresence((current) => ({ ...current, ...result.presence }));
      resolve(result || { success: false });
    });
  }), [socket]);

  const value = useMemo(() => ({ socket, status, presence, joinConversation }), [joinConversation, presence, socket, status]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const value = useContext(SocketContext);
  if (!value) throw new Error('useSocket must be used within SocketProvider');
  return value;
}
