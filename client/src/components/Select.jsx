import { forwardRef } from 'react';
import clsx from 'clsx';

/** Accessible labeled select. `options` = [{ value, label }]. */
export const Select = forwardRef(function Select(
  { label, id, error, hint, options = [], placeholder, className, children, required, ...props },
  ref
) {
  const selectId = id || props.name;
  const errId = error ? `${selectId}-error` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}{required && <span className="text-red-500" aria-hidden="true"> *</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={errId}
        required={required}
        className={clsx(
          'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground shadow-sm',
          'transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70',
          error ? 'border-red-400' : 'border-border',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {error && (
        <p id={errId} className="mt-1.5 text-xs text-red-600 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
