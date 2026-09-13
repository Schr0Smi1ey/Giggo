import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  const loadDomainUser = useCallback(async (session) => {
    if (!session?.access_token) {
      setAccessToken(null);
      setUser(null);
      return null;
    }

    setAccessToken(session.access_token);
    const response = await api.get('/auth/me');
    const currentUser = response.data.data.user;
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    let active = true;
    const synchronize = async (session) => {
      try {
        await loadDomainUser(session);
      } catch {
        if (active) {
          setAccessToken(null);
          setUser(null);
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
  }, [loadDomainUser]);

  const login = useCallback(async (credentials) => {
    const session = await signInWithEmail(credentials);
    return loadDomainUser(session);
  }, [loadDomainUser]);

  const register = useCallback(async (payload) => {
    return signUpWithEmail(payload);
  }, []);

  const logout = useCallback(async () => {
    try { await signOut(); } finally { setAccessToken(null); setUser(null); }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return loadDomainUser(data.session);
  }, [loadDomainUser]);

  const value = {
    user,
    setUser,
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
