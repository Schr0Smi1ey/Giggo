import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  FileSignature,
  GraduationCap,
  Handshake,
  MapPin,
  MessageCircle,
  Send,
  Users,
  WalletCards,
  Workflow,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useJobs } from '../services/jobs.js';
import { Badge } from '../components/Badge.jsx';
import { Card } from '../components/Card.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Skeleton } from '../components/Loaders.jsx';

const demoJobs = [
  {
    title: 'Frontend Developer for E-commerce Platform',
    budget: '৳25,000 - ৳40,000',
    category: 'Development & IT',
    skills: ['React', 'Tailwind', 'API integration'],
  },
  {
    title: 'UI/UX Designer for Mobile App',
    budget: '৳20,000 - ৳30,000',
    category: 'Design & Creative',
    skills: ['Figma', 'Mobile UX', 'Prototype'],
  },
  {
    title: 'Content Writer for SaaS Product',
    budget: '৳8,000 - ৳15,000',
    category: 'Writing & Translation',
    skills: ['Landing pages', 'SEO', 'Product copy'],
  },
];

const audiencePanels = [
  {
    eyebrow: 'For clients',
    title: 'Hire Bangladesh-based talent with structure.',
    description: 'Post opportunities, review proposals, send offers, create contracts, and keep collaboration organized through projects and messages.',
    bullets: ['Discover skilled local freelancers', 'Review proposals before hiring', 'Manage contracts and project workspaces'],
    cta: 'Find Talent',
    to: '/find-talent',
    icon: BriefcaseBusiness,
  },
  {
    eyebrow: 'For freelancers',
    title: 'Build a professional path into freelance work.',
    description: 'Create a profile, discover relevant projects, submit proposals, manage offers, and grow your experience with real client work.',
    bullets: ['Showcase skills and portfolio work', 'Find practical projects', 'Track offers, contracts, and messages'],
    cta: 'Find Work',
    to: '/find-jobs',
    icon: Users,
  },
];

const workflow = [
  ['Discover', 'Clients find talent and freelancers find relevant work.', BriefcaseBusiness],
  ['Connect', 'Proposals and messages help both sides understand the fit.', Send],
  ['Agree', 'Offers and contracts turn interest into clear working terms.', Handshake],
  ['Deliver', 'Project workspaces keep collaboration and updates in one place.', Workflow],
];

const values = [
  ['Bangladesh-first', 'Designed around Bangladesh freelancers, clients, students, freshers, startups, and SMEs.', MapPin],
  ['Structured hiring', 'Move from discovery to proposal, offer, contract, and workspace without losing context.', FileSignature],
  ['Built for new talent too', 'Profiles and practical opportunities lower the entry barrier without excluding experienced professionals.', GraduationCap],
  ['Work in one place', 'Projects, messaging, and notifications keep the relationship organized after hiring.', MessageCircle],
];

const trustItems = [
  ['Professional profiles', 'Freelancers can present skills, experience, portfolios, and verification progress.', Users],
  ['Offers and contracts', 'Clients and freelancers can agree on structured terms before work starts.', FileSignature],
  ['Direct messaging', 'Conversations stay connected to hiring and project collaboration.', MessageCircle],
  ['Notifications', 'Important marketplace activity is easier to follow.', Bell],
];

function moneyFromBudget(budget) {
  if (!budget) return 'Budget listed in project details';
  const min = Number(budget.min || 0);
  const max = Number(budget.max || 0);
  const suffix = budget.type === 'hourly' ? '/hr' : '';
  const amount = (value) => `৳${Number(value || 0).toLocaleString()}`;
  if (min && max && min !== max) return `${amount(min)} - ${amount(max)}${suffix}`;
  if (max || min) return `${amount(max || min)}${suffix}`;
  return 'Budget listed in project details';
}

function ActionLink({ to, variant = 'primary', children, className }) {
  return (
    <Link
      to={to}
      className={clsx(
        'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variant === 'primary'
          ? 'bg-brand-700 text-white shadow-sm hover:bg-brand-800 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400'
          : 'border border-border bg-surface text-foreground shadow-sm hover:bg-muted',
        className
      )}
    >
      {children}
    </Link>
  );
}

function HeroMarketplacePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[570px] py-8 sm:py-10 lg:py-0">
      <div className="absolute inset-x-10 inset-y-8 rounded-[2.5rem] bg-brand-300/20 blur-3xl dark:bg-brand-500/10" />

      <div className="relative ml-auto overflow-hidden rounded-[1.75rem] border border-white/80 bg-surface/95 p-5 shadow-[0_28px_65px_-30px_rgba(15,23,42,0.42)] ring-1 ring-brand-950/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/95 dark:ring-white/5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-700 via-emerald-500 to-brand-400 dark:from-brand-400 dark:via-emerald-400" />
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Opportunity workspace</p>
              <p className="text-xs text-subtle">A clearer way to hire and be hired</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Open
          </span>
        </div>

        <div className="pb-14 pt-6 sm:pb-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">Design & Creative</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground">Mobile App UI/UX Designer</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-subtle">
                <MapPin className="h-4 w-4" /> Dhaka, Bangladesh
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/55 px-3.5 py-3 sm:text-right">
              <p className="text-xs font-medium text-subtle">Fixed project</p>
              <p className="mt-1 text-lg font-semibold text-foreground">৳30,000</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-border bg-muted/35 p-4">
              <p className="text-xs font-medium text-subtle">Looking for</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Figma', 'Mobile UI', 'Prototype'].map((skill) => (
                  <span key={skill} className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-border dark:bg-slate-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-brand-700 p-4 text-white dark:bg-brand-500 dark:text-brand-950">
              <p className="text-xs font-medium opacity-80">Posted by</p>
              <p className="mt-1 font-semibold">Orbit Labs</p>
              <p className="mt-1 text-xs opacity-80">Verified client · Dhaka</p>
            </div>
          </div>

        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-border bg-surface/95 p-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.38)] backdrop-blur dark:bg-slate-800/95 sm:absolute sm:-bottom-7 sm:-left-7 sm:mt-0 sm:w-[292px]">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Matched freelancer</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar name="Nusrat Jahan" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">Nusrat Jahan</p>
            <p className="text-sm text-subtle">UI/UX Designer · Chattogram</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="font-medium text-subtle">Figma · Product Design</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">Available</span>
        </div>
      </div>

    </div>
  );
}

function AudiencePanel({ panel }) {
  const Icon = panel.icon;
  return (
    <Card interactive className="p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">{panel.eyebrow}</p>
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-normal text-foreground">{panel.title}</h3>
      <p className="mt-3 text-sm leading-6 text-subtle">{panel.description}</p>
      <ul className="mt-5 space-y-3">
        {panel.bullets.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
            {item}
          </li>
        ))}
      </ul>
      <ActionLink to={panel.to} variant="secondary" className="mt-6">
        {panel.cta} <ArrowRight className="h-4 w-4" />
      </ActionLink>
    </Card>
  );
}

function MarketplacePreview() {
  const { data, isLoading, isError } = useJobs({ limit: 3, sort: 'recent' }, { staleTime: 60_000 });
  const apiJobs = data?.items || [];
  const jobs = apiJobs.length > 0
    ? apiJobs.slice(0, 3).map((job) => ({
        title: job.title,
        budget: moneyFromBudget(job.budget),
        category: job.category || 'Marketplace project',
        skills: job.skills?.slice(0, 3) || [],
        id: job._id || job.id,
      }))
    : demoJobs;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="brand">{apiJobs.length > 0 ? 'Recent opportunities' : 'Marketplace preview'}</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">See the marketplace taking shape.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-subtle">
            Browse real project opportunities when available. If the live board is empty, these examples show the kind of local work Giggo is designed to support.
          </p>
        </div>
        <ActionLink to="/find-jobs" variant="secondary">Explore work</ActionLink>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-52" />)
          : jobs.map((job) => (
              <Card key={job.id || job.title} interactive className="p-5">
                <p className="text-xs font-medium text-subtle">{job.category}</p>
                <h3 className="mt-3 min-h-14 text-lg font-semibold text-foreground">{job.title}</h3>
                <p className="mt-3 text-base font-semibold text-brand-700 dark:text-brand-300">{job.budget}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(job.skills.length ? job.skills : ['Proposal', 'Collaboration']).map((skill) => (
                    <Badge key={skill} variant="neutral">{skill}</Badge>
                  ))}
                </div>
              </Card>
            ))}
      </div>

      {isError && (
        <p className="mt-4 text-sm text-subtle">
          Live jobs could not be loaded, so this section is showing presentation examples.
        </p>
      )}
    </section>
  );
}

function PaymentPreview() {
  const flow = ['Client funds project', 'Work delivered', 'Client approval', 'Freelancer payout'];

  return (
    <section className="bg-muted/45">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Badge variant="warning">Coming soon</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground">Built toward simpler local payments.</h2>
          <p className="mt-4 text-sm leading-6 text-subtle">
            Giggo is being designed for a future BDT-based payment flow where clients can fund work and freelancers can receive project earnings through supported local payment partners.
          </p>
          <p className="mt-3 text-xs text-subtle">
            Payment protection, payouts, provider integrations, and platform fees are planned features, not live functionality.
          </p>
        </div>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-subtle">Project value</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">৳25,000</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
              <WalletCards className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {flow.map((item) => (
              <div key={item} className="rounded-lg border border-border bg-muted/50 p-3">
                <p className="text-xs font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-subtle">Giggo platform fee</p>
              <p className="mt-1 font-semibold text-foreground">Planned</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-subtle">Freelancer payout</p>
              <p className="mt-1 font-semibold text-foreground">Coming soon</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const primaryAccountRoute = isAuthenticated ? '/dashboard' : '/register';
  const primaryAccountLabel = isAuthenticated ? 'Go to dashboard' : 'Create account';

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand-50/90 via-background to-background dark:from-brand-950/25 dark:via-background dark:to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(16,185,129,0.15),transparent_29%),radial-gradient(circle_at_5%_94%,rgba(20,184,166,0.09),transparent_28%)] dark:bg-[radial-gradient(circle_at_78%_28%,rgba(45,212,191,0.12),transparent_30%),radial-gradient(circle_at_5%_94%,rgba(16,185,129,0.08),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:min-h-[690px] lg:grid-cols-[0.45fr_0.55fr] lg:items-center lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              Bangladesh-first freelance marketplace
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.55rem] lg:leading-[1.06]">
              Where Bangladesh finds talent and opportunity.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-subtle sm:text-lg">
              Giggo connects Bangladeshi freelancers with clients through one structured marketplace for discovering work, hiring talent, collaborating, and managing projects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink to="/find-jobs" className="group">
                Find Work <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </ActionLink>
              <ActionLink to="/find-talent" variant="secondary">
                Find Talent
              </ActionLink>
            </div>
            <p className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-subtle">
              <span>Bangladesh-focused</span><span className="text-brand-500">•</span><span>Structured hiring</span><span className="text-brand-500">•</span><span>Built for freelancers & clients</span>
            </p>
          </div>
          <HeroMarketplacePreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="brand">Two-sided marketplace</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">One marketplace. Two ways to grow.</h2>
          <p className="mt-3 text-sm leading-6 text-subtle">
            Giggo serves the people creating opportunities and the people ready to deliver them.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {audiencePanels.map((panel) => <AudiencePanel key={panel.eyebrow} panel={panel} />)}
        </div>
      </section>

      <section id="how-giggo-works" className="border-y border-border bg-surface/55">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="neutral">How Giggo works</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">A clearer path from discovery to delivery.</h2>
            <p className="mt-3 text-sm leading-6 text-subtle">
              Giggo is more than a listing board. It connects hiring, communication, agreement, and project collaboration.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {workflow.map(([title, description, Icon], index) => (
              <Card key={title} className="relative p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-subtle">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-subtle">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="brand">Why Giggo</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">Built for local freelance growth.</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(([title, description, Icon]) => (
            <Card key={title} className="p-5">
              <Icon className="h-6 w-6 text-brand-700 dark:text-brand-300" />
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-subtle">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <MarketplacePreview />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge variant="success">Current platform capabilities</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">Professional workflow, not just profiles.</h2>
            <p className="mt-3 text-sm leading-6 text-subtle">
              Giggo already supports the relationship layers a freelance marketplace needs: identity, discovery, proposals, agreement, communication, project spaces, and activity updates.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {trustItems.map(([title, description, Icon]) => (
              <Card key={title} className="p-5">
                <Icon className="h-5 w-5 text-brand-700 dark:text-brand-300" />
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-subtle">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PaymentPreview />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="grid gap-8 overflow-hidden p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge variant="info">Students and freshers</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground">Start building experience before graduation.</h2>
            <p className="mt-4 text-sm leading-6 text-subtle">
              Giggo can help new freelancers create a professional profile, showcase skills, discover practical projects, and build work history over time while experienced professionals continue to grow.
            </p>
            <ActionLink to="/find-jobs" className="mt-6">
              Find Work <ArrowRight className="h-4 w-4" />
            </ActionLink>
          </div>
          <div className="grid gap-3">
            {['Create a professional profile', 'Showcase skills and portfolio work', 'Discover practical projects', 'Build work history over time'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-muted/45 p-4">
                <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-300" />
                <span className="font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Badge variant="brand">Ready when you are</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">Ready to find your next opportunity?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-subtle">
            Whether you are hiring for a project or looking for meaningful freelance work, Giggo gives both sides a clearer way to move forward.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ActionLink to="/find-jobs">Find Work</ActionLink>
            <ActionLink to="/find-talent" variant="secondary">Find Talent</ActionLink>
            <ActionLink to={primaryAccountRoute} variant="secondary">{primaryAccountLabel}</ActionLink>
          </div>
        </div>
      </section>
    </div>
  );
}
