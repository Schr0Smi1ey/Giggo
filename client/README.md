# Giggo

**Giggo** is a planned Bangladesh-first freelance marketplace for connecting clients with skilled professionals through a transparent hiring workflow.

It is being prepared as a course project for **Web Programming & Mobile Applications Development** at the Computer Science and Engineering Discipline, Khulna University.

## Project Goal

Freelance work in Bangladesh is often coordinated through informal channels, making it difficult to discover relevant skills, assess trust, manage proposals, and track hiring decisions. Giggo is intended to bring these activities into one browser-based workflow where:

- Clients publish and manage job opportunities.
- Freelancers present profiles, portfolios, CVs, and proposals.
- Both parties can track the hiring journey from job discovery to a basic contract status.
- Administrators review verification requests and maintain visible trust indicators.

## Planned MVP

The proposed course MVP includes:

- Role-based access for clients, freelancers, and administrators.
- Freelancer profiles with experience, skills, portfolios, CVs, and availability.
- Human-reviewed verification requests and visible trust signals.
- Job posting, browsing, search, filtering, saved jobs, and job details.
- Proposal submission, shortlisting, acceptance or rejection, contract tracking, and participant project workspaces.
- Direct participant messaging and role-specific dashboards.
- Advisory CV analysis through a replaceable AI provider with a deterministic development fallback.

## Scope Boundaries

The MVP does **not** include real payments, escrow, payouts, invoicing, taxation, financial guarantees, automated identity verification, AI-driven hiring decisions, disputes, subscriptions, or production-scale international operation.

AI-generated CV feedback is advisory only. Human review remains authoritative for verification and hiring decisions.

## Current Repository Status

**Status: active data-backed marketplace implementation.**

The repository contains a Vite, React, and Tailwind CSS client for authentication,
profiles, verification, jobs, proposals, offers, accepted-term contracts,
contract lifecycle tracking, project progress workspaces, milestone delivery
and revision history, CV analysis, private/group messaging, live presence and
typing, and persisted notifications.

The frontend expects the separate Giggo backend API and Socket.IO service at
`http://localhost:5000` through the Vite development proxy. Both repositories
must be running for authenticated and data-backed journeys.

## Local Development

Install dependencies:

```powershell
npm install
```

Run the development server:

```powershell
npm run dev
```

Run quality checks:

```powershell
npm run build
```

This project includes a repo-level `.npmrc` that runs npm scripts through `pwsh`. That avoids path issues on Windows when the workspace path contains `&`.

## Documentation

- [Software Requirements Specification](docs/Giggo_SRS.docx)
- [Project Scope, Objectives, and Team Roles](docs/Giggo_Scope_Objectives_Team_Roles.pdf)
- [End-to-End Development Pipeline](docs/DEVELOPMENT_PIPELINE.md)
- [GitHub Project and Kanban Setup](docs/KANBAN_SETUP.md)
- [Evidence-Based Project Roadmap](docs/ROADMAP.md)
- [Contribution Guide](CONTRIBUTING.md)

The development process uses one shared GitHub Project for issues from both the frontend and
backend repositories. Each change moves from an issue to a short-lived branch, pull request,
automated checks, teammate review, integration verification, and then `main`.

## Team

| Member | Student ID | Primary responsibility |
| --- | --- | --- |
| Md. Sarafat Karim | 220216 | Requirements, frontend, and project coordination |
| Md. Farid Hossen Rehad | 220222 | Backend, marketplace logic, and AI integration |

- **Supervisor:** Prof. Dr. Kazi Mashudul Alam
- **Course:** Web Programming & Mobile Applications Development
- **Institution:** Khulna University, CSE Discipline

## Repository

<https://github.com/Schr0Smi1ey/cseku_26_wpl_Giggo_Frontend>
