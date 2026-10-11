import { forwardRef } from 'react';
import clsx from 'clsx';

/** Accessible labeled textarea with error + optional character hint. */
export const Textarea = forwardRef(function Textarea(
  { label, id, error, hint, className, rows = 4, required, ...props },
  ref
) {
  const areaId = id || props.name;
  const errId = error ? `${areaId}-error` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}{required && <span className="text-red-500" aria-hidden="true"> *</span>}
        </label>
      )}
      <textarea
        id={areaId}
        ref={ref}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={errId}
        required={required}
        className={clsx(
          'w-full rounded-lg border bg-surface px-3 py-2 text-sm leading-6 text-foreground shadow-sm placeholder:text-subtle',
          'transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70',
          error ? 'border-red-400' : 'border-border',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {error && (
        <p id={errId} className="mt-1.5 text-xs text-red-600 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
