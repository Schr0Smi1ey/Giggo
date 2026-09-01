import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  FileSearch,
  Globe2,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const companies = [
  "Dhaka Digital Lab",
  "Sylhet Softworks",
  "Chattogram Studio",
  "Rajshahi Commerce",
  "Khulna Creative Co.",
  "Barishal Brands",
];

const steps = [
  {
    title: "Create your profile",
    description:
      "Freelancers add skills, portfolio links, CV details, and availability.",
    icon: UsersRound,
  },
  {
    title: "Get reviewed",
    description:
      "Admins review verification requests so trust indicators stay visible.",
    icon: ShieldCheck,
  },
  {
    title: "Apply or hire",
    description:
      "Clients post projects, compare proposals, shortlist, and move work forward.",
    icon: BriefcaseBusiness,
  },
];

const projects = [
  {
    title: "React landing page for fintech startup",
    client: "Nagad Growth Partner",
    location: "Dhaka",
    budget: "BDT 35k - 55k",
    type: "Fixed price",
    tags: ["React", "UI", "Fast delivery"],
  },
  {
    title: "Laravel marketplace dashboard",
    client: "Local Services Hub",
    location: "Remote",
    budget: "BDT 60k - 90k",
    type: "Milestone",
    tags: ["Laravel", "MySQL", "Dashboard"],
  },
  {
    title: "Brand kit and social campaign",
    client: "Cafe 26",
    location: "Khulna",
    budget: "BDT 18k - 28k",
    type: "Short project",
    tags: ["Branding", "Content", "Design"],
  },
];

const roles = [
  ["Frontend Developer", "128 projects"],
  ["UI/UX Designer", "96 projects"],
  ["WordPress Expert", "72 projects"],
  ["Content Writer", "64 projects"],
  ["Digital Marketer", "58 projects"],
  ["Mobile App Developer", "41 projects"],
  ["Data Analyst", "27 projects"],
  ["Video Editor", "24 projects"],
  ["Backend Developer", "36 projects"],
  ["SEO Specialist", "31 projects"],
  ["Graphic Designer", "82 projects"],
  ["QA Tester", "19 projects"],
];

const faqs = [
  {
    question: "Can I hire or work from outside Bangladesh?",
    answer:
      "The MVP is Bangladesh-first. It focuses on local discovery, trust, and proposal workflows before expanding internationally.",
  },
  {
    question: "Are payments included?",
    answer:
      "No. The course MVP intentionally excludes payments, escrow, payouts, invoices, and financial guarantees.",
  },
  {
    question: "What happens when I click login or register?",
    answer:
      "Those flows are planned but not implemented yet. This homepage keeps those actions visible and marks them as coming soon.",
  },
];

type Notice = {
  title: string;
  detail: string;
};

function App() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const year = useMemo(() => new Date().getFullYear(), []);

  const showComingSoon = (title: string) => {
    setNotice({
      title,
      detail:
        "This navigation is planned for the Giggo MVP, but only the homepage slice is implemented right now.",
    });
    setMenuOpen(false);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="nav-container" aria-label="Primary navigation">
          <button className="brand" onClick={() => scrollTo("top")}>
            <span className="brand-mark">G</span>
            <span>Giggo</span>
          </button>

          <button
            className="menu-toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            <button type="button" onClick={() => scrollTo("projects")}>
              Projects
            </button>
            <button type="button" onClick={() => scrollTo("roles")}>
              Talent
            </button>
            <button type="button" onClick={() => scrollTo("steps")}>
              How it works
            </button>
            <button type="button" onClick={() => showComingSoon("Marketplace")}>
              Marketplace
            </button>
          </div>

          <div className="nav-actions">
            <button type="button" onClick={() => showComingSoon("Login")}>
              Login
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => showComingSoon("Register")}
            >
              Register
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section section-wrap">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} />
              Bangladesh-first freelance marketplace
            </span>
            <h1>Your next skilled professional is one search away</h1>
            <p>
              Giggo connects clients with verified freelancers for design,
              development, writing, marketing, and business support projects.
            </p>

            <form
              className="search-panel"
              onSubmit={(event) => {
                event.preventDefault();
                showComingSoon("Project search");
              }}
            >
              <label>
                <span>What do you need?</span>
                <div className="field-shell">
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Search web design, content writing, SEO..."
                  />
                </div>
              </label>
              <label>
                <span>Location</span>
                <div className="field-shell">
                  <MapPin size={18} />
                  <select defaultValue="Bangladesh">
                    <option>Bangladesh</option>
                    <option>Dhaka</option>
                    <option>Khulna</option>
                    <option>Remote</option>
                  </select>
                </div>
              </label>
              <button className="primary-button search-button" type="submit">
                Find Talent
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="hero-stats" aria-label="Giggo marketplace stats">
              <span>
                <strong>1,200+</strong>
                Freelancers planned
              </span>
              <span>
                <strong>450+</strong>
                Project opportunities
              </span>
              <span>
                <strong>64</strong>
                Skill categories
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Giggo marketplace preview">
            <div className="profile-card featured-card">
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80"
                alt="Professionals working together in a bright workspace"
              />
              <div>
                <span className="status-pill">
                  <BadgeCheck size={15} />
                  Verified freelancer
                </span>
                <h2>Find trusted local talent faster</h2>
                <p>
                  Compare skills, portfolios, availability, and proposal fit in
                  one clean workflow.
                </p>
              </div>
            </div>
            <div className="floating-card top-card">
              <Star size={18} />
              <span>4.9 avg. client review</span>
            </div>
            <div className="floating-card bottom-card">
              <Clock3 size={18} />
              <span>Shortlist in minutes</span>
            </div>
          </div>
        </section>

        <section
          className="company-section section-wrap"
          aria-labelledby="company-title"
        >
          <div>
            <p className="section-kicker">Active onboarding</p>
            <h2 id="company-title">Project opportunities from growing teams</h2>
          </div>
          <div className="company-grid">
            {companies.map((company) => (
              <article className="company-card" key={company}>
                <span>{company.charAt(0)}</span>
                <h3>{company}</h3>
                <button type="button" onClick={() => showComingSoon(company)}>
                  View projects
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          className="steps-section section-wrap"
          id="steps"
          aria-labelledby="steps-title"
        >
          <p className="section-kicker">Get started</p>
          <h2 id="steps-title">Build trust in 3 easy steps</h2>
          <div className="steps-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-card" key={step.title}>
                  <span className="step-count">0{index + 1}</span>
                  <Icon size={28} />
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="projects-section section-wrap"
          id="projects"
          aria-labelledby="projects-title"
        >
          <div className="section-heading">
            <div>
              <p className="section-kicker">Why choose Giggo?</p>
              <h2 id="projects-title">Browse practical freelance work</h2>
            </div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => showComingSoon("All projects")}
            >
              Browse all
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <div className="project-icon">
                  <FileSearch size={24} />
                </div>
                <div>
                  <p>{project.client}</p>
                  <h3>{project.title}</h3>
                  <div className="project-meta">
                    <span>
                      <MapPin size={15} />
                      {project.location}
                    </span>
                    <span>
                      <BriefcaseBusiness size={15} />
                      {project.type}
                    </span>
                  </div>
                  <strong>{project.budget}</strong>
                  <div className="tag-row">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="roles-section section-wrap"
          id="roles"
          aria-labelledby="roles-title"
        >
          <p className="section-kicker">Popular roles</p>
          <h2 id="roles-title">Discover freelancers across in-demand skills</h2>
          <div className="role-grid">
            {roles.map(([role, count]) => (
              <button
                className="role-chip"
                type="button"
                key={role}
                onClick={() => showComingSoon(role)}
              >
                <span>{role}</span>
                <small>{count}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="cta-section section-wrap" aria-labelledby="cta-title">
          <div>
            <p className="section-kicker">For clients</p>
            <h2 id="cta-title">Post a project and compare proposals clearly</h2>
            <p>
              Keep project posting, freelancer discovery, shortlisting, and
              basic contract status in one workflow.
            </p>
          </div>
          <div className="cta-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => showComingSoon("Post a project")}
            >
              Post a project
              <ArrowRight size={18} />
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => showComingSoon("Contact support")}
            >
              <MessageCircle size={18} />
              Talk to support
            </button>
          </div>
        </section>

        <section
          className="faq-section section-wrap"
          aria-labelledby="faq-title"
        >
          <p className="section-kicker">Questions</p>
          <h2 id="faq-title">What is implemented right now?</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <article className="faq-item" key={faq.question}>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} />
                </button>
                {openFaq === index ? <p>{faq.answer}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-wrap footer-grid">
          <div>
            <button className="brand footer-brand" onClick={() => scrollTo("top")}>
              <span className="brand-mark">G</span>
              <span>Giggo</span>
            </button>
            <p>
              A Bangladesh-first freelance marketplace connecting clients with
              skilled professionals.
            </p>
          </div>
          <div>
            <h2>Explore</h2>
            <button type="button" onClick={() => scrollTo("projects")}>
              Projects
            </button>
            <button type="button" onClick={() => scrollTo("roles")}>
              Talent roles
            </button>
            <button type="button" onClick={() => scrollTo("steps")}>
              How it works
            </button>
          </div>
          <div>
            <h2>Planned</h2>
            <button type="button" onClick={() => showComingSoon("Dashboard")}>
              Dashboard
            </button>
            <button type="button" onClick={() => showComingSoon("Messages")}>
              Messages
            </button>
            <button type="button" onClick={() => showComingSoon("Verification")}>
              Verification
            </button>
          </div>
          <div>
            <h2>Trust</h2>
            <p>
              <Check size={16} />
              Human-reviewed verification
            </p>
            <p>
              <Globe2 size={16} />
              Bangladesh-first scope
            </p>
            <p>
              <Code2 size={16} />
              Course MVP homepage slice
            </p>
          </div>
        </div>
        <p className="copyright">© {year} Giggo. Course project MVP.</p>
      </footer>

      {notice ? (
        <div className="notice" role="status" aria-live="polite">
          <div>
            <strong>{notice.title}</strong>
            <p>{notice.detail}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            <X size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default App;
