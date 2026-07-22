# Engineering Log: GitHub Actions CI Baseline

- **Date:** 2026-07-22
- **Time zone:** America/Chicago (CT, UTC-05:00 on this date)
- **Branch:** `codex/quick-remember-gpt56`
- **Baseline commit:** `cd9d50a1fe6bae4b63d7431d42011d1e5000dab4`
- **Authoring agent:** Codex

## Objective

Create a repository-owned CI baseline that verifies a clean dependency installation, ESLint, and the Next.js production build for every push and pull request without exposing or spending the OpenAI credential.

## Initial evidence

At 2026-07-22 13:19:20 CT, a read-only repository inspection found:

- No `.github/` directory and no GitHub Actions workflow.
- `web/package.json` exposed `dev`, `build`, `start`, and `lint`, but no automated test command.
- No matching unit, integration, or browser test files or test-runner configuration.
- No `.nvmrc` or `.node-version` runtime pin.
- `OPENAI_API_KEY` was read only inside `web/src/app/api/remember/route.ts` while handling a request.
- The Git remote was `https://github.com/HuiYingChung/re-hello.git`.

The Vercel environment variable and deployment configuration were therefore not equivalent to a CI verification environment.

## Runtime decision

The initially proposed Node.js 20 baseline was corrected before implementation. The official Node.js release table checked on 2026-07-22 listed Node.js 20 as end-of-life since 2026-03-24 and Node.js 24 as LTS. CI and `web/.nvmrc` therefore use Node.js 24. See ADR-0002 for the decision and alternatives.

## Files introduced or updated

- `.github/workflows/ci.yml`: push and pull-request verification on Ubuntu.
- `web/.nvmrc`: local/CI Node.js major alignment.
- `README.md`: documents CI behavior and its no-secret boundary.
- `docs/README.md`: indexes the new engineering and decision records.
- `docs/decisions/ADR-0002-github-actions-ci-baseline.md`: rationale, tradeoffs, and review triggers.
- This engineering log: timestamped evidence and verification outcomes.

## Security and cost boundary

- No GitHub Actions secret is referenced.
- The workflow does not receive `OPENAI_API_KEY`.
- CI compiles the Quick Remember route but does not call OpenAI.
- The job has read-only repository permissions and a 15-minute timeout.
- Superseded runs on the same ref are canceled to reduce wasted runner time.

## Verification record

Verification results are appended after the implementation is exercised locally. Local success does not claim that the remote GitHub Actions run passed; that requires pushing the commit and observing the exact-head check.

| Command or check | Start (CT) | End (CT) | Result | Notes |
| --- | --- | --- | --- | --- |
| Repository CI inventory | 2026-07-22 13:19:20 | 2026-07-22 13:19:20 | PASS | Confirmed the absence of an existing workflow, tests, and Node.js version pin. |
| Local `npm ci` using the computer's pre-existing Node.js 22.21.0 | Exact start not instrumented | Completed before 2026-07-22 13:22:01 | PASS | Installed 365 packages. npm reported six audit findings in the full development tree. |
| Local `npm run lint` using Node.js 22.21.0 | 2026-07-22 13:22:01 | 2026-07-22 13:22:08 | PASS | Exit 0. |
| Restricted-network build attempt | 2026-07-22 13:22:18 | 2026-07-22 13:22:25 | FAIL | The sandbox could not fetch Instrument Serif and Noto Sans TC from Google Fonts. This was an environment/network failure, not a compilation error. |
| Network-enabled build using Node.js 22.21.0 | 2026-07-22 13:22:38 | 2026-07-22 13:22:50 | PASS | Exit 0; TypeScript and all 16 routes completed. This workspace build could see the ignored local `.env.local`. |
| Production-only npm audit | Exact time not instrumented; after 2026-07-22 13:22:50 | Same command | PASS | `npm audit --omit=dev` reported zero low, moderate, high, or critical production-dependency findings. The six full-tree findings were therefore limited to development dependencies. No automated audit fix was applied. |
| Node.js 24 runtime check | Exact time not instrumented; before 2026-07-22 13:24:07 | Same command | PASS | `npx -y node@24 --version` returned `v24.18.0`. |
| Workspace lint using Node.js 24.18.0 | 2026-07-22 13:25:11 | 2026-07-22 13:25:58 | PASS | Exit 0. The elapsed time includes the `npx` runtime-launch overhead. |
| Workspace build using Node.js 24.18.0 | 2026-07-22 13:26:39 | 2026-07-22 13:27:11 | PASS | Exit 0; TypeScript and all 16 routes completed. The elapsed time includes the `npx` runtime-launch overhead. |
| First isolated key-free build method | 2026-07-22 13:27:53 | 2026-07-22 13:27:57 | FAIL | `OPENAI_API_KEY_PRESENT=False` and `.env.local` was absent, but Turbopack rejected the temporary external `node_modules` junction. This was a test-fixture limitation; the junction was removed before retrying with a real clean install. |
| Isolated Node.js 24.18.0 `npm ci` | 2026-07-22 13:29:02 | 2026-07-22 13:29:24 | PASS | Clean temporary copy; `OPENAI_API_KEY_PRESENT=False`; `.env.local` absent; installed 365 packages from the lockfile. |
| Isolated Node.js 24.18.0 lint | 2026-07-22 13:29:30 | 2026-07-22 13:30:17 | PASS | Exit 0 in the clean key-free copy. |
| Isolated Node.js 24.18.0 build | 2026-07-22 13:30:23 | 2026-07-22 13:30:54 | PASS | `OPENAI_API_KEY_PRESENT=False`; `.env.local` absent; TypeScript and all 16 routes completed. This is the closest local equivalent of the configured GitHub job. |
| Temporary verification-copy cleanup | Completed after 2026-07-22 13:30:54 | Completed before 2026-07-22 13:32:43 | PASS | The specifically named `rehello-ci-*` directory under the system temporary directory was removed after its resolved path and prefix were validated. |
| Workflow YAML parse | Completed before 2026-07-22 13:33:50 | Same command | PASS | The installed `js-yaml` parser loaded the workflow and found the expected `name`, `on`, `permissions`, `concurrency`, and `jobs` keys. This is syntax evidence, not a substitute for GitHub's remote workflow execution. |
| Documentation links and language | 2026-07-22 13:33:50 | 2026-07-22 13:33:50 | PASS | All checked local Markdown links resolved; ADR-0002 and this log contained zero CJK lines. |
| Secret and whitespace checks | 2026-07-22 13:33:50 | 2026-07-22 13:33:50 | PASS | No key-shaped secret match was found outside ignored build/dependency directories; `git diff --check` exited 0. |

## Current state at record write

- The workflow and documentation are implemented and locally verified on `codex/quick-remember-gpt56`.
- This record is part of the pending CI commit; the resulting commit SHA cannot be self-referenced before that commit exists.
- No remote CI result exists until the branch is pushed.
- Branch protection and required-check settings remain outside the scope of this change.
