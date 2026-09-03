# Contributing to Giggo

Giggo uses two repositories and one shared delivery process:

- Frontend: `Schr0Smi1ey/cseku_26_wpl_Giggo_Frontend`
- Backend: `Schr0Smi1ey/cseku_26_wpl_Giggo_Backend`
- Project governance: [Development Pipeline](docs/DEVELOPMENT_PIPELINE.md)
- Work tracking: [Kanban Setup](docs/KANBAN_SETUP.md)
- Delivery order: [Roadmap](docs/ROADMAP.md)

## Before coding

1. Create or select an issue on the shared Giggo Project.
2. Confirm it meets the Definition of Ready and is in `Ready`.
3. Assign exactly one owner and move it to `In Progress`.
4. Work in the repository that owns the change. Split full-stack work into linked frontend and
   backend issues when the parts can be reviewed independently.

## Branches

`main` is the only permanent branch. Do not commit directly to it.

Use `<type>/<issue-number>-<short-description>`:

- `feat/42-submit-proposal`
- `fix/57-refresh-token-loop`
- `test/61-job-permissions`
- `docs/18-api-contract`
- `chore/12-frontend-ci`

Start from an updated `main`:

```powershell
git switch main
git pull --ff-only
git switch -c feat/42-submit-proposal
```

## Commits

Use Conventional Commit-style messages:

```text
feat(proposals): add proposal submission form
fix(auth): prevent repeated refresh requests
test(jobs): cover non-owner update rejection
docs(api): document proposal response contract
chore(ci): add backend test gate
```

Keep commits focused. Never include `.env`, tokens, database exports, uploaded CVs, identity
documents, generated builds, or local test reports.

## Pull requests

1. Rebase or merge the latest `main` into the branch before final review.
2. Open a pull request using the repository template and link its issue with `Closes #123`.
3. Move the issue to `In Review`.
4. The other student reviews the code. Authors do not approve their own pull request.
5. Resolve every review conversation and rerun checks after substantive changes.
6. Move cross-repository changes to `Verify` and test compatible frontend/backend commits together.
7. Squash-merge after all required checks and approval pass; then delete the branch.
8. Move the issue to `Done` only when the Definition of Done is satisfied.

Use a draft pull request when early feedback is useful. Drafts do not count as review-ready work.

## Local frontend checks

```powershell
npm ci
npm audit --omit=dev --audit-level=high
npm run lint --if-present
npm run test --if-present
npm run build
```

For user-interface changes, also check the affected flow at mobile and desktop widths, keyboard
focus, loading/error/empty states, the browser console, and failed network requests.

## API changes

The backend repository owns the API contract. A breaking contract change requires:

1. A linked backend issue and frontend issue.
2. Updated endpoint documentation or OpenAPI definition in the backend pull request.
3. Request/response validation and backend integration tests.
4. A compatible frontend consumer or an explicitly documented transition plan.
5. Joint verification before either issue is marked `Done`.

Do not make authorization decisions in the frontend. The backend must validate input and enforce
resource ownership and roles.

## Urgent fixes

Use `fix/<issue>-<slug>` from `main`. The normal pull request, CI, review, and verification gates
still apply. If a severe incident forces a temporary exception, record who approved it, why it was
necessary, and a follow-up issue restoring the skipped gate.
