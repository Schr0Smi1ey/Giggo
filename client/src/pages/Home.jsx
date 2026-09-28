import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileSignature,
  GraduationCap,
  Handshake,
  Layers3,
  Link2,
  MapPin,
  MessageCircle,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
  WalletCards,
  Workflow,
  Zap,
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
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_25%_15%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(14,116,144,0.16),transparent_30%),linear-gradient(135deg,rgba(20,184,166,0.08),transparent)] blur-2xl dark:bg-[radial-gradient(circle_at_25%_15%,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(34,197,94,0.12),transparent_30%)]" />
      <div className="absolute left-8 right-8 top-20 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
      <div className="absolute bottom-20 left-16 right-10 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      <div className="relative rounded-[2rem] border border-border/80 bg-surface/85 p-4 shadow-2xl shadow-brand-950/10 backdrop-blur-xl dark:bg-surface/75 dark:shadow-black/35 sm:p-5">
        <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.52)_42%,transparent_60%)] opacity-40 dark:opacity-10" />
        <div className="relative flex items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-700 text-white dark:bg-brand-400 dark:text-brand-950">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Giggo match desk</p>
              <p className="text-xs text-subtle">Live hiring path</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
            <Radio className="h-3.5 w-3.5" /> Active
          </span>
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 rounded-2xl border border-border bg-background p-4 shadow-lg shadow-brand-950/5 dark:bg-background/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Job card</p>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-foreground">Mobile app design project</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-subtle">
                  <MapPin className="h-3.5 w-3.5" /> Dhaka startup
                </p>
              </div>
              <div className="rounded-xl bg-muted px-3 py-2 text-right">
                <p className="text-[11px] text-subtle">Budget</p>
                <p className="font-semibold text-foreground">৳30,000</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Figma', 'Mobile UX', 'Prototype'].map((skill) => (
                <Badge key={skill} variant="neutral">{skill}</Badge>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-dashed border-brand-200 bg-brand-50/65 p-3 dark:border-brand-900 dark:bg-brand-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-800 dark:text-brand-100">
                <Search className="h-4 w-4" />
                Matching with 12 relevant profiles
              </div>
            </div>
          </div>

          <div className="relative z-20 rounded-2xl border border-border bg-background p-4 shadow-xl shadow-brand-950/10 dark:bg-background/80">
            <div className="flex items-center gap-3">
              <Avatar name="Nusrat Jahan" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Nusrat Jahan</p>
                <p className="text-xs text-subtle">UI/UX Designer · Chattogram</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/50 p-3">
                <p className="text-subtle">Profile</p>
                <p className="mt-1 font-semibold text-foreground">Public</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-3">
                <p className="text-subtle">Fit</p>
                <p className="mt-1 font-semibold text-foreground">Strong</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-200">
              <UserRoundCheck className="h-4 w-4" />
              Proposal ready to review
            </div>
          </div>
        </div>

        <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Proposal', 'Submitted', Send],
            ['Offer', 'Sent by client', FileSignature],
            ['Contract', 'Active workspace', ShieldCheck],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl border border-border bg-background/85 p-3 shadow-sm dark:bg-background/70">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-subtle">{label}</p>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudiencePanel({ panel }) {
  const Icon = panel.icon;
  const isClientPanel = panel.eyebrow === 'For clients';

  return (
    <Card interactive className="relative overflow-hidden p-6">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-900/30" />
      <div className="relative flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-900/50 dark:text-brand-200 dark:ring-brand-900">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">{panel.eyebrow}</p>
      </div>
      <h3 className="relative mt-5 text-2xl font-semibold tracking-normal text-foreground">{panel.title}</h3>
      <p className="relative mt-3 text-sm leading-6 text-subtle">{panel.description}</p>

      <div className="relative mt-5 rounded-2xl border border-border bg-muted/35 p-4">
        {isClientPanel ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface p-3">
              <div>
                <p className="text-xs text-subtle">New project</p>
                <p className="text-sm font-semibold text-foreground">Post job → shortlist</p>
              </div>
              <Badge variant="success">3 proposals</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Review', 'Offer', 'Contract'].map((item, index) => (
                <div key={item} className="rounded-xl border border-border bg-background p-2 text-center">
                  <p className="text-[11px] font-medium text-subtle">0{index + 1}</p>
                  <p className="text-xs font-semibold text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
              <Avatar name="Araf Rahman" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Portfolio-ready profile</p>
                <p className="text-xs text-subtle">Skills, work samples, availability</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Zap className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" />
                Matched opportunity
              </div>
              <p className="mt-1 text-xs text-subtle">Submit proposal and continue in messages</p>
            </div>
          </div>
        )}
      </div>

      <ul className="relative mt-5 space-y-3">
        {panel.bullets.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
            {item}
          </li>
        ))}
      </ul>
      <ActionLink to={panel.to} variant="secondary" className="relative mt-6">
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
  const featured = jobs[0];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-border bg-muted/35 p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              {apiJobs.length > 0 ? 'Live marketplace pulse' : 'Marketplace pulse preview'}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">Opportunity, talent, and next action in one loop.</h2>
            <p className="mt-3 text-sm leading-6 text-subtle">
              Giggo should feel like an active marketplace, not a static directory. This pulse uses live jobs when available and falls back gracefully when the board is empty.
            </p>
            <ActionLink to="/find-jobs" variant="secondary" className="mt-5">Explore work</ActionLink>
          </div>

          <div className="p-4 sm:p-5">
            {isLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <div className="grid gap-4 md:grid-cols-[1fr_0.82fr_0.82fr]">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-subtle">{featured.category}</p>
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground">{featured.title}</h3>
                    </div>
                    <Badge variant="brand">Open</Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-brand-700 dark:text-brand-300">{featured.budget}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(featured.skills.length ? featured.skills : ['Proposal', 'Collaboration']).slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="neutral">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/35 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name="Rafi Ahmed" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Matched freelancer</p>
                      <p className="text-xs text-subtle">Available this week</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl bg-surface p-3 text-xs text-subtle">
                    Profile, skills, and proposal context stay connected.
                  </div>
                </div>
                <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/30">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-800 dark:text-brand-100">
                    <Clock3 className="h-4 w-4" />
                    Next action
                  </div>
                  <p className="mt-3 text-sm leading-6 text-brand-800/80 dark:text-brand-100/75">
                    Review proposal, send offer, then move into a contract workspace.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

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
  const { isAuthenticated, hasRole } = useAuth();
  const isFreelancer = hasRole('freelancer');
  const isClient = hasRole('client');
  const primaryAccountRoute = isAuthenticated ? '/dashboard' : '/register';
  const primaryAccountLabel = isAuthenticated ? 'Go to dashboard' : 'Create account';

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50 via-background to-background dark:from-brand-950/35 dark:via-background dark:to-background">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,118,110,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.08)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)] dark:bg-[linear-gradient(rgba(45,212,191,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.08)_1px,transparent_1px)]" />
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-500/10" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur dark:border-brand-900 dark:bg-brand-950/45 dark:text-brand-200">
              <Sparkles className="h-3.5 w-3.5" /> Bangladesh-first freelance marketplace
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Where Bangladesh finds talent and opportunity.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-subtle sm:text-lg">
              Giggo connects Bangladeshi freelancers with clients through one structured marketplace for discovering work, hiring talent, collaborating, and managing projects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink to="/find-jobs">
                Find Work <ArrowRight className="h-4 w-4" />
              </ActionLink>
              <ActionLink to="/find-talent" variant="secondary">
                Find Talent
              </ActionLink>
              {(!isAuthenticated || isClient) && (
                <ActionLink to={isAuthenticated ? '/dashboard/jobs/new' : '/register'} variant="secondary">
                  {isAuthenticated ? 'Post a Job' : 'Get Started'}
                </ActionLink>
              )}
            </div>
            {isAuthenticated && (
              <p className="mt-4 text-sm text-subtle">
                {isFreelancer ? 'Welcome back. Your work discovery and dashboard are ready.' : 'Welcome back. Continue hiring or manage your dashboard.'}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-4 text-xs font-medium text-subtle">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-300" /> Profiles</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-300" /> Proposals</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-300" /> Contracts</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-300" /> Messages</span>
            </div>
          </div>
          <HeroMarketplacePreview />
        </div>
      </section>

      <MarketplacePreview />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Two-sided marketplace</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">Clients and freelancers meet around a clear path.</h2>
          <p className="mt-3 text-sm leading-6 text-subtle">
            Giggo serves the people creating opportunities and the people ready to deliver them.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <AudiencePanel panel={audiencePanels[0]} />
          <div className="relative mx-auto hidden h-full min-h-80 w-28 place-items-center lg:grid">
            <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-brand-300 to-transparent dark:via-brand-800" />
            <div className="relative grid h-24 w-24 place-items-center rounded-[2rem] border border-brand-200 bg-background shadow-xl shadow-brand-950/10 dark:border-brand-900">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white dark:bg-brand-400 dark:text-brand-950">
                <Layers3 className="h-6 w-6" />
              </div>
              <span className="absolute -left-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-400" />
              <span className="absolute -right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-emerald-400" />
            </div>
            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-subtle">Giggo</p>
          </div>
          <AudiencePanel panel={audiencePanels[1]} />
        </div>
      </section>

      <section id="how-giggo-works" className="border-y border-border bg-surface/55">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">How Giggo works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">A clearer path from discovery to delivery.</h2>
            <p className="mt-3 text-sm leading-6 text-subtle">
              Giggo is more than a listing board. It connects hiring, communication, agreement, and project collaboration.
            </p>
          </div>
          <div className="relative mt-10">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-border max-md:block" />
            <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-brand-200 via-brand-500 to-emerald-300 md:block dark:from-brand-900 dark:via-brand-600 dark:to-emerald-800" />
            <div className="grid gap-5 md:grid-cols-4">
            {workflow.map(([title, description, Icon], index) => (
              <Card key={title} className="relative overflow-hidden p-5">
                <div className="absolute right-4 top-4 text-5xl font-semibold text-muted/70 dark:text-muted/25">0{index + 1}</div>
                <div className="relative flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-white shadow-lg shadow-brand-950/10 dark:bg-brand-400 dark:text-brand-950">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CircleDot className="h-4 w-4 text-brand-500 dark:text-brand-300" />
                </div>
                <h3 className="relative mt-5 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-subtle">{description}</p>
                <div className="mt-5 rounded-xl border border-border bg-muted/45 p-3 text-xs font-medium text-foreground">
                  {index === 0 && 'Job board + talent search'}
                  {index === 1 && 'Proposal + conversation'}
                  {index === 2 && 'Offer + contract terms'}
                  {index === 3 && 'Workspace + updates'}
                </div>
              </Card>
            ))}
            </div>
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
            <Card key={title} className={clsx('p-5', title === 'Structured hiring' && 'lg:col-span-2', title === 'Work in one place' && 'lg:col-span-2')}>
              <Icon className="h-6 w-6 text-brand-700 dark:text-brand-300" />
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-subtle">{description}</p>
            </Card>
          ))}
        </div>
      </section>

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
