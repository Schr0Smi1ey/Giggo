import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api, setAccessToken } from '../api/client.js';
import { supabase } from '../lib/supabase.js';
import {
  requestPasswordReset,
  resendEmailConfirmation,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updatePassword,
} from '../services/supabaseAuth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef(null);
  const synchronizedTokenRef = useRef(null);
  const syncInFlightRef = useRef(null);

  const updateUser = useCallback((value) => {
    if (typeof value === 'function') {
      setUser((previous) => {
        const next = value(previous);
        currentUserRef.current = next;
        return next;
      });
      return;
    }
    currentUserRef.current = value;
    setUser(value);
  }, []);

  const loadDomainUser = useCallback(async (session) => {
    if (!session?.access_token) {
      setAccessToken(null);
      synchronizedTokenRef.current = null;
      syncInFlightRef.current = null;
      updateUser(null);
      return null;
    }

    const token = session.access_token;
    setAccessToken(token);
    if (synchronizedTokenRef.current === token && currentUserRef.current) return currentUserRef.current;
    if (syncInFlightRef.current?.token === token) return syncInFlightRef.current.promise;

    const promise = api.get('/auth/me').then((response) => {
      const currentUser = response.data.data.user;
      synchronizedTokenRef.current = token;
      updateUser(currentUser);
      return currentUser;
    });
    syncInFlightRef.current = { token, promise };
    try {
      return await promise;
    } finally {
      if (syncInFlightRef.current?.promise === promise) syncInFlightRef.current = null;
    }
  }, [updateUser]);

  useEffect(() => {
    let active = true;
    const synchronize = async (session) => {
      try {
        await loadDomainUser(session);
      } catch {
        if (active) {
          setAccessToken(null);
          synchronizedTokenRef.current = null;
          updateUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => synchronize(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => { void synchronize(session); }, 0);
    });

    return () => { active = false; subscription.unsubscribe(); };
  }, [loadDomainUser, updateUser]);

  const login = useCallback(async (credentials) => {
    const session = await signInWithEmail(credentials);
    try {
      return await loadDomainUser(session);
    } catch (error) {
      await signOut().catch(() => {});
      setAccessToken(null);
      synchronizedTokenRef.current = null;
      updateUser(null);
      throw error;
    }
  }, [loadDomainUser, updateUser]);

  const register = useCallback(async (payload) => {
    return signUpWithEmail(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      setAccessToken(null);
      synchronizedTokenRef.current = null;
      updateUser(null);
    }
  }, [updateUser]);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return loadDomainUser(data.session);
  }, [loadDomainUser]);

  const value = {
    user,
    setUser: updateUser,
    loading,
    isAuthenticated: !!user,
    hasRole: (role) => !!user && (user.role === role || (user.roles || []).includes(role)),
    login,
    register,
    logout,
    refreshUser,
    resendEmailConfirmation,
    requestPasswordReset,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
