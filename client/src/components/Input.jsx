import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

/** Accessible labeled text input with error display. */
export const Input = forwardRef(function Input(
  { label, id, error, type = 'text', className, hint, ...props },
  ref
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || props.name;
  const errId = error ? `${inputId}-error` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
      <input
        id={inputId}
        ref={ref}
        type={isPassword && passwordVisible ? 'text' : type}
        aria-invalid={!!error}
        aria-describedby={errId}
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30',
          error ? 'border-red-400' : 'border-slate-300',
          isPassword && 'pr-11',
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setPasswordVisible((visible) => !visible)}
          disabled={props.disabled}
          aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {passwordVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={errId} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
