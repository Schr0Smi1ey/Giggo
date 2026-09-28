import { Monitor, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext.jsx';

const options = [
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
  { value: 'system', label: 'Use system theme', icon: Monitor },
];

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={clsx('inline-flex rounded-full border border-border bg-muted p-1', className)}
      role="group"
      aria-label="Theme"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          title={label}
          className={clsx(
            'grid h-8 w-8 place-items-center rounded-full text-subtle transition',
            'hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            theme === value && 'bg-surface text-brand-700 shadow-sm dark:text-brand-200'
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
