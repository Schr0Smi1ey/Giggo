import clsx from 'clsx';

export function EmptyState({ icon: Icon, title, description, primaryAction, secondaryAction, className }) {
  return (
    <div className={clsx('rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center', className)}>
      {Icon && (
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/45 dark:text-brand-200">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-subtle">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
