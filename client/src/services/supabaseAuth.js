import { supabase } from '../lib/supabase.js';

function callbackUrl(path) {
  return `${window.location.origin}${path}`;
}

function throwIfError(error) {
  if (error) throw error;
}

export async function signUpWithEmail({ name, email, password, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl('/auth/callback'),
      data: { name, signup_role: role },
    },
  });
  throwIfError(error);
  return { needsEmailConfirmation: !data.session, user: data.user };
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  throwIfError(error);
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  throwIfError(error);
}

export async function resendEmailConfirmation(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: callbackUrl('/auth/callback') },
  });
  throwIfError(error);
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl('/reset-password'),
  });
  throwIfError(error);
}

export async function completeAuthRedirect() {
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  if (query.has('error') || fragment.has('error')) {
    throw new Error('This email link is invalid or expired. Log in if already verified, or request a new verification link.');
  }
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    throwIfError(error);
    return data.session;
  }

  const { data, error } = await supabase.auth.getSession();
  throwIfError(error);
  return data.session;
}

export async function updatePassword({ currentPassword, newPassword }) {
  const { error } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword });
  throwIfError(error);
}
