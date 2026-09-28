import clsx from 'clsx';

export function Logo({ compact = false, className, markClassName, wordmarkClassName }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className={clsx('h-9 w-9 shrink-0', markClassName)}
      >
        <path
          d="M27.5 12.4a11 11 0 1 0 1.8 13.9"
          className="fill-none stroke-brand-700 dark:stroke-brand-300"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M20 20h11.5l-4.1 4.1"
          className="fill-none stroke-brand-500 dark:stroke-brand-100"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="27.5" cy="12.4" r="3.3" className="fill-brand-500 dark:fill-brand-100" />
        <circle cx="20" cy="20" r="3" className="fill-brand-700 dark:fill-brand-200" />
        <circle cx="29.3" cy="26.3" r="3.3" className="fill-brand-600 dark:fill-brand-100" />
      </svg>
      {!compact && (
        <span className={clsx('text-xl font-bold tracking-normal text-foreground', wordmarkClassName)}>
          Giggo
        </span>
      )}
    </span>
  );
}
