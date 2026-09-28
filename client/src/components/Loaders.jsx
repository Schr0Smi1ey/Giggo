import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export function Spinner({ className }) {
  return <Loader2 className={clsx('h-5 w-5 animate-spin text-brand-700 dark:text-brand-300', className)} aria-label="Loading" />;
}

/** Full-screen centered loader for route/auth bootstrap. */
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

/** Skeleton block for loading states. */
export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-md bg-muted', className)} />;
}
