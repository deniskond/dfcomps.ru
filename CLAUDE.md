# dfcomps.ru — AI Agent Guide

## E2E Test Validation

### When to use e2e tests

E2E tests are **not required after every change**. They are appropriate when:
- Backend API endpoints are added or modified
- Core user flows are changed (auth, cup operations, news)
- The user explicitly asks for e2e validation

**Do NOT run e2e tests by default.** If you think e2e validation would be beneficial, ask the user first.

### Running e2e tests (agentic)

```bash
npm run e2e:agentic
```

Same flow as `npm run e2e` but uses Cypress `--reporter=min` for compact output (pass/fail counts + failure details only). Backend SQL query logging is also suppressed via `NODE_ENV=test`.

- Runtime: ~15 minutes
- Requires Docker running (PostgreSQL on port 5432)
- Ports 4000 and 4001 must be free

### Verbose e2e (human use)

```bash
npm run e2e          # all tests, verbose
npm run e2e:single   # single spec file (edit --spec path in package.json first)
```

### Prerequisites

- Docker running: `docker ps`
- If database container not yet initialized: `npm run database:setup`
