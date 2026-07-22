# Engineering Log - Mobile-First README Rationale

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Record drafting started: 2026-07-22 16:27:12 -05:00 (instrumented command output)
- Record created: 2026-07-22 16:30:06.029 -05:00 (NTFS `CreationTime`)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/add-readme-user-flow`
- Starting commit: `ab48efa8936d83144b2904ba2f98d944a0746e82`
- Production URL: <https://re-hello.vercel.app/>
- Publication status at record creation: local documentation change only; not committed, pushed, merged, or deployed

## Objective

Explain in the root README why Rehello intentionally provides a phone-sized primary experience: its useful moments occur immediately after a social interaction, shortly before the next one, or when the user decides to follow up, rather than during sustained desk-based record management.

Record the rationale as an explicit product decision so the narrow desktop shell is not mistaken for an unfinished responsive layout.

## Source evidence reviewed

- `README.md` for the existing product promise, design principles, PWA description, and user flow;
- `web/src/app/globals.css` for the 390-pixel shell and full-width narrow-screen breakpoint;
- `web/src/components/app-shell.tsx` for bottom navigation and the shared phone surface;
- `web/src/app/manifest.ts` for standalone display and portrait orientation;
- ADR-0004 for the launch decision to keep both first-run actions visible in a narrow mobile viewport.

## Documentation implemented

### README rationale

Added `Why mobile first` after `Why it exists`. The section links the platform choice to three concrete usage moments:

1. capturing details before they fade after meeting someone;
2. reviewing a compact recall card on the way to the next event;
3. setting a reminder when the intention to reconnect is fresh.

The copy explicitly distinguishes immediate social support from later desktop record management.

### Accuracy boundary

The README does not claim that desktop browsers are unsupported. Rehello currently opens on desktop and renders the same constrained phone shell. The accepted decision is to avoid a separate desktop information architecture for the MVP, so the accurate term is `mobile-first`, not technically `mobile-only`.

### Decision record

Created ADR-0006 with the use-context rationale, existing implementation evidence, alternatives, accepted tradeoffs, and review triggers. The documentation index now links both ADR-0006 and this engineering log.

## Failed attempt and recovery

At 2026-07-22 16:28:42 -05:00, the first combined patch failed before writing any file. Its README anchor copied a terminal-rendered mojibake sequence, `â€”`, while the source contains a UTF-8 em dash. The patch tool could not find the expected context around the sentence ending in `quiet, warm, never nagging`.

Evidence: the patch returned `Failed to find expected lines`; the immediate repository status remained clean; and neither proposed new record file existed.

Recovery: use the unique ASCII heading `## Design principles` as the insertion anchor, split the multi-file change into smaller patches, and confirm the repository state before proceeding. L33 in `lessons.md` records the prevention rule.

## Scope boundaries

Included:

- one English README rationale section;
- one English product ADR;
- this English engineering log;
- two documentation-index entries;
- one append-only failure lesson.

Excluded:

- no application source or CSS change;
- no new device restriction, user-agent detection, or desktop redirect;
- no PWA manifest or deployment change;
- no product analytics or claim of observed user research;
- no physical-device or production verification.

## Verification plan

- confirm the README description matches the checked implementation evidence;
- validate relative Markdown links in all changed documents;
- confirm the ADR and engineering log contain no CJK text or unresolved placeholders;
- run `git diff --check`;
- stage and commit only the explicit documentation paths.

## Validation results

Documentation validation completed at 2026-07-22 16:31:09 -05:00:

- README claims against the checked 390-pixel CSS shell, 640-pixel breakpoint, bottom navigation, and standalone portrait manifest: pass;
- English-only ADR and engineering log: pass;
- unresolved placeholder syntax: none;
- lesson numbering through L33: pass;
- relative links across all five changed documents: pass;
- `git diff --check`: pass, with informational LF-to-CRLF working-copy warnings;
- application lint, test, and build: not run because no executable source or configuration changed;
- paid OpenAI request: not run.

Exact staged-path validation passed: only `README.md`, `docs/README.md`, `lessons.md`, ADR-0006, and this engineering log were staged. Staged `git diff --check` also passed.

## Honest state at record creation

- The README, ADR, index, lesson, and this record exist only in the local working tree.
- Documentation validation has not yet been run.
- No commit, push, pull request, GitHub Actions run, Vercel deployment, or production README update exists for this addition.

## Committed feature state

At 2026-07-22 16:32:25 -05:00:

- feature commit: `fd296daf3e00f79db6a9b68fe1f881376e40c3ef` (`docs: explain Rehello mobile-first focus`);
- committed scope: the five explicitly staged documentation paths, 299 insertions, no application files;
- exact-commit README rationale check: pass;
- exact-commit ADR accuracy-boundary check: pass;
- working tree immediately after the feature commit: clean;
- push, pull request, CI, deployment, and production README update: not performed.

This verification update is a documentation-only follow-up and cannot contain its own eventual commit hash. That final local commit is reported in the handoff.

## Collaboration attribution

- User: chose the mobile product focus and supplied the real-world usage rationale.
- Codex: checked the implementation boundary, refined the wording to mobile-first rather than desktop-blocked, implemented the documentation, and recorded verification evidence.
