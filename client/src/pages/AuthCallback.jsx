import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { completeAuthRedirect } from '../services/supabaseAuth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Loaders.jsx';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('loading');
  const operation = useRef(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    let timer;
    operation.current ||= completeAuthRedirect();
    operation.current
      .then(async (session) => {
        if (!active) return;
        if (!session) throw new Error('No session was returned after email confirmation');
        await refreshUser();
        if (!active) return;
        setStatus('success');
        timer = window.setTimeout(() => navigate('/dashboard', { replace: true }), 900);
      })
      .catch((error) => { if (active) { setMessage(error.response?.data?.message || error.message); setStatus('error'); } });
    return () => { active = false; window.clearTimeout(timer); };
  }, [navigate, refreshUser]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {status === 'loading' && <><Spinner className="h-8 w-8" /><p className="mt-4 text-slate-600">Confirming your email…</p></>}
      {status === 'success' && <><CheckCircle2 className="h-12 w-12 text-brand-600" /><h1 className="mt-4 text-2xl font-bold text-slate-900">Email confirmed</h1><p className="mt-2 text-slate-500">Taking you to your dashboard…</p></>}
      {status === 'error' && <><XCircle className="h-12 w-12 text-red-500" /><h1 className="mt-4 text-2xl font-bold text-slate-900">Could not complete sign-in</h1><p role="alert" className="mt-2 text-slate-500">{message}</p><Link to="/login" className="mt-6"><Button>Log in or resend verification</Button></Link></>}
    </div>
  );
}
