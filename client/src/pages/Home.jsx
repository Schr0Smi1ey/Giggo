import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Users, Workflow } from 'lucide-react';
import { Button } from '../components/Button.jsx';

const categories = ['Web Development', 'UI/UX Design', 'Mobile Development', 'DevOps', 'Content Writing', 'Digital Marketing', 'Data Science', 'Admin Support'];
const stats = [['2 roles', 'Freelancers and clients'], ['Structured', 'Proposals to contracts'], ['Local-first', 'Built for Bangladesh'], ['Upcoming', 'BDT payment protection']];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/35">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/60 dark:text-brand-200">
            <Users className="h-3.5 w-3.5" /> Bangladesh-first freelance marketplace
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-normal text-foreground md:text-5xl">
            Hire Bangladeshi talent through a structured project workflow
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-subtle">
            Giggo connects freelancers and clients with profiles, proposals, offers, contracts,
            workspaces, messaging, and notifications in one professional marketplace flow.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-surface p-2 shadow-soft">
            <Search className="ml-2 h-5 w-5 text-subtle" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-0"
              placeholder="Try 'React developer' or 'logo design'"
              aria-label="Search talent or jobs"
            />
            <Link to="/find-talent"><Button>Search</Button></Link>
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/register"><Button variant="primary" size="lg">Get started</Button></Link>
            <Link to="/find-jobs"><Button variant="secondary" size="lg">Browse jobs</Button></Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {stats.map(([n, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-brand-700 dark:text-brand-300">{n}</div>
              <div className="mt-1 text-sm text-subtle">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Popular categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c} to="/find-talent" className="rounded-xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700">
              <span className="font-medium text-foreground">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-muted/55">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-3">
          {[
            [ShieldCheck, 'Trust-building profiles', 'Freelancers can present experience, skills, portfolio work, and verification progress.'],
            [Workflow, 'Structured hiring', 'Clients move from job posts to proposals, offers, contracts, and project workspaces.'],
            [Users, 'Local opportunity', 'Designed around Bangladeshi freelancers, students, freshers, startups, and SMEs.'],
          ].map(([Icon, title, desc]) => (
            <div key={title} className="rounded-xl border border-border bg-surface p-6 shadow-soft">
              <Icon className="h-8 w-8 text-brand-700 dark:text-brand-300" />
              <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-subtle">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground">Ready to start your Giggo workflow?</h2>
        <p className="mt-2 text-subtle">Create an account as a freelancer or client and continue from onboarding.</p>
        <Link to="/register" className="mt-6 inline-block"><Button size="lg">Create your free account</Button></Link>
      </section>
    </div>
  );
}
