# Engineering Log - GPT-5.6 Launch Framing and Demo Entry

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Record drafting started: 2026-07-22 14:50:02 -05:00 (instrumented command output)
- Record created: 2026-07-22 14:52:12.069 -05:00 (NTFS `CreationTime`)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/launch-framing`
- Branch base commit: `087488cabac9e4986f4d4d7f79c17c6b55cca686`
- Production URL: <https://re-hello.vercel.app/>
- Publication status at record creation: local implementation only; not committed, pushed, merged, or deployed

## Evidence and timestamp policy

This record separates implemented code, local verification, and publication state.

- A time is listed as exact only when a command printed it directly or NTFS reported it for a named file.
- The exact time of the first branch-creation attempt was not instrumented. It occurred after the 14:37:59 fetch inspection and before the 14:38:45 base inspection.
- Browser screenshots were written outside the repository and are temporary local artifacts, not durable launch evidence.
- The browser checks intentionally did not submit Quick Remember, so no OpenAI request or paid model invocation was made.
- Passing local lint, build, and browser checks does not imply that GitHub Actions, Vercel, or the public production URL contain this change.

## Objective

Reviewer feedback identified a contest-positioning problem rather than a missing product capability: Rehello had a strong mobile and emotional product proposition, but its launch copy described GPT-5.6 as an optional server route. The same feedback noted that first-time visitors could miss the sample experience and encounter an empty application.

The objective of this branch was to make the already-built Quick Remember transformation the signature launch moment and to make the ready-made demo obvious on the last Welcome screen. The work had to preserve launch stability under the remaining deadline.

## Scope boundaries

Included:

- strengthen the Welcome screen's GPT-5.6 explanation;
- rename the first-run primary action to match the AI transformation;
- promote sample data from a quiet text link to a full-width secondary action;
- align repository, page metadata, PWA manifest, and social preview copy;
- correct an inaccurate README statement about tracking;
- keep both final Welcome actions visible in a 390 by 653 mobile viewport.

Explicitly excluded:

- no new GPT endpoint or request contract;
- no GPT-generated Prep conversation starters;
- no realtime voice, microphone, transcription, or audio storage;
- no authentication, storage, or rate-limit changes;
- no production deployment or production API submission.

## Timeline

| Time (CT) | Recorded engineering event | Evidence |
| --- | --- | --- |
| 2026-07-22 14:37:59 | Fetched `origin`, pruned stale refs, and confirmed that local `main`, `origin/main`, and `origin/HEAD` all resolved to merged commit `087488cabac9e4986f4d4d7f79c17c6b55cca686`. | Instrumented Git inspection output. |
| Exact time not instrumented; between 14:37:59 and 14:38:45 | The first branch command was denied when the restricted environment could not create the Git lock file. The same narrow command was retried with approved Git write access and created `codex/launch-framing` from the merged commit. | Shell error and subsequent branch/base inspection. |
| 2026-07-22 14:40:50 | Inspected the initial launch-framing diff after editing Welcome, README, metadata, manifest, and social preview copy. | Instrumented diff command output. |
| Exact time not instrumented; before 14:40:50 | A combined patch did not match one `layout.tsx` context and applied no changes. The edits were then applied as smaller file-specific patches. | Patch failure followed by the reviewed Git diff. |
| 2026-07-22 14:41:16-14:41:22 | Ran the first ESLint check. | Instrumented command start, end, and exit 0. |
| 2026-07-22 14:41:59-14:42:12 | Ran the first production build. Compilation, TypeScript, page-data collection, and generation of all 16 routes passed. | Instrumented build output and exit 0. |
| 2026-07-22 14:43:32-14:44:29 | Started a local production server on port 3103 and verified the revised Welcome content and CTA labels. The subsequent URL-wait CLI operation failed with Windows socket error 10060; the browser and server were closed. | Instrumented server, browser, failure, and cleanup output. |
| 2026-07-22 14:45:08-14:46:03 | Re-ran the browser flows with fixed waits. The primary CTA opened Quick Remember without an application API call; the demo CTA seeded five people and five encounters and opened Home; the 1200 by 630 social image rendered. | Instrumented state JSON, request count, screenshot path, and cleanup output. |
| Exact edit time not instrumented; after 14:46:03 | Visual inspection found that the final Welcome actions fell below a 624-pixel desktop browser viewport because an inline 820-pixel height overrode responsive behavior. Replaced the inline height with a dedicated responsive class. | Local screenshot inspection and reviewed CSS/component diff. |
| 2026-07-22 14:47:20-14:47:27 | Re-ran ESLint after the responsive correction. | Instrumented command output and exit 0. |
| 2026-07-22 14:47:46-14:47:59 | Re-ran the production build after the responsive correction; all 16 routes passed again. | Instrumented build output and exit 0. |
| 2026-07-22 14:48:31-14:48:57 | Verified the final Welcome slide at 390 by 653 on local port 3104. Both CTAs were fully inside the viewport without scrolling and no framework error overlay was present. The browser and server were closed. | Instrumented element bounds, screenshot path, and cleanup output. |
| 2026-07-22 14:52:12 | Created this engineering log at 14:52:12.069 and ADR-0004 at 14:52:12.547 in English. | NTFS `CreationTime` of both files. |

## Implemented changes

### Welcome and demo entry

The third Welcome slide now explains the concrete transformation: a user can provide messy details and GPT-5.6 shapes them into something useful for the next conversation.

The first-run actions now read:

- `Shape my first memory` for the direct Quick Remember path;
- `Explore a ready-made demo` for seeding the existing five-person sample and opening Home.

The demo action now uses the existing full-width secondary-button treatment. This gives it clear visual weight without making it compete with the primary action.

### Responsive Welcome height

The Welcome scroll container previously declared a fixed height inline. Inline styling prevented the narrow-screen stylesheet from adapting it to the available viewport. The height now lives in `.phone-scroll.welcome-scroll`:

- the desktop phone-frame height remains `calc(820px - 28px)`;
- viewports at or below 640 pixels use `calc(100dvh - 28px)`.

This kept the final CTA pair visible at 390 by 653 with `scrollTop` equal to zero.

### Launch-facing copy

The following surfaces now use one honest GPT-5.6 launch story:

- root README summary and Quick Remember technical description;
- default, Open Graph, and Twitter metadata;
- PWA manifest name and description;
- generated 1200 by 630 social preview;
- Open Graph alternative text.

The story describes the actual behavior: an explicitly submitted rough note is shaped into a recall card about who the person is, what mattered, and what to ask next.

### Documentation accuracy correction

The README previously said the application had “no tracking,” while the existing root layout already included Vercel Analytics. That statement was removed. The remaining privacy boundary is narrower and code-verifiable: saved people, moments, and reminders remain in browser storage, while only an explicitly submitted Quick Remember note is sent through the server-side OpenAI route.

The first-load sample instructions were also corrected. The intended path is the final Welcome slide, not Settings.

## Verification record

| Command or flow | Start (CT) | End (CT) | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run lint`, final source state | 2026-07-22 14:47:20 | 2026-07-22 14:47:27 | PASS | Exit 0; no reported ESLint errors or warnings. |
| `npm run build`, final source state | 2026-07-22 14:47:46 | 2026-07-22 14:47:59 | PASS | Next.js 16.2.2 compiled, ran TypeScript and page-data work, and generated all 16 routes. |
| Welcome content and actions | 2026-07-22 14:48:31 | 2026-07-22 14:48:57 | PASS | At 390 by 653, both actions were fully visible with no scroll and no error overlay. |
| Primary Welcome CTA | 2026-07-22 14:45:08 | 2026-07-22 14:46:03 | PASS | Opened `/remember`; Quick Remember content rendered; zero application API requests were observed. |
| Demo Welcome CTA | Same browser run | Same browser run | PASS | Opened `/`; local storage contained five people, five encounters, and completed onboarding. |
| Open Graph image | Same browser run | Same browser run | PASS | One image rendered with natural dimensions 1200 by 630 and no framework error overlay. |

One diagnostic string check reported `mentionsGPT: false` on Quick Remember because it compared case-sensitively against rendered uppercase text. The page was not changed in response to that harness artifact; the earlier visual state showed the existing `Powered by GPT-5.6` label, and the scoped requirement was CTA navigation without an API request.

## Browser evidence and limitations

Temporary screenshot paths:

- Final mobile Welcome: `C:\Users\Winnie\.agent-browser\tmp\screenshots\screenshot-1784749731326.png`
- Revised social image: `C:\Users\Winnie\.agent-browser\tmp\screenshots\screenshot-1784749558561.png`

Visual inspection confirmed that the Welcome copy and both CTA labels fit without clipping at 390 by 653, and that the generated social copy fits the 1200 by 630 image. Red rectangles and numbered labels in the Welcome screenshot came from browser element annotation, not the product UI.

These are local browser checks against a production build. They are not real-device checks, production smoke tests, Product Hunt preview checks, or durable repository evidence.

## Honest state at record creation

- The changes exist only in the local working tree on `codex/launch-framing`.
- The branch is based on merged `main` commit `087488cabac9e4986f4d4d7f79c17c6b55cca686`.
- No feature commit, push, pull request, merge, or deployment exists yet for this branch.
- GitHub Actions has not verified a commit containing these changes.
- The public Vercel deployment remains unchanged by this work.
- No production smoke test has been run for this branch.
- No OpenAI request was made during implementation or verification.
- The known public API rate-limit gap is unchanged.
- GPT-generated Prep starters and realtime voice remain deferred.

## Collaboration attribution

- User: supplied the reviewer feedback, confirmed the launch-focused direction, and authorized a new implementation branch.
- External feedback: identified the Product Hunt demo-entry advantage and the contest-story weakness around describing GPT-5.6 as optional.
- Codex: reconciled merged Git state, created the branch, implemented copy and responsive changes, ran local verification, inspected temporary screenshots, and wrote the engineering and decision records.

## Next actions

1. Review and commit the explicit implementation and documentation paths.
2. Re-run lint and the production build against the exact feature commit.
3. Add exact commit-verification evidence in a documentation-only follow-up commit.
4. Push only when requested.
5. After merge and deployment, run a minimal production UI smoke test without submitting a GPT request unless a live model check is explicitly authorized.
