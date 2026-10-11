## Linked work item

Closes #<!-- issue number -->

Cross-repository issue or pull request: <!-- owner/repository#number or N/A -->

## Outcome

<!-- State the user-visible or engineering outcome in 1-3 sentences. -->

## Change type

- [ ] Feature
- [ ] Fix
- [ ] Refactor
- [ ] Test
- [ ] Documentation or process
- [ ] CI, build, or dependency maintenance

## Scope

- What changed:
- What intentionally did not change:
- Screens or API endpoints affected:

## Contract, data, and security review

- [ ] No API or data-contract change
- [ ] API contract and affected frontend/backend consumer were updated together
- [ ] Authorization remains enforced by the backend
- [ ] Input validation and safe error responses were considered
- [ ] No secret, credential, private document, or personal data was committed or logged
- [ ] Migration and rollback notes are included, or no persistent-data change exists

## Verification evidence

List the exact commands and results. Attach screenshots for visible UI changes.

```text
npm ci
npm run build
```

- [ ] Happy path checked
- [ ] Relevant failure, loading, empty, and permission states checked
- [ ] Desktop and mobile layout checked when UI changed
- [ ] Keyboard/focus behavior checked when UI changed
- [ ] Frontend-backend integration checked when either contract changed

## Reviewer checklist

- [ ] Acceptance criteria are satisfied
- [ ] CI passed
- [ ] Changes are focused and understandable
- [ ] Tests or verification match the risk
- [ ] Documentation and Kanban status are current
- [ ] No unresolved conversation remains
