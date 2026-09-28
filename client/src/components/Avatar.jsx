import clsx from 'clsx';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'G') + (parts[1]?.[0] || '');
}

export function Avatar({ src, name = 'Giggo user', size = 'md', className }) {
  return (
    <span className={clsx('inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 font-semibold uppercase text-brand-800 ring-1 ring-border dark:bg-brand-900 dark:text-brand-100', sizes[size], className)}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </span>
  );
}
