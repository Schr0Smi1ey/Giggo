import { Link } from 'react-router-dom';
import { Logo } from './brand/Logo.jsx';

const groups = [
  { title: 'Product', links: [['Find Work', '/find-jobs'], ['Find Talent', '/find-talent'], ['How It Works', '/how-it-works']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact']] },
  { title: 'Resources', links: [['Help Center', '/help'], ['Terms', '/terms'], ['Privacy', '/privacy']] },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Link to="/" aria-label="Giggo home" className="inline-flex rounded-lg">
            <Logo />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-subtle">
            Bangladesh-first marketplace connecting talented freelancers with clients through a structured hiring and project workflow.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{g.title}</h3>
            <ul className="space-y-2">
              {g.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-subtle transition hover:text-brand-700 dark:hover:text-brand-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-subtle">
        (c) {new Date().getFullYear()} Giggo. Built for structured freelance collaboration in Bangladesh.
      </div>
    </footer>
  );
}
