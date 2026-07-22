# ADR-0002: Establish a Secret-Free GitHub Actions CI Baseline

- **Status:** Accepted
- **Date:** 2026-07-22
- **Decision owners:** Winnie and Codex
- **Scope:** Pull-request and push verification for the Next.js application in `web/`

## Context

The repository had repeatable local lint and production-build commands, but no checked-in continuous-integration workflow. A Vercel deployment build can detect some failures, but it happens in the deployment system and is not a repository-level pull-request gate. The project needs a fast baseline that can catch dependency-installation, lint, TypeScript compilation, and Next.js production-build failures before deployment.

The application has no automated unit, integration, or browser test suite yet. Quick Remember requires `OPENAI_API_KEY` only when its server route handles a real request; linting and compiling the route do not require a live credential.

Node.js 20 was considered initially, but the official Node.js release schedule lists it as end-of-life as of 2026-03-24. A new CI configuration should not be introduced on an unsupported runtime.

## Decision

Add `.github/workflows/ci.yml` with one `verify` job that runs for every push and pull request:

1. Check out the repository.
2. Install Node.js 24, the current LTS line at decision time.
3. Restore the npm download cache using `web/package-lock.json` as the cache dependency path.
4. Run `npm ci` in `web/` so the lockfile is authoritative.
5. Run `npm run lint`.
6. Run `npm run build`.

Add `web/.nvmrc` with `24` so contributors can select the same major runtime locally.

The workflow receives only read access to repository contents, sets a 15-minute job timeout, cancels superseded runs for the same workflow/ref, and disables Next.js telemetry.

## Credential policy

Do not add `OPENAI_API_KEY` or any substitute value to GitHub Actions for this baseline.

This means CI verifies that the API route compiles, but it does not make a live OpenAI request. Avoiding a live request keeps pull requests deterministic, prevents untrusted or accidental API spend, and removes a secret from the workflow threat surface. If live integration testing becomes necessary, it requires a separate decision covering event restrictions, fork behavior, budgets, redaction, rate limits, and deterministic assertions.

## Alternatives considered

### Rely only on Vercel deployment builds

Rejected. Deployment validation is useful but does not provide a repository-owned CI definition or a consistent pull-request check independent of deployment configuration.

### Use Node.js 20

Rejected because it was already end-of-life when this decision was made.

### Add automated tests immediately

Deferred. There is no existing test harness, and the immediate goal is a trustworthy baseline within a short delivery window. Tests should be added deliberately around storage behavior, the Quick Remember route contract, and the primary browser flow.

### Call OpenAI during every CI run

Rejected for the baseline because it introduces nondeterminism, secret exposure risk, latency, and cost without first establishing a controlled integration-test policy.

## Consequences

### Positive

- Every pushed commit and pull request gets the same clean-install, lint, and build checks.
- Lockfile drift and install-time failures become visible before deployment.
- The CI runtime is explicit and locally reproducible.
- The workflow does not consume OpenAI tokens or require GitHub secrets.

### Limitations

- A green workflow does not prove that the deployed Vercel environment contains `OPENAI_API_KEY`.
- A green workflow does not prove that OpenAI accepts a request or that the model output meets the application schema.
- A green workflow does not cover browser interactions, localStorage behavior, accessibility, or production smoke testing.
- Branch protection is a separate GitHub repository setting and is not established by this workflow file alone.

## Verification plan

Before committing the workflow:

- Perform a clean `npm ci` from `web/package-lock.json`.
- Run `npm run lint`.
- Run `npm run build` without granting the workflow an OpenAI credential.
- Check the workflow and documentation diffs for whitespace and accidental secrets.

After pushing the branch:

- Confirm that GitHub Actions creates the `CI / Lint and build` check for the exact pushed commit.
- Treat the local checks as local evidence only until the remote check completes.

## Review triggers

Revisit this decision when the project adds a test framework, introduces another deployable package, changes its supported Node.js line, requires a live provider integration test, or enables protected-branch required checks.

## References

- [GitHub Docs: Building and testing Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)
- [actions/checkout releases](https://github.com/actions/checkout/releases)
- [actions/setup-node releases](https://github.com/actions/setup-node/releases)
