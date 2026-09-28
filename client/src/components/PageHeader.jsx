import clsx from 'clsx';

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={clsx('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-subtle">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
