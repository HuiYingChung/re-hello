# Engineering Log - README User Flow Diagram

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Record drafting started: 2026-07-22 16:07:31 -05:00 (instrumented command output)
- Record created: 2026-07-22 16:08:33.339 -05:00 (NTFS `CreationTime`)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/add-readme-user-flow`
- Branch base commit: `e77785760d3272c0c10287a2264cfbf69fd07174`
- Production URL: <https://re-hello.vercel.app/>
- Publication status at record creation: local documentation change only; not committed, pushed, merged, or deployed

## Objective

Add a compact user-flow diagram to the root README so a visitor can understand the first-run paths, the main returning-user loops, and the boundary between browser-local behavior and the GPT-5.6 server request without reading the implementation.

## Evidence used

The diagram was derived from the merged `main` source and the production walkthrough completed immediately before this documentation task:

- first-time users move through Welcome and choose either `Shape my first memory` or `Explore a ready-made demo`;
- the ready-made demo seeds five people, five encounters, and five reminders in browser localStorage;
- Quick Remember offers a messy-note path and the existing guided capture path;
- only an explicit messy-note submission calls the server-side `/api/remember` route and OpenAI Responses API;
- both capture paths converge on a recall-card review, local save, and optional reminder;
- returning users branch from Home into person recall, event Prep, or Settings;
- Prep uses locally stored people, follow-up questions, and mined conversation topics;
- Settings supports backup and restore, sample data, hidden-section restoration, and clearing data.

No paid OpenAI request was made for this documentation change.

## Diagram decisions

### Use Mermaid in the README

GitHub renders Mermaid directly, so the diagram remains versioned, searchable, and editable beside the product description. A static image would require a separate generated asset and could drift from its source labels.

### Show one primary loop with three returning-user branches

The chart centers on Welcome, Quick Remember, browser localStorage, and Home. Person recall, Prep, and Settings appear as branches from Home rather than separate diagrams so the visitor can see how they return to the same local product loop.

### Make the model boundary explicit

The only edge crossing into `/api/remember` is labeled `Explicit submit`. Guided capture connects directly to recall-card review and does not pass through the OpenAI nodes. The accompanying sentence states that saved records, reminders, sample data, and Prep topic mining remain in the browser.

### Avoid claims not present on merged main

The diagram does not include the separately developed `Who I met` starter because that branch is not part of merged `main`. It describes the current production and source behavior only.

## Failed attempts and recoveries

### Branch-base fetch signal

The first pre-branch composite command ran `git fetch origin --prune` followed by status and ref checks. Git could not write `.git/FETCH_HEAD` in the restricted environment, but the later successful commands obscured that failure in the final exit status.

Recovery: run the fetch as a standalone narrowly approved Git command, confirm it succeeds, then verify that local `main` and `origin/main` both resolve to `e77785760d3272c0c10287a2264cfbf69fd07174`. The prevention rule is recorded as L30 in `lessons.md`.

### First diagram layout

The first Mermaid rendering was syntactically valid but visually unsuitable for the README: long return-to-Home edges crossed multiple branches and made the chart difficult to scan.

Recovery: remove redundant return edges, keep Home as the visible branching hub, and preserve only the product decisions required to understand each path. The simplified diagram was rendered and inspected again.

### SVG inspection and PNG rasterization

Mermaid CLI 11.16.0 successfully rendered the exact fenced README source, but the local image viewer could not process the SVG. The first headless Chrome rasterization then failed to write the relative `.tmp-readme-user-flow.png` path with `Access is denied`. A second command wrote a 148,834-byte PNG to an absolute temporary path, but the wrapper falsely threw `Chrome exited` because `$LASTEXITCODE` was null despite the completed file.

Recovery: use an explicit absolute temporary PNG path, poll for the output, and gate success on file existence and byte length rather than the nullable launcher exit code. The final simplified diagram produced a 91,503-byte PNG whose labels and edges were visually inspected successfully. L31 in `lessons.md` records the prevention rule.

### Placeholder validator false positive

At 2026-07-22 16:23:20 -05:00, the first documentation validator classified every use of the word `pending` as a placeholder. It therefore failed on two accurate historical-state sentences that explicitly say the checks were pending only when the record was first created and subsequently passed.

Recovery: inspect the two matches, preserve the honest historical record, and narrow the check to explicit placeholder syntax or a field whose final value is unresolved. L32 in `lessons.md` records the prevention rule.

## Scope boundaries

Included:

- one Mermaid user-flow section in the root README;
- the browser-versus-server data-boundary sentence;
- this English engineering record and documentation-index entry;
- the append-only fetch failure lesson.

Excluded:

- no application code, user-facing runtime copy, route, storage, model, or deployment change;
- no correction of the separate README accuracy findings from the preceding review;
- no Product Hunt asset, screenshot, or standalone visualization file;
- no push, pull request, merge, or deployment.

## Validation results

Validation completed by 2026-07-22 16:22:08 -05:00:

- exact README Mermaid source comparison: pass;
- Mermaid CLI 11.16.0 SVG render: pass, 132,027-byte SVG;
- rasterized visual review: pass, 91,503-byte PNG with readable, unclipped labels and a clear primary capture path;
- temporary Mermaid source, browser configuration, SVG, and PNG artifacts: removed;
- paid OpenAI request: not run;
- application lint, test, and build: not run because the change is documentation-only and does not modify executable source.

Documentation checks completed at 2026-07-22 16:24:17 -05:00:

- Mermaid block count and required flow labels: pass;
- English-only engineering record and no unresolved placeholder syntax: pass;
- lesson numbering through L32: pass;
- relative links in all four changed documents: pass;
- `git diff --check`: pass, with informational LF-to-CRLF working-copy warnings;
- exact staged-path check: pass; only `README.md`, `docs/README.md`, this engineering log, and `lessons.md` were staged;
- staged `git diff --check`: pass.

## Honest state at record creation

- The branch is based on merged local and remote `main` commit `e77785760d3272c0c10287a2264cfbf69fd07174`.
- The flowchart exists only in the local working tree.
- Mermaid rendering and visual inspection were still pending at the instant this record was created; both subsequently passed as recorded above.
- Markdown integrity and relative links were still pending at record creation.
- No commit, push, GitHub Actions run, Vercel deployment, or production README update exists for this change.

## Committed feature state

At 2026-07-22 16:25:02 -05:00:

- feature commit: `560678920967dab0e2783478b890eaf49ae7efae` (`docs: add README user flow diagram`);
- committed scope: the four explicitly staged documentation paths, 221 insertions, no application files;
- exact-commit README check: pass; one Mermaid block contains all required flow and server-boundary labels;
- working tree immediately after the feature commit: clean;
- push, pull request, CI, deployment, and production README update: not performed.

This state update is a documentation-only follow-up and therefore cannot contain its own eventual commit hash. That final local commit is reported in the handoff.

## Collaboration attribution

- User: requested a user-flow diagram in the README.
- Codex: mapped the verified current flows, chose the Mermaid representation, implemented the documentation, and recorded verification and failure evidence.

## Next actions

1. Validate Mermaid syntax and renderability.
2. Run Markdown integrity, English-only record, and relative-link checks.
3. Review and commit only the explicit documentation paths.
4. Push only when requested.
