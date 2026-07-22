# Engineering Log - Rehello Favicon Repair

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Record drafting started: 2026-07-22 15:32:12 -05:00 (instrumented command output)
- Record created: 2026-07-22 15:34:16.820 -05:00 (NTFS `CreationTime`)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/fix-rehello-favicon`
- Branch base commit: `73db4670ceb9f09f7fb1fe6ea6e6867fb3807459`
- Production URL: <https://re-hello.vercel.app/>
- Publication status at record creation: local implementation only; not committed, pushed, merged, or deployed

## Evidence and timestamp policy

This record separates the production diagnosis, local implementation, local verification, and publication state.

- A time is listed as exact only when a command, server, browser harness, or filesystem query printed it directly.
- The exact time of the initial production favicon inspection was not instrumented. It occurred before the 15:22:56 baseline lint run.
- Screenshot files are temporary local artifacts outside the repository. Their paths document the review but are not durable production evidence.
- A successful local production build and browser check does not imply that GitHub Actions or Vercel production contains this change.
- No OpenAI API request was required or made for favicon work.

## Objective

The public site returned a favicon successfully, but visual inspection showed the default black-and-white Vercel triangle rather than Rehello's existing cream-and-copper `R` mark. The objective was to restore brand consistency without redesigning the logo, breaking PWA icons, or introducing competing metadata sources.

## Scope boundaries

Included:

- replace the stale ICO with a multi-size Rehello ICO;
- inspect and simplify icon ownership in the root layout;
- preserve the existing SVG, Apple, and PWA artwork;
- verify the emitted production-build head and every emitted icon response;
- document failed metadata assumptions and the native-viewer screenshot artifact.

Explicitly excluded:

- no Product Hunt, launch-copy, Quick Remember, or `Who I met` UI changes;
- no new brand artwork;
- no manifest icon changes;
- no dependency installation;
- no push, pull request, merge, Vercel deployment, or production mutation.

## Starting diagnosis

Before implementation:

- production `/favicon.ico` returned HTTP 200 but visibly showed the Vercel starter mark;
- `web/src/app/icon.svg` already contained the Rehello identity;
- `web/public/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, and `apple-touch-icon.png` already contained matching Rehello artwork;
- `web/src/app/layout.tsx` manually declared favicon, SVG, PNG, Apple, and shortcut icon links while App Router icon files also existed;
- the old `web/src/app/favicon.ico` SHA-256 was `2B8AD2D33455A8F736FC3A8EBF8F0BDEA8848AD4C0DB48A2833BD0F9CD775932`.

The evidence identified two separate issues: a stale ICO asset and redundant icon ownership.

## Timeline

| Time (CT) | Recorded engineering event | Evidence |
| --- | --- | --- |
| Exact time not instrumented; before 15:22:56 | Inspected production and local icon assets. Confirmed that production's valid ICO was visually the Vercel starter mark while the SVG and public PNGs used Rehello artwork. | Browser and local image inspection; asset hashes. |
| 2026-07-22 15:22:56-15:23:03 | Ran baseline ESLint before editing. | Instrumented command output and exit 0. |
| 2026-07-22 15:23:36 | Converted the existing 512-pixel Rehello PNG into a six-size ICO using bundled Python and Pillow 12.2.0. | Instrumented conversion and decoder output. |
| 2026-07-22 15:23:47-15:23:54 | Ran ESLint after the first metadata simplification. | Instrumented command output and exit 0. |
| 2026-07-22 15:24:07-15:24:19 | Built the first metadata iteration; all 16 routes passed. | Instrumented Next.js 16.2.2 production build. |
| 2026-07-22 15:25:04-15:25:21 | Browser-checked the first iteration on local port 3107. The new ICO rendered correctly, but `app/icon.svg` was absent from the head. | Emitted-link JSON, HTTP checks, and screenshot. |
| 2026-07-22 15:26:07-15:26:15 | Ran ESLint after removing the manual `icons.icon` entries. | Instrumented command output and exit 0. |
| 2026-07-22 15:26:28-15:26:41 | Built the second metadata iteration; all 16 routes passed. | Instrumented production build. |
| 2026-07-22 15:27:31-15:27:48 | Browser-checked the second iteration on port 3108. An Apple-only `metadata.icons` object still suppressed `app/icon.svg`. | Emitted-link JSON and HTTP checks. |
| Exact edit time not instrumented; after 15:27:48 | Copied the existing Apple image byte-for-byte to `app/apple-icon.png` and removed the entire `metadata.icons` object. | Reviewed diff and matching SHA-256 values. |
| 2026-07-22 15:28:46-15:28:54 | Ran final-source ESLint. | Instrumented command output and exit 0. |
| 2026-07-22 15:28:48-15:29:01 | Ran the final-source production build; 17 routes passed, including `/apple-icon.png`. | Instrumented production build. |
| 2026-07-22 15:29:31-15:29:48 | Browser-checked the final head on port 3109. All three file-convention icons and the unchanged manifest returned HTTP 200. A direct ICO screenshot appeared black and was not accepted as visual evidence. | Link counts, response details, manifest JSON, screenshot, and cleanup output. |
| 2026-07-22 15:30:25-15:30:39 | Rechecked the ICO in a fresh browser session on port 3110 with a cache-busting query and two-second wait. The complete 256 by 256 image visibly showed the correct Rehello mark. | DOM natural dimensions, second screenshot, visual inspection, and cleanup output. |
| 2026-07-22 15:32:12 | Began drafting this English engineering record and ADR-0005. | Instrumented current-time output. |
| 2026-07-22 15:34:16 | Created ADR-0005 and this engineering log. | NTFS `CreationTime` of both files. |
| Exact time not instrumented; after 15:34:16 and before 15:35:06 | The first Markdown-link validator crashed on root-level `lessons.md` because `Split-Path -Parent` returned an empty string. The validator produced no link result. | PowerShell `Join-Path` error and subsequent instrumented time. |
| Completed before 2026-07-22 15:35:42 | Corrected the root-path case and verified that all relative Markdown links resolve across the four reviewed documents. | Validator PASS output followed by instrumented current time. |

## Implemented changes

### Rebuilt traditional favicon

The existing `public/icon-512.png` was converted to RGBA and encoded as one ICO containing 16, 32, 48, 64, 128, and 256-pixel entries. The output decodes as ICO, defaults to 256 by 256, and has SHA-256:

`AE94D21441B6C7AE3D77097AA48D210B7E26B2663C05201872F8860ECBCE910F`

Visual inspection shows Rehello's cream rounded tile, copper italic `R`, and copper dot.

### Replaced manual browser icon metadata with file conventions

The root layout no longer contains a `metadata.icons` object. Next.js now discovers:

- `app/favicon.ico`;
- `app/icon.svg`;
- `app/apple-icon.png`.

This avoids the verified suppression behavior and leaves the framework responsible for the corresponding head links and cache-busting query strings.

### Preserved Apple and PWA contracts

`app/apple-icon.png` is byte-identical to the existing `public/apple-touch-icon.png`; both have SHA-256:

`66C6CF51CCA66BB782642B3AD9B2782B99CA8AAA43690F097E2BD690FBAB27A1`

The public Apple path remains in place for backward compatibility. The manifest was not edited and still declares exactly `/icon-192.png`, `/icon-512.png`, and `/icon-512-maskable.png`.

## Failed attempts and recoveries

### Partial metadata removal did not restore the SVG

The first iteration removed the manual favicon, shortcut, and SVG entries while retaining the manual PNG and Apple entries. The build passed, and the ICO was correct, but the head contained no auto-generated SVG link.

The second iteration removed the general manual icon array but retained an Apple-only metadata object. The SVG was still absent. These results disproved the assumption that explicit icon metadata would merge with all colocated file conventions.

Recovery: move the Apple asset into the App Router file convention and remove the entire explicit object. This emitted all three intended icon links.

### One direct ICO screenshot was all black

The first direct screenshot after final metadata verification appeared entirely black even though the resource returned HTTP 200 and the expected 27,924 bytes. The capture was not treated as a pass or as proof of a broken ICO.

Recovery: close the session, start a fresh server and browser, use a cache-busting query, wait two seconds, inspect `complete`, `naturalWidth`, and `naturalHeight`, and take a second screenshot. The second capture visibly showed the correct icon. The exact transient capture cause remains unknown.

These failures are distilled into L26 through L28 in `lessons.md`.

The apparent L21-to-L26 gap on this branch is intentional. L22 through L25 already exist on the separate `codex/add-who-i-met-prompt` branch. Starting this independent branch at L26 avoids assigning the same append-only lesson numbers to different failures when both branches are later merged.

### The first Markdown-link validator did not handle root-level files

The first documentation validation command passed the empty parent string from root-level `lessons.md` directly to `Join-Path`. PowerShell stopped the scan before a complete result existed.

Recovery: use the resolved repository root when `Split-Path -Parent` is empty, then rerun the scan. This validation-script failure is recorded as L28; it did not identify a broken document link.

## Verification record

| Command or flow | Start (CT) | End (CT) | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run lint`, baseline | 2026-07-22 15:22:56 | 2026-07-22 15:23:03 | PASS | Exit 0 before the favicon edit. |
| ICO decode and size inspection | 2026-07-22 15:23:36 | Same command | PASS | ICO, RGBA, 256 by 256 default, six embedded sizes. |
| `npm run lint`, final source | 2026-07-22 15:28:46 | 2026-07-22 15:28:54 | PASS | Exit 0; no reported ESLint errors or warnings. |
| `npm run build`, final source | 2026-07-22 15:28:48 | 2026-07-22 15:29:01 | PASS | Next.js 16.2.2 completed compile, TypeScript, page-data work, and all 17 routes. |
| Final document-head inspection | 2026-07-22 15:29:31 | 2026-07-22 15:29:48 | PASS | Exactly one auto favicon, one auto SVG icon, one auto Apple icon, no shortcut icon, and no plain manual favicon link. |
| Final icon responses | Same browser run | Same browser run | PASS | ICO: 200, `image/x-icon`, 27,924 bytes; SVG: 200, `image/svg+xml`, 569 bytes; Apple PNG: 200, `image/png`, 2,904 bytes. |
| Manifest regression check | Same browser run | Same browser run | PASS | HTTP 200; exactly the three existing PWA PNG entries. |
| Fresh-session ICO visual recheck | 2026-07-22 15:30:25 | 2026-07-22 15:30:39 | PASS | Complete 256 by 256 image and correct Rehello artwork after a two-second wait. |
| Relative Markdown links | After 2026-07-22 15:35:06 | Before 2026-07-22 15:35:42 | PASS | All relative links resolved across the documentation index, ADR-0005, this log, and `lessons.md`. |

Final emitted icon links used Next.js content-derived query strings. The exact strings are build artifacts and are intentionally not treated as stable public API values.

## Browser evidence and limitations

Temporary screenshot paths:

- First successful ICO visual check: `C:\Users\Winnie\.agent-browser\tmp\screenshots\screenshot-1784751919236.png`
- Rejected all-black diagnostic capture: `C:\Users\Winnie\.agent-browser\tmp\screenshots\screenshot-1784752186640.png`
- Accepted fresh-session final visual recheck: `C:\Users\Winnie\.agent-browser\tmp\screenshots\screenshot-1784752237970.png`

The accepted image was visually inspected at original screenshot resolution. These files remain temporary and untracked. This is local Chromium verification, not a cross-browser, physical-device, installed-PWA, or production verification matrix.

## Honest state at record creation

- The changes exist only in the local working tree on `codex/fix-rehello-favicon`.
- The branch is based on merged `main` commit `73db4670ceb9f09f7fb1fe6ea6e6867fb3807459`.
- No feature commit, push, pull request, merge, or deployment exists yet for this branch.
- GitHub Actions has not verified a commit containing these changes.
- The public Vercel deployment remains unchanged and should be expected to show its previously deployed favicon until publication.
- Browser caches may continue showing an older favicon even after deployment.
- No OpenAI request was made during implementation or verification.
- The manifest and its three PWA icon declarations are unchanged.
- The `Who I met` prompt change belongs to a separate branch and is not included here.

## Collaboration attribution

- User: reported the favicon problem, accepted the proposed repair, and authorized implementation.
- Codex: diagnosed the asset and metadata conflict, created the isolated branch, converted the existing artwork, iterated on metadata ownership, ran local checks, visually inspected the result, and wrote the engineering and decision records.

## Next actions

1. Review and commit only the explicit favicon and documentation paths.
2. Re-run lint and the production build against the exact feature commit.
3. Add exact commit-verification evidence in a documentation-only follow-up commit.
4. Push only when requested.
5. After merge and deployment, inspect the production head and icon responses, then refresh browser cache if a stale tab icon remains.

## Subsequent committed state

- At 2026-07-22 15:37:04 -05:00, the implementation, ADR-0005, documentation index update, initial lessons, and initial version of this log were committed locally as `755f59677f5e09c8688be87e5c84f1cf4adb4687` (`fix: restore Rehello favicon`).
- ESLint ran against exact feature commit `755f59677f5e09c8688be87e5c84f1cf4adb4687` from 2026-07-22 15:37:16 through 15:37:22 -05:00 and passed with exit 0.
- The first exact-commit production build ran from 15:37:27 through 15:37:34 and failed because the restricted environment could not connect to Google Fonts for the existing Instrument Serif and Noto Sans TC imports. It reported no favicon, route, TypeScript, or other application-source error.
- The unchanged exact feature commit was rebuilt with network access from 15:40:44 through 15:40:57. Compilation, TypeScript, page-data collection, and generation of all 17 routes passed with exit 0.
- The initial restricted-network failure and successful retry are separately recorded in L29 of `lessons.md`.
- This subsequent-state addition changes documentation only. It does not change the source that passed exact-commit lint and build or the source used by the earlier local browser verification.
- The branch remains local and has not been pushed, merged, deployed, verified by GitHub Actions, or smoke-tested at the public production URL.
