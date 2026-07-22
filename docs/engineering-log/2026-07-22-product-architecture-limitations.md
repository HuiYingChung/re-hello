# Engineering Log - Product Architecture and Limitations

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Record drafting started: 2026-07-22 16:36:25 -05:00 (instrumented command output)
- Record created: 2026-07-22 16:38:10.262 -05:00 (NTFS `CreationTime`)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/add-readme-user-flow`
- Starting commit: `1f0014a95ba3e6ac825a9af1387d2b88ec0d87b8`
- Production URL: <https://re-hello.vercel.app/>
- Publication status at record creation: local documentation change only; not committed, pushed, merged, or deployed

## Objective

Add a second README diagram that explains Rehello's operating architecture and the exact bounded role of GPT-5.6. Add a clear limitations section that distinguishes implemented behavior, deployment-dependent controls, unverified provider behavior, and features that do not exist.

The documentation must not imply that GPT-5.6 stores the user's history, powers every feature, guarantees factual accuracy, or provides an autonomous social assistant.

## Repository evidence reviewed

### GPT request and response boundary

`web/src/app/api/remember/route.ts` establishes the server contract:

- the route is `POST /api/remember` and runs in the Node.js runtime;
- the API key is read from the server environment;
- the exact model slug in code is `gpt-5.6-terra`;
- only the submitted `memory` string is used as user input;
- accepted note length is 20 through 1,200 characters;
- the request uses `store: false`, low reasoning effort, and a maximum of 1,000 output tokens;
- the system prompt requests facts from the note only, no sensitive inference, preserved input language, and empty strings for missing values;
- Zod structured output defines seven strings: `name`, `oneLiner`, `where`, `impression`, `talkedAbout`, `memorableDetail`, and `nextTimeAsk`;
- the server trims the parsed result and rejects a draft without a name;
- responses use `Cache-Control: no-store`;
- the route returns bounded 4xx or 5xx errors and contains no database write.

### Browser behavior

`web/src/app/remember/page.tsx` establishes the client contract:

- starter labels do not count toward the client-side 20-character threshold;
- only an explicit button action posts the current note to the route;
- the client aborts after 45 seconds;
- the returned draft is checked again for the seven string fields;
- the user can save the draft, return to edit the note, or enter the guided adjustment flow;
- saving creates a new Person and Encounter in browser localStorage;
- the quick path uses the current time for the Encounter date;
- guided capture does not call the GPT route.

The Quick Remember preview renders name, relationship label, location, topics, memorable detail, and next question. The generated `impression` value is not displayed in that preview, although it is saved by `saveQuickDraft`; the user can reach it through `Adjust the details`.

### Local product mechanisms

`web/src/lib/storage.ts`, `web/src/app/prep/prep-flow.tsx`, and `web/src/app/settings/page.tsx` establish the non-AI behavior:

- people, encounters, reminders, sort state, hidden sections, and onboarding state use browser localStorage;
- manual JSON export and import cover people, encounters, and reminders;
- Prep chooses starters from static pools and mines repeated English words from stored encounters locally;
- there is no code path from localStorage into `/api/remember`;
- there is no account, database, or cross-device synchronization implementation in the checked repository.

### Deployment and verification surfaces

- `web/src/app/layout.tsx` mounts `@vercel/analytics` globally.
- `web/src/app/manifest.ts` supplies standalone portrait PWA metadata.
- A corrected tracked-file scan found no service-worker or Workbox filename and no unit or end-to-end test/spec filename.
- `web/package.json` exposes only development, build, start, and lint scripts.
- `.github/workflows/ci.yml` runs `npm ci`, lint, and production build.
- The API route contains no authentication or repository-level rate-limiter logic.

No live Vercel Analytics payload, Vercel WAF rule, provider budget, billing cap, physical device, installed PWA, production API response, or current provider retention policy was verified in this task. The README therefore reports those as unverified instead of inferring them from earlier configuration work.

## Diagram decisions

### Separate the three execution boundaries

The Mermaid diagram uses explicit Browser, Next.js server route, and OpenAI groups. This prevents the model from appearing to run in the browser or to have direct access to localStorage.

### Show the only GPT input edge

Only the Quick Remember node crosses the server boundary, and the edge is labeled `Explicit submit: this note only`. Guided capture connects directly to browser save logic. No arrow connects localStorage to GPT-5.6.

### Describe GPT-5.6 as a transformer, not a memory store

The model receives the current note, system rules, and output schema. It returns a structured candidate that the server validates and the user reviews. The diagram does not claim that GPT-5.6 remembers users, retrieves prior encounters, schedules reminders, mines Prep topics, or saves data.

### Include analytics without inventing its payload

Because `<Analytics />` is mounted globally, the diagram includes Vercel Analytics. The edge explicitly says that its live payload was not audited. This preserves the accurate distinction between local personal-record storage and zero external telemetry, which Rehello does not claim.

## Limitations documented

The root README now states the current boundaries in ten areas:

1. GPT-5.6 powers only one bounded Quick Remember transformation.
2. Structured generation can still be incomplete or inaccurate.
3. Quick Remember has length, name, date, preview, and duplicate-person limitations.
4. saved records are tied to one browser profile unless manually backed up;
5. explicit notes and app analytics create external data flows;
6. model availability depends on network, server configuration, and OpenAI;
7. authentication, rate limiting, budgets, and WAF controls are not enforced by the route itself;
8. PWA metadata does not provide an offline implementation;
9. model-language behavior does not make the English interface fully localized;
10. automated and physical-device verification coverage is limited.

The existing Feature tour row for Settings was also corrected: the checked Settings source provides backup and restore, hidden-section restoration, sample data, Welcome replay, and local-data clearing, but no storage-size display.

## Failed attempts and recoveries

### Assumed Quick Remember file paths

At 2026-07-22 16:33:43 -05:00, the first composite audit read the API route and search evidence, then failed on nonexistent `web/src/lib/quick-remember.ts` and `web/src/app/quick-remember/page.tsx` paths.

Recovery: enumerate actual paths with `rg --files` and audit the integrated implementation in `web/src/app/remember/page.tsx`. L34 in `lessons.md` records the prevention rule.

### Unhandled zero-match exit code

At 2026-07-22 16:35:05 -05:00, a second composite audit read the intended source ranges but ended with exit 1 because its final `rg` filename filter found no service-worker, Workbox, or test/spec file.

Recovery: collect tracked paths explicitly, count matching arrays, and emit a named zero-result confirmation with exit 0. L35 in `lessons.md` records the prevention rule.

### Restricted npm cache blocked the first Mermaid render

After 2026-07-22 16:36:25 and before 16:41:12 -05:00, the first Mermaid CLI 11.16.0 attempt confirmed that the README's second Mermaid block exactly matched the render input, then failed before rendering because npm was restricted to cache-only mode and the pinned package was not cached. npm returned `ENOTCACHED`; this was not treated as a diagram syntax result.

Recovery: re-run the identical pinned renderer and source with narrowly approved npm network access. The command produced a 58,766-byte PNG. Visual inspection found readable, unclipped labels; distinct Browser, Next.js server, and OpenAI boundaries; no localStorage-to-GPT edge; and a separate analytics node. Temporary source, browser configuration, and PNG files were removed afterward. L36 in `lessons.md` records the prevention rule.

## Scope boundaries

Included:

- one Mermaid product-architecture diagram in the root README;
- one detailed current-limitations section;
- one correction to the Settings feature row;
- this English engineering log and its documentation-index entry;
- three append-only failure lessons.

Excluded:

- no application, API, model, prompt, schema, storage, analytics, WAF, environment, or deployment change;
- no paid OpenAI request;
- no claim that live production matches the local branch before merge and deployment;
- no new ADR because this work documents existing architecture rather than accepting a new runtime design.

## Verification plan

- compare every architecture and limitation claim with the cited checked source;
- render the exact README Mermaid block and visually inspect the result;
- validate relative Markdown links in all changed documents;
- confirm this log contains no CJK text or unresolved placeholders;
- confirm lesson numbering remains append-only;
- run `git diff --check`;
- stage and commit only the explicit documentation paths.

## Mermaid validation result

Completed before 2026-07-22 16:41:12 -05:00:

- exact second README Mermaid block versus render input: pass;
- Mermaid CLI 11.16.0 syntax and PNG render: pass;
- output size: 58,766 bytes;
- visual boundary, arrow direction, label readability, and clipping review: pass;
- temporary validation artifacts: removed;
- paid OpenAI request: not run.

## Documentation validation result

Completed at 2026-07-22 16:42:31 -05:00:

- exact source assertions for the model slug, request options, client timeout, save behavior, local Prep mining, Analytics mount, PWA manifest, and CI job: pass;
- OpenAI client constructions found in checked source: exactly one;
- conventional service-worker, Workbox, test/spec, and database-pattern tracked files: zero;
- README Mermaid blocks: exactly two;
- architecture diagram required boundaries and labels: pass;
- direct localStorage-to-GPT edge: absent;
- English-only engineering log and unresolved-placeholder check: pass;
- append-only lesson ordering through L36: pass;
- relative links across all four changed documents: pass;
- service-worker references in executable source: zero;
- `git diff --check`: pass, with informational LF-to-CRLF working-copy warnings;
- application lint, test, and build: not run because this change modifies documentation only.

Exact staged-path validation passed: only `README.md`, `docs/README.md`, `lessons.md`, and this engineering log were staged. Staged `git diff --check` also passed.

## Honest state at record creation

- The diagram, limitations, correction, lessons, index entry, and this log exist only in the local working tree.
- Mermaid and documentation validation have not yet been completed.
- No commit, push, pull request, GitHub Actions run, Vercel deployment, or production README update exists for this addition.

## Committed feature state

At 2026-07-22 16:43:36 -05:00:

- feature commit: `61208443f438e46fb9b15f77fc5d25695a5ab9e0` (`docs: document product architecture and limits`);
- committed scope: the four explicitly staged documentation paths, 347 insertions, one stale Settings claim removed, and no application files;
- exact-commit README Mermaid block count: two;
- exact-commit architecture required-label check: pass;
- exact-commit limitation count: ten;
- exact-commit stale `view storage size` claim: absent;
- working tree immediately after the feature commit: clean;
- push, pull request, CI, deployment, production API call, and production README update: not performed.

This verification update is a documentation-only follow-up and cannot contain its own eventual commit hash. That final local commit is reported in the handoff.

## Collaboration attribution

- User: required an honest operating-mechanism diagram, an exact explanation of GPT-5.6's role, and clear limitations.
- Codex: audited the repository boundaries, corrected one stale README claim, implemented the diagram and limitations, and recorded evidence and failures.
