# Giggo GitHub Project and Kanban Setup

Create one user-owned GitHub Project named **Giggo Development** and add issues and pull requests
from both repositories. A single board exposes dependencies between frontend and backend work;
separate repository boards would hide the actual full-stack delivery state.

This file specifies the board. Creating or changing the live GitHub Project is a separate external
action and is not proven by this repository.

## 1. Project fields

| Field | Type | Values or rule |
| --- | --- | --- |
| Status | Single select | Backlog, Ready, In Progress, In Review, Verify, Done |
| Priority | Single select | P0 Urgent, P1 High, P2 Normal, P3 Low |
| Area | Single select | Frontend, Backend, Full-stack, UX, QA, DevOps, Documentation |
| Phase | Single select | P0 Workflow, P1 Foundation, P2 Profiles, P3 Jobs, P4 Hiring, P5 Messaging, P6 AI, P7 Release |
| Size | Number | 1, 2, 3, or 5 points; split anything larger than 5 |
| Iteration | Iteration | One week, starting on the team's chosen planning day |
| Target date | Date | Required only for demos, submissions, and releases |
| Risk | Single select | Normal, Security, Data, Dependency, Schedule |

Use built-in repository, milestone, assignee, label, and linked pull-request fields instead of
duplicating them. One issue has one directly accountable assignee; the teammate participates as
reviewer.

## 2. Board columns and policies

| Column | Entry condition | Exit condition | WIP limit |
| --- | --- | --- | ---: |
| Backlog | Valid idea, requirement, defect, or technical risk | Selected for refinement | Unlimited |
| Ready | Definition of Ready satisfied and unblocked | Owner starts work | 6 |
| In Progress | Assigned owner has an active branch | Draft/ready PR opened with local evidence | 2 total; normally 1 per student |
| In Review | PR is reviewable and CI is running/passed | Review and CI pass | 2 |
| Verify | Merge-ready or merged change needs acceptance/integration evidence | Definition of Done satisfied | 1 |
| Done | Merged, verified, documented, acceptance met | Reopen only with evidence of incompleteness | No limit |

Blocked work stays in its current status, receives the `blocked` label, and links the blocker. A
blocked issue still consumes its WIP slot; this creates pressure to remove the blocker instead of
starting hidden parallel work.

## 3. Recommended labels in both repositories

Create identical labels so filters work across repositories:

```text
type: feature     type: bug        type: task        type: documentation
area: frontend    area: backend    area: api         area: database
area: security    area: qa         area: devops      area: ux
priority: p0      priority: p1     priority: p2      priority: p3
blocked           needs-decision   dependencies      good-first-issue
```

Use Project fields for planning and labels for repository search/automation. Do not create multiple
labels that encode the same fact with different spelling.

## 4. Views

Create these saved views:

1. **Delivery Board** — board layout, columns by `Status`, grouped by `Area`, excludes `Done` older
   than the current iteration.
2. **Current Iteration** — table, filter `iteration:@current`, grouped by `Status`, sorted by
   `Priority` then `Size`.
3. **Roadmap** — roadmap layout using `Iteration` and `Target date`, grouped by `Phase`.
4. **Review Queue** — table, filter `status:"In Review",Verify`, showing repository, assignee,
   linked PR, risk, and last update.
5. **Team Capacity** — board or table filtered to the current iteration and grouped by assignee,
   with the sum of `Size` visible.
6. **Risks and Blockers** — table filtered to `label:blocked` or non-normal `Risk`, sorted by
   priority and last update.

## 5. Automation

Configure built-in Project workflows where available:

- item added to the Project -> `Backlog`;
- pull request linked to an issue -> keep both visible on the Project;
- pull request merged -> move to `Verify`, not directly to `Done`;
- issue closed -> `Done` only after the owner confirms acceptance evidence;
- reopened issue -> `Ready` or `In Progress`, based on current ownership;
- automatically add issues from both repositories that carry the `project:giggo` label, if that
  label and filter are configured.

Automation must not bypass review or declare an unverified full-stack feature complete.

## 6. Triage and movement rules

### Backlog to Ready

- verify the issue is in MVP scope or record why it is necessary;
- apply priority, area, phase, size, iteration, and risk;
- split work larger than five points;
- link dependencies and decide which repository owns each part;
- satisfy every Definition of Ready item.

### In Progress to In Review

- push the issue branch;
- open a focused pull request that closes the issue;
- attach local verification evidence;
- update API/architecture/user documentation if behavior changed.

### In Review to Verify

- CI is green;
- teammate approval exists;
- all conversations are resolved;
- cross-repository commit/PR links are recorded;
- the change is ready for an acceptance or integration check.

### Verify to Done

- acceptance criteria pass in the intended environment;
- failures and permission boundaries were checked;
- required screenshots/logs/test results are attached safely;
- pull request is merged to `main` and the branch is deleted;
- roadmap and release notes reflect the verified state.

## 7. Seed backlog

Create these as real issues in the named repository. Suggested IDs are planning identifiers, not
GitHub issue numbers.

| ID | Repository | Issue title | Phase | Priority | Size | Depends on |
| --- | --- | --- | --- | --- | ---: | --- |
| GIG-P0-01 | Frontend | Configure shared Giggo Project fields, views, and WIP limits | P0 | P1 | 2 | None |
| GIG-P0-02 | Frontend | Protect frontend `main` and require `frontend-quality` | P0 | P1 | 1 | Frontend CI first run |
| GIG-P0-03 | Backend | Bootstrap Giggo backend repository from approved architecture | P0 | P0 | 3 | Rebrand/scope audit |
| GIG-P0-04 | Backend | Add backend issue templates, PR template, CODEOWNERS, and CI | P0 | P0 | 2 | GIG-P0-03 |
| GIG-P0-05 | Frontend | Triage React Router advisories and plan a regression-tested upgrade | P0 | P1 | 2 | Critical route inventory |
| GIG-P1-01 | Backend | Rebrand server configuration and remove TalentHive credentials/text | P1 | P0 | 2 | GIG-P0-03 |
| GIG-P1-02 | Backend | Publish current auth/profile/job API contract | P1 | P0 | 3 | GIG-P1-01 |
| GIG-P1-03 | Full-stack | Verify registration, login, refresh, logout, and protected-route journey | P1 | P0 | 3 | GIG-P1-02 |
| GIG-P2-01 | Full-stack | Integrate freelancer onboarding and profile editing | P2 | P1 | 3 | GIG-P1-03 |
| GIG-P2-02 | Full-stack | Verify private CV upload and download authorization | P2 | P1 | 3 | GIG-P2-01 |
| GIG-P2-03 | Full-stack | Integrate human-reviewed verification request and admin decision | P2 | P1 | 5 | GIG-P1-03 |
| GIG-P3-01 | Full-stack | Integrate job creation, editing, discovery, and details | P3 | P1 | 5 | GIG-P1-03 |
| GIG-P3-02 | Full-stack | Integrate save and unsave job workflow | P3 | P2 | 3 | GIG-P3-01 |
| GIG-P4-01 | Backend | Implement proposal model, status rules, authorization, and API tests | P4 | P1 | 5 | GIG-P3-01 |
| GIG-P4-02 | Frontend | Implement proposal submission and management states | P4 | P1 | 5 | GIG-P4-01 contract |
| GIG-P4-03 | Full-stack | Implement offer acceptance and basic contract status tracking | P4 | P1 | 5 | GIG-P4-02 |
| GIG-P5-01 | Full-stack | Implement participant-only messaging and notifications | P5 | P2 | 5 | GIG-P4-03 |
| GIG-P6-01 | Full-stack | Integrate advisory CV analysis with deterministic local fallback | P6 | P2 | 5 | GIG-P2-02 |
| GIG-P6-02 | QA | Verify AI disclaimer and prevent AI from granting verification | P6 | P1 | 2 | GIG-P6-01 |
| GIG-P7-01 | Frontend | Add lint, unit/component tests, and critical Playwright journeys | P7 | P1 | 5 | Stable integrated flows |
| GIG-P7-02 | Backend | Complete security, dependency, index, logging, and API test review | P7 | P1 | 5 | Stable API |
| GIG-P7-03 | Full-stack | Configure staging/demo and document rollback | P7 | P1 | 3 | Both CI pipelines green |
| GIG-P7-04 | Documentation | Produce release notes, traceability matrix, and professor demo evidence | P7 | P1 | 3 | GIG-P7-03 |

Do not place all seed issues in the current iteration. Prioritize P0/P1 first and pull later work only
when dependencies are real and capacity is available.

## 8. Weekly status format

Post a short Project status update:

```text
Status: On track | At risk | Off track
Iteration goal:
Completed with evidence:
In progress:
Blocked and owner:
Scope or risk changes:
Next integration checkpoint:
```

Report implemented frontend, implemented backend, and verified full-stack behavior separately.
