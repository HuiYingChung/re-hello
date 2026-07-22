# Engineering Log - Honest Boundary Copy

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Record drafting started: 2026-07-22 16:48:16 -05:00 (instrumented command output)
- Record created: 2026-07-22 16:49:23.389 -05:00 (NTFS `CreationTime`)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/add-readme-user-flow`
- Starting commit: `74ae935caeaefe859776504c2d6ab85657de3f1b`
- Production URL: <https://re-hello.vercel.app/>
- Publication status at record creation: local source and documentation changes only; not committed, pushed, merged, or deployed

## Objective

Apply the remaining honesty corrections found during the product-architecture audit while keeping user-facing language calm and understandable.

The work must correct the contradiction between `No accounts or tracking` and the globally mounted Vercel Analytics component, make the in-app-only reminder behavior explicit, disclose the readable JSON backup format, and repair the Guided Capture path in the README User flow.

## Source evidence reviewed

### Analytics disclosure

- `web/src/app/layout.tsx` imports and mounts `<Analytics />` from `@vercel/analytics/next` for the application.
- `web/src/app/settings/page.tsx` still displayed `No accounts or tracking` before this correction.
- ADR-0004 D6 had already accepted removing that blanket claim because it was not code-verifiable, but the remaining Settings instance showed that the implementation was incomplete.

### Reminder behavior

- `StayInTouchPicker` writes a Reminder object through `saveReminder`.
- `web/src/lib/storage.ts` stores reminders in localStorage and derives due and upcoming lists from dates.
- Home and person-profile pages render those stored reminders only when the user opens the application.
- A checked source scan found zero `Notification`, `PushManager`, service-worker, or calendar references.

The product therefore supports in-app reminders, not push, email, SMS, calendar, or operating-system notifications.

### Backup behavior

- Settings serializes the export payload with `JSON.stringify` and downloads a `.json` file.
- The exported payload contains people, encounters, and reminders.
- No encryption operation protects that downloaded file in application code.

### Guided Capture behavior

- The Quick Remember path calls `/api/remember`, returns a GPT draft, and offers Save or Adjust.
- Adjust enters the existing Guided Capture steps with populated answers.
- Direct Guided Capture answers prompts, optionally records mood, then writes browser-local Person and Encounter data.
- Guided Capture does not pass through the GPT draft-review state.

## Product copy decisions

### State what will happen

Reminder copy now says that the reminder will be waiting in Rehello the next time the user opens it. `No push notification` follows as a short expectation boundary instead of leading with a technical limitation.

### Keep privacy copy literal

Settings now says:

- no account;
- people and moments stay in this browser;
- only a Quick Remember note the user chooses to shape is sent to OpenAI;
- Rehello also includes Vercel Analytics.

It does not claim that Analytics is absent, anonymous, cookieless, or unable to collect a specific payload because those live properties were not audited here.

### Put backup risk beside the action

The readable-JSON note appears in the Settings data section beside Download and Restore, where the user can act on it. The language asks the user to keep the file private without introducing security jargon.

### Correct diagrams and repository framing

The README User flow now gives Guided Capture its own prompt-and-optional-mood path into browser save logic. GPT draft review belongs only to Quick Remember. The README also identifies reminders as in-app, lists Vercel Analytics in the technology stack, and describes the project as launch-stage rather than `less-instrumented` with an `optional` AI interaction.

## Failed attempts and recoveries

### Reserved HOME variable collision

Before 2026-07-22 16:45:26 -05:00, the first reminder audit assigned source text to `$home`. PowerShell treated it as the read-only `$HOME` variable and stopped the composite command before the later checks.

Recovery: use `$homePage`, rerun the incomplete portion, and explicitly count notification-related references. L37 in `lessons.md` records the mandatory prevention rule.

### Repeated mojibake patch anchor

At 2026-07-22 16:46:59 -05:00, the first combined correction patch repeated L33 by copying a terminal-rendered mojibake em dash into exact README context. The complete patch was rejected and no partial edit was written.

Recovery: verify the clean state, split the change, and use only minimal ASCII source lines as README anchors. L38 in `lessons.md` records the repeated failure and stronger prevention rule.

### Restricted Google Fonts fetch

From 2026-07-22 16:52:56.623 -05:00 to 16:53:04.853 -05:00, the first production build failed only while Next.js tried to fetch Instrument Serif and Noto Sans TC from Google Fonts in the restricted environment.

Recovery: preserve the error, keep the source unchanged, and rerun the same build with narrowly approved network access. The retry passed from 2026-07-22 16:53:19.856 -05:00 to 16:53:34.519 -05:00. L39 in `lessons.md` records the prevention rule.

### Non-unique ordered-record anchor

At 2026-07-22 16:54:20.318 -05:00, the first L39 patch was found between L37 and L38 because it used a repeated `Source` line as its append anchor.

Recovery: remove the misplaced block, reinsert it after unique L38 text, and add L40 with a mandatory unique-anchor and immediate-order-check rule.

### Validator harness failures

Three validator defects were found before a clean documentation validation:

1. The first composite script did not parse because `$index:` was used inside an interpolated PowerShell string. The exact time was not captured; it occurred after 2026-07-22 16:54:20 and before 16:56:17 -05:00. Recovery was to use `-f` formatting. L41 records the rule.
2. The second script used `if` where PowerShell expected a command and checked a JSX-wrapped sentence with a whitespace-sensitive full-string assertion. It failed before 2026-07-22 16:56:17 -05:00. Recovery was a statement-level reporting loop and two stable phrase checks. L42 records the rule.
3. The third script required contiguous lesson numbers and rejected the historical L21-to-L26 gap after all 13 product truth checks passed. This occurred before 2026-07-22 16:56:53.332 -05:00. Recovery was to validate uniqueness, globally increasing order, and the exact current tail. L43 records the rule.

### Restricted Git index write

The first explicit nine-file staging command failed before 2026-07-22 16:58:59.249 -05:00 because the default sandbox could not create `.git/index.lock`. No file was partially staged.

Recovery: rerun only the same path-limited `git add --` operation with approved Git-write permission, pass `git diff --cached --check`, and confirm exactly the nine intended staged paths. L44 records the rule.

## Files changed

- `web/src/app/remember/page.tsx`
- `web/src/app/settings/page.tsx`
- `web/src/app/people/[id]/page.tsx`
- `web/src/app/people/[id]/recall/page.tsx`
- `README.md`
- `docs/README.md`
- `docs/decisions/ADR-0004-gpt56-launch-framing.md`
- `lessons.md`
- this engineering log

## Scope boundaries

Included:

- user-friendly corrections to privacy, reminder, and backup copy;
- one existing User flow correction;
- README limitation, technology, and status corrections;
- a dated ADR-0004 amendment;
- this engineering log, index entry, and eight failure lessons.

Excluded:

- no analytics, reminder, notification, backup, storage, model, prompt, API, WAF, or environment behavior change;
- no new push-notification or encryption implementation;
- no live analytics-payload, production, or physical-device claim;
- no paid OpenAI request.

## Verification plan

1. Assert that all removed misleading strings are absent and the friendly replacement strings exist.
2. Confirm reminder code still has no notification, push, service-worker, or calendar integration.
3. Render and visually inspect the exact updated README User flow.
4. Run ESLint and a production build because executable TSX changed.
5. Validate English records, links, lesson order, and `git diff --check`.
6. Stage and commit only the explicit files listed above.

## Honest state at record creation

- The source, README, ADR amendment, lessons, index, and this record exist only in the local working tree.
- Lint, build, Mermaid, browser, staging, and exact-commit verification have not yet been completed.
- No push, pull request, CI, deployment, production API call, or production smoke test exists for these corrections.

## Verification results before commit

- ESLint passed from 2026-07-22 16:52:42.094 -05:00 to 16:52:51.751 -05:00.
- The first production build failed only at the restricted Google Fonts fetch described above. The unchanged network-enabled retry passed from 2026-07-22 16:53:19.856 -05:00 to 16:53:34.519 -05:00, including compilation, TypeScript, page-data collection, and all 17 static pages.
- Before 2026-07-22 16:52:15 -05:00, Mermaid CLI 11.16.0 rendered the exact first Mermaid block from the updated README to a 96,134-byte PNG. Visual inspection found all nodes, labels, and branches readable and unclipped. The render and its two repository-local input files were then removed.
- The source scan found no `Notification`, Push API, service-worker registration, or calendar-file implementation. Reminder records remain browser-local and appear only when Rehello is open.
- The source scan confirmed that Vercel Analytics remains mounted globally and Settings still exports readable JSON through `JSON.stringify`.
- At 2026-07-22 16:58:02.741 -05:00, the corrected composite validator passed all 13 product truth checks, the two-Mermaid-block check, unique and increasing lesson order with the exact L37-L43 tail, English-record checks, relative Markdown links, and `git diff --check`.
- Final diff review completed by 2026-07-22 16:58:21.917 -05:00 with exactly the nine files listed in this record modified or untracked.
- No OpenAI request, browser acceptance run, physical-device test, CI run, push, deployment, or production smoke test was performed.

## Feature commit and exact-commit verification

- Feature commit: `863f0949cae365b656fcff8b5f64cec34a94d180`
- Commit created: 2026-07-22 16:59:41 -05:00
- Commit subject: `fix: clarify privacy and reminder boundaries`
- The working tree was clean before both exact-commit executable checks.
- ESLint passed against exact feature commit `863f094` from 2026-07-22 16:59:57.019 -05:00 to 17:00:03.670 -05:00.
- The production build passed against exact feature commit `863f094` from 2026-07-22 17:00:16.750 -05:00 to 17:00:29.581 -05:00, including compilation, TypeScript, page-data collection, and all 17 static pages.
- `git show --check` and the exact-commit truth check passed at 2026-07-22 17:00:42.554 -05:00.
- This commit remains local. It has not been pushed, reviewed by CI, deployed, or tested on production.

## Collaboration attribution

- User: authorized the additional recommended corrections and required user-friendly product language.
- Codex: found the remaining contradictions, implemented bounded copy and documentation corrections, and recorded verification and failures.
