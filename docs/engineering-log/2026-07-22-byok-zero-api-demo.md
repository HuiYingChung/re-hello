# Engineering Log - BYOK and Zero-API Demo

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Implementation record started: 2026-07-22 23:33:49 -05:00 (instrumented command output)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Starting branch: `main`
- Work branch: `codex/byok-zero-api-demo`
- Starting commit: `e2f316ba816c96ddf8eea891ba347abbbf30df39`
- Production URL: <https://re-hello.vercel.app/>
- Publication status: local working-tree change only; not committed, pushed, deployed, or production-tested

## Objective

Replace owner-funded public OpenAI usage with a deterministic no-API demo plus one-request BYOK for personal Quick Remember notes. Preserve the structured GPT-5.6 transformation, local-first records, and original nine-question guided flow.

Do not deploy, change Vercel configuration, remove remote environment variables, or make a live OpenAI request in this task.

## Credential decision

The user chose to keep one long-lived dedicated OpenAI project key for controlled testing rather than rotate or revoke it after every test. The accepted boundary is:

- the key is not deployed or committed;
- the application does not read it from `.env.local`;
- the user may paste it manually for an explicitly authorized live smoke test later;
- rotation is necessary if leakage is suspected, not after every routine test.

A silent local check returned only booleans: a usable value exists in ignored `web/.env.local`, the process environment has no key, and the file is Git-ignored. No key value was printed or persisted by this work.

All automated tests use a mocked OpenAI client.

## Baseline evidence

Before implementation:

| Check | Result |
| --- | --- |
| `npm run lint` | PASS; exit 0 |
| `npm run build` | PASS; Next.js 16.2.2 compiled, type-checked, and generated 17 routes |
| Working tree | `main...origin/main`; only the required append-only `lessons.md` planning records were modified |

## Implemented changes

### Deterministic no-API demo

- Added `web/src/lib/quick-memory-demo.ts` with a fixed synthetic Maya note and complete `QuickMemoryDraft`.
- Changed `See a no-API example` to place that fixture directly into the review state.
- Labeled the card `Demo result · No API request`.
- Kept the ready-made sample-data path local through the existing `seedDemoData()` implementation.

### One-request BYOK interface

- Added an inline password input only after a personal note is ready.
- The copy discloses that the note and key pass through Rehello's server to OpenAI.
- The page recommends a dedicated restricted project key and links to OpenAI key management.
- The key stays in React state for the attempt, is sent in a custom header, and is cleared in `finally`.
- There is no remembered-key toggle, settings storage, URL parameter, or backup field.

### Server cost and privacy boundary

- Removed every runtime read of `process.env.OPENAI_API_KEY`.
- Required `x-openai-api-key` on personal-note requests.
- Added optional same-origin browser validation.
- Preserved input limits, structured Zod output, `store: false`, low reasoning, bounded output, and no-store response headers.
- Added bounded 401, 403, 429, and 502 messages without logging or echoing provider details.

### Credential-surface telemetry boundary

- Removed Vercel Analytics from the root layout and dependency tree.
- Browser verification found that route-only gating was insufficient: the
  Analytics script loaded on Welcome remained in the same document after
  client-side navigation to `/remember`.
- Removing the integration keeps that third-party script out of the entire app.

### Automated verification

- Added Vitest and a secret-free `npm test` script.
- Added route contract tests with a mocked OpenAI client.
- Added a deterministic demo-fixture test.
- Updated GitHub Actions to run tests before lint and build.

### Documentation

- Added ADR-0008 instead of rewriting ADR-0001's historical rationale.
- Updated the README architecture, user flow, limitations, running instructions, and CI description.
- Updated Welcome and Settings copy.
- Removed obsolete `web/.env.example`; the application no longer accepts a server-owned runtime key.

## Test evidence so far

| Check | Result | Scope |
| --- | --- | --- |
| First post-route `npm test` | PASS; 2 files, 9 tests | Mocked route and deterministic fixture; zero live API calls |
| Fresh `npm audit --json` | PASS; 0 known vulnerabilities | Current installed dependency tree after adding Vitest |

The preceding `npm install --save-dev vitest` summary initially printed six vulnerabilities, while the immediately following fresh audit reported zero. The fresh audit is the current direct result; no forced audit fix or unrelated dependency upgrade was run.

## Final local verification

| Check | Result | Scope |
| --- | --- | --- |
| `npm ci` after exact repo-process cleanup | PASS | 396 packages installed from `web/package-lock.json` |
| Fresh `npm audit --json` | PASS | Exit 0; zero current vulnerabilities reported |
| `npm test` after clean install | PASS | 2 files, 9 tests; mocked provider only |
| `npm run lint` after clean install | PASS | Exit 0 |
| `npm run build` after clean install | PASS | Next.js 16.2.2 compile, TypeScript, and all 17 routes |
| Mobile dev-browser flow | PASS | 360 x 732 viewport; fixed card labeled no API; zero `/api/remember` requests |
| Mocked BYOK rejection | PASS | Intercepted 401; no provider call; input cleared; bounded error shown |
| Browser storage and backup | PASS | key absent from input, URL, localStorage, sessionStorage, and downloaded backup |
| Guided-flow regression | PASS | `One question at a time` opened step 1/9 |
| Analytics correction | PASS | Fresh request inventory contained no Vercel Analytics or other third-party analytics request |
| Production-artifact state transition | PASS | Pasted fake key, switched to guided, returned to quick; key panel was closed and no API POST occurred |
| React best-practices review | PASS after correction | Guided-mode transition now clears key state before changing views |
| Secret and runtime-key scan | PASS | Zero suspected key values and zero runtime owner-environment-key reads |
| Analytics dependency scan | PASS | Zero imports or package references |
| Documentation and hygiene checks | PASS | Zero missing local links, conflict markers, or browser-artifact status entries |
| Append-only lesson check | PASS | Existing ledger prefix unchanged; L79-L90 appended in order |
| `git diff --check` | PASS | Exit 0; informational LF-to-CRLF working-copy warnings only |

`npm ci` printed a six-vulnerability install summary, while the immediately following direct `npm audit --json` exited 0 and reported zero vulnerabilities. This record reports both observations and uses the fresh direct audit as the current audit result. No `npm audit fix`, forced update, or unrelated dependency change was run.

No live OpenAI request, Codex-executed Vercel change, deployment, or production probe occurred.

## Failed attempts during planning

### OpenAI documentation MCP launch denial

The normal and narrowly approved attempts to run `codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp` both failed before registration with `Access is denied`.

Recovery: stopped retrying executable variants and used the official OpenAI-domain documentation fallback. L79 records the full evidence and prevention rule.

### Invalid PowerShell `foreach` pipe

A read-only line-count command put a pipe directly after a statement-form `foreach` loop and failed with `An empty pipe element is not allowed`.

Recovery: collected loop output in a task-specific variable before piping it. L80 records the full evidence and prevention rule.

### Feature branch created after implementation edits

The first implementation edits were made while the working tree was still on `main`. The user identified the missing branch boundary.

Recovery: `git switch -c codex/byok-zero-api-demo` succeeded without stash, clean, commit, or file loss. All intended uncommitted changes moved with the working tree. L81 records the full evidence and prevention rule.

### Background dev-server launch attempts

The first combined `Start-Process` and HTTP-poll command timed out without producing a PID; a follow-up port check found no listener. L82 records why launch and readiness evidence must be separated.

Two diagnostic `Start-Process` calls then failed on duplicate `Path` and `PATH` environment keys, including the retry with `-UseNewEnvironment`; both also attempted to use a null process handle. Recovery used managed execution cell 3, and a separate HTTP probe returned 200 for `/remember`. L83 records the full evidence and prevention rule.

### Playwright CLI reference drift

The skill-prescribed `network` command was not present in the installed CLI and exited 1 with usage output. Installed help identified `requests`; that command successfully produced the request inventory. L84 records the full evidence and prevention rule.

### Route-gated Analytics remained after SPA navigation

The first browser run proved the fixed demo made no `/api/remember` request, but the static request inventory showed that Vercel Analytics loaded on Welcome before client-side navigation to Remember. Route-only component gating did not remove the already executed script.

Recovery: removed Analytics globally and uninstalled its dependency. L85 records the full evidence and prevention rule. A fresh browser session must verify the corrected request inventory.

### Playwright mock-body and run-code syntax failures

The first 401 route mock passed JSON through `route --body`; Windows native argument reconstruction removed required quotes, so the browser received invalid JSON. L86 records the failure and recovery.

The first recovery then used the skill's bare-`await` `run-code` example, while the installed CLI required a function accepting `page`; it failed before adding a route. After reading installed help, `async (page) => { ... }` succeeded. L87 records the full evidence and prevention rule.

### Clean-install native-module lock and process-inspection denial

The first final `npm ci` failed with `EPERM` while unlinking the Lightning CSS Windows native binary. The outer production-server cell had been terminated, but command-line inspection later found its Next.js child process still running as PID 28940. L88 records the full evidence and prevention rule.

The initial default-sandbox command-line inspection returned `Access denied`. A narrowly approved read-only retry filtered Node command lines to the exact workspace and returned only PID 28940. That exact PID was stopped and confirmed absent. L89 records the full evidence and prevention rule.

### PowerShell-incompatible secret-classification hash

A final read-only secret-scan classifier used `SHA256.HashData()` and `Convert.ToHexString()`, which are unavailable in this Windows PowerShell runtime. It failed before returning its intended redacted classification and did not print the sensitive line. Recovery used Git baseline comparison and a tighter pattern instead. L90 records the full evidence and prevention rule.

## User-reported Vercel environment update

At 2026-07-23 00:02:35 -05:00, after the recommendation to remove `OPENAI_API_KEY` from both Production and Preview, the user reported that the Vercel environment variable had been removed.

This is user-reported external configuration state. Codex did not execute or independently query the removal, so the exact affected scopes are not claimed as verified. Vercel environment changes apply to new deployments rather than rewriting existing deployment artifacts; no new Preview or Production deployment had been created when this commit was prepared.

## Scope boundaries

Included:

- local application, route, tests, CI definition, README, ADR, and engineering-log changes;
- local verification with mocked provider calls;
- preservation of the original guided flow.

Excluded:

- no live OpenAI request;
- no Codex-executed Vercel environment-variable change; the user-reported external removal is recorded above;
- no WAF configuration;
- no commit, push, pull request, CI run, deployment, or production smoke test;
- no claim that local verification proves deployed behavior.

## Collaboration attribution

- User: selected BYOK, required a zero-API demo, approved a long-lived dedicated test-key policy, and authorized local implementation.
- Codex: inspected the current code and documentation, designed and implemented the boundary, added tests and CI coverage, and recorded evidence and limitations.
