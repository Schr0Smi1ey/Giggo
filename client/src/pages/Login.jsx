import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema } from '../validators/auth.schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage } from '../api/client.js';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';

export default function Login() {
  const { login, resendEmailConfirmation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const confirmationPending = location.state?.confirmationPending;
  const [resending, setResending] = useState(false);
  const resendInFlight = useRef(false);
  const [feedback, setFeedback] = useState('');
  const [retryAt, setRetryAt] = useState(() => {
    try { return Number(sessionStorage.getItem('giggo-verification-retry-at')) || (confirmationPending ? Date.now() + 60000 : 0); }
    catch { return confirmationPending ? Date.now() + 60000 : 0; }
  });
  const [now, setNow] = useState(Date.now);
  const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));

  useEffect(() => {
    try { sessionStorage.setItem('giggo-verification-retry-at', String(retryAt)); } catch { /* Storage may be disabled. */ }
    if (retryAt <= Date.now()) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  const { register, handleSubmit, getValues, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: location.state?.email || '', password: '' },
  });

  const onResend = async () => {
    if (resendInFlight.current || Date.now() < retryAt) return;
    const email = getValues('email').trim();
    if (!loginSchema.shape.email.safeParse(email).success) {
      setError('email', { message: 'Enter your signup email to resend the link.' }, { shouldFocus: true });
      return;
    }
    clearErrors('email');
    resendInFlight.current = true;
    setResending(true);
    setFeedback('');
    try {
      await resendEmailConfirmation(email);
      setFeedback('If this account needs confirmation, a new link has been requested. Check your inbox and spam folder.');
    } catch (error) {
      setFeedback(apiErrorMessage(error, 'Could not resend the link. Please try again later.'));
    } finally {
      const timestamp = Date.now();
      setNow(timestamp);
      setRetryAt(timestamp + 60000);
      resendInFlight.current = false;
      setResending(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Login failed'));
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Log in to Giggo</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your details.</p>
      {confirmationPending && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Confirm your email from the message we sent, then log in.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand-700 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>

      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        <p className="text-sm text-slate-600">Haven’t received your verification email? Enter your signup email above.</p>
        <Button type="button" variant="secondary" className="mt-3 w-full" onClick={onResend} loading={resending} disabled={remaining > 0 || resending || isSubmitting}>
          {remaining > 0 ? `Resend available in ${remaining}s` : 'Resend verification link'}
        </Button>
        {feedback && <p role="status" className="mt-3 text-sm text-slate-700">{feedback}</p>}
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
