# Giggo Evidence-Based Roadmap

This roadmap adapts TalentHive's useful incremental order to Giggo's smaller course MVP. It does not
copy the full 15-phase product scope: payments, services marketplace, disputes, automated identity
verification, international operations, and production-scale infrastructure remain deferred.

## Status legend

- **Verified:** implemented in Giggo and checked at the stated boundary.
- **In progress:** some artifacts exist, but the phase exit criteria are not yet met.
- **Not started:** no Giggo implementation evidence exists in the target repository.
- **Deferred:** intentionally outside the course MVP.

## Delivery phases

| Phase | Outcome | Current status | Exit evidence |
| --- | --- | --- | --- |
| P0 — Product and workflow baseline | Approved scope, two repositories, Kanban specification, contribution rules, templates, CI baseline | In progress | Local pipeline committed by PR; shared Project and branch rules configured; backend bootstrapped |
| P1 — Foundation and authentication | Giggo backend foundation, health endpoint, roles, register/login/refresh/logout, protected frontend routes | In progress | Backend auth tests plus browser-verified authentication journey |
| P2 — Profiles and trust | Freelancer onboarding/profile, CV storage, human-reviewed verification, visible trust badges | In progress | Ownership/privacy tests plus freelancer and admin browser journeys |
| P3 — Job marketplace | Client job CRUD, public discovery/filtering, details, saved jobs | In progress | API authorization/filter tests plus client/freelancer browser journey |
| P4 — Proposals and basic contracts | Submit/manage proposals, shortlist/accept/reject, offer acceptance, simple contract status | Not started | State-transition and ownership tests plus end-to-end hiring journey |
| P5 — Messaging and notifications | Direct messaging only between authorized participants, unread/read notifications | Not started | Socket/API authorization tests plus two-user browser journey |
| P6 — Advisory CV analysis | Replaceable provider, deterministic no-cost fallback, cache/history, recommendations, disclaimer | In progress | Backend analyzer tests plus browser flow; AI cannot alter verification state |
| P7 — Stabilization and demo release | Lint/tests, responsive/accessibility QA, security pass, staging, rollback, release notes and traceability | Not started | All release gates pass on compatible frontend/backend tags |

`In progress` does not mean full-stack completion. The imported frontend already contains screens for
authentication, profiles, verification, jobs, and CV analysis, while the Giggo backend repository is
currently empty. Those phases remain incomplete until Giggo backend code and integrated acceptance
evidence exist.

## Phase detail

### P0 — Product and workflow baseline

- Keep SRS, scope, roles, roadmap, and verified implementation status aligned.
- Configure one shared GitHub Project across both repositories.
- Use issue forms, pull-request templates, CODEOWNERS, CI, and protected `main`.
- Bootstrap the backend without carrying over TalentHive branding, credentials, repository links,
  or unsupported production claims.

### P1 — Foundation and authentication

- Preserve the intended Express/MongoDB layered design: route -> validator -> controller -> service
  -> model/integration.
- Keep short-lived access tokens in frontend memory and refresh tokens in secure HTTP-only cookies.
- Enforce account status and roles on the backend.
- Verify registration, login, refresh rotation, logout, password reset, and protected navigation.

### P2 — Profiles and trust

- Support freelancer profile fields, onboarding, visibility, portfolio, avatar, and CV upload.
- Keep CVs and review documents private; validate type and size server-side.
- Separate email/phone/CV/document/identity signals visibly.
- Require human administrator action for verification; AI feedback never grants a trust badge.

### P3 — Job marketplace

- Support draft/open/closed/filled job states and owner-only mutations.
- Provide bounded pagination, filtering, ordering, and text search.
- Keep non-open jobs private to their owner.
- Make save/unsave idempotent and keep counters consistent.

### P4 — Proposals and basic contracts

- Allow one or clearly bounded proposals per freelancer/job according to an explicit rule.
- Enforce legal status transitions and participant-only access.
- Provide client shortlisting and accept/reject behavior.
- Track a basic contract lifecycle without real money, escrow, invoice, or dispute guarantees.

### P5 — Messaging and notifications

- Permit conversations only between authorized participants in a valid hiring context.
- Authenticate Socket.IO connections and rooms.
- Validate attachments and prevent cross-conversation access.
- Provide loading, reconnect, unread, empty, and failure states.

### P6 — Advisory CV analysis

- Default development to a deterministic local/mock provider so the course project has no required
  paid API.
- Validate structured AI output, limit input/output, cache unchanged content, and record safe usage.
- Display advisory language and never treat AI analysis as identity verification or a hiring decision.

### P7 — Stabilization and demo release

- Add ESLint, focused frontend unit/component tests, backend integration tests, and Playwright for
  critical journeys.
- Verify WCAG-oriented keyboard/focus/label behavior and 375/768/1024/1440 layouts.
- Review dependency risk, authorization, uploads, CORS/cookies, errors, logs, indexes, backups, and
  rollback.
- Deploy only a compatible frontend/backend pair with fictional demo data.
- Produce release notes and requirement-to-issue-to-PR-to-test traceability.

## Deferred scope

The following are roadmap candidates after the course MVP, not current commitments:

- real payments, escrow, wallets, payouts, invoices, tax, or financial guarantees;
- services/packages marketplace;
- disputes, arbitration, and production moderation operations;
- automated or third-party identity verification;
- AI-driven hiring decisions or auto-bans;
- subscriptions, advanced analytics, international compliance, or production-scale operations.

Any move from `Deferred` into the MVP requires an SRS/scope update, threat and data review, estimate,
dependencies, acceptance criteria, and explicit team approval before implementation.
