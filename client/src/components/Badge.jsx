import clsx from 'clsx';

const variants = {
  neutral: 'bg-muted text-subtle ring-border',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100 dark:bg-brand-900/45 dark:text-brand-200 dark:ring-brand-800',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900',
  warning: 'bg-amber-50 text-amber-800 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900',
  danger: 'bg-red-50 text-red-700 ring-red-100 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900',
  info: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900',
};

export function Badge({ variant = 'neutral', className, children }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', variants[variant], className)}>
      {children}
    </span>
  );
}
