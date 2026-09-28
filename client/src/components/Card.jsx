import clsx from 'clsx';

export function Card({ as: Component = 'div', interactive = false, className, children, ...props }) {
  return (
    <Component
      className={clsx(
        'rounded-xl border border-border bg-surface shadow-soft',
        interactive && 'transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift dark:hover:border-brand-700',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
