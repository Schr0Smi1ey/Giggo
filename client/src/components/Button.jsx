import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400',
  secondary: 'border border-border bg-surface text-foreground shadow-sm hover:bg-muted',
  outline: 'border border-brand-300 bg-transparent text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-200 dark:hover:bg-brand-950/45',
  ghost: 'bg-transparent text-subtle hover:bg-muted hover:text-foreground',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:text-red-950 dark:hover:bg-red-400',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant] || variants.primary,
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
