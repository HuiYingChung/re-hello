# Engineering Log - Private Single-User Version

## Record metadata

- Date: 2026-07-23
- Time zone: Europe/Zurich (UTC+02:00)
- Work started: exact time not captured
- Record updated: 2026-07-23 12:37:31 +02:00
- Repository: `/Users/benjaminbarmettler/Documents/Re-Hello`
- Work branch: `codex/private-persistent-version`
- Starting commit: `6f3e426dd269b58ae61f17f44ea984c703e572a8`
- Target repository: `Benjamin-00001/helloagain`
- Vercel project: `benbar/helloagain`

## Objective

Create a private, low-maintenance iPhone version with durable free-tier
storage, minimal platform dependencies, JSON portability, and the agreed
relationship-memory additions.

## Baseline evidence

| Check | Result | Scope |
| --- | --- | --- |
| `npm ci` | PASS | 398 packages installed from the existing lockfile |
| `npm test` | PASS after sandbox-only retry | 2 files, 9 tests |
| `npm run lint` | PASS | Existing source |
| `npm run build` | PASS after sandbox-only retry | 17 routes |

The restricted first test and build attempts failed only because Vitest and
Next.js could not create temporary/generated files. The identical approved
commands passed.

## Implemented locally

- Added signed-cookie owner authentication and a Next.js 16 proxy boundary.
- Added authenticated full-snapshot data routes and a one-row Neon PostgreSQL
  store.
- Added local-to-cloud migration and debounced browser-mirror synchronization.
- Added relationship category, tags, birthday, contact information, and
  general notes to person profiles and search.
- Enabled quick capture for existing people.
- Added recurring reminders and local `.ics` calendar export.
- Added logout and updated the main interface and product metadata to German
  Helloagain branding.
- Added authentication and calendar tests plus a safe environment template.
- Replaced the public-demo README with private deployment and privacy
  documentation.

## External configuration

- Read-only Vercel inspection confirmed that `helloagain` had no connected Git
  repository, no deployment, and no project environment variables.
- DeepInfra existed only as an account-level installation, with no installed
  product, project binding, or exported key.
- After explicit owner authorization, the official Vercel CLI removed
  DeepInfra successfully.

Git connection, Neon provisioning, production secrets, deployment, and the
deployed database smoke test remain separate from this local implementation
record until completed.

## Publication update

- Commit `e72fab2d2be18666e09566839ab1cb09d090b531` was pushed to
  `Benjamin-00001/helloagain` on branch
  `codex/private-persistent-version`.
- Draft pull request 1 targets `main` and reports the exact same head SHA.
- GitHub reported no checks or workflow runs for the new fork branch; this is
  recorded as CI not started, not as a pass or failure.
- The local directory was linked to the existing `benbar/helloagain` Vercel
  project without deploying.
- The first Neon provisioning request was intentionally fixed to plan
  `free_v3`, region `fra1`, and `auth=false`. Vercel required the owner to
  accept Marketplace terms before a resource could be created.

## Vercel configuration update

- The owner accepted the Neon Marketplace terms in the authenticated Vercel
  browser.
- The identical retry provisioned `helloagain-db` successfully on `free_v3`
  in `fra1` with Neon application auth disabled.
- Vercel connected the database resource to `benbar/helloagain`.
- A name-and-scope-only environment listing confirmed `DATABASE_URL` and the
  related Neon variables for Production, Preview, and Development. No secret
  value was retrieved or printed.
- A freshly generated random `AUTH_SECRET` was piped directly to Vercel and
  stored as Sensitive for Production and Preview without local persistence or
  output.
- The owner chose and saved `APP_PASSWORD` personally. A later
  name-and-scope-only listing confirmed that it is encrypted and available to
  Production and Preview; its value was not retrieved.
- The Neon installer also created unrelated untracked local agent-skill
  metadata. Those exact generated files were removed before publication; the
  external Neon resource and application dependencies were unchanged.

## Current local verification

| Check | Result | Scope |
| --- | --- | --- |
| `npm test` | PASS; 4 files, 13 tests | No Neon or OpenAI network calls |
| `npm run lint` | PASS | New and existing source |
| `npm run build` | PASS | Next.js 16.2.2; 21 routes including proxy |

## Known boundary

The synchronization strategy is deliberately last-write-wins. It is suitable
for one owner using the app normally but must be redesigned before
collaborative editing or multi-user accounts.
