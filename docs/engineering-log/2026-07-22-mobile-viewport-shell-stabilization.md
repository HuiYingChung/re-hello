# Engineering Log - Mobile Viewport Shell Stabilization

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/mobile-shell-investigation-record`
- Starting commit: `d2b594f`
- Implementation commit: `7e97de4ae605994ed08ceb2bc3ed7f97a7be351c`
- CI, deployment, and production verification: not requested and not performed

## Authorized scope

Implement the shared-shell decision proposed by ADR-0007 without redesigning individual product pages. Verification must distinguish deterministic local checks, local browser evidence, physical-device evidence, exact-commit CI, deployment, and production behavior.

## Preflight and baseline

- Read the repository and nested `AGENTS.md` files, `lessons.md` through L49, the mobile viewport investigation, ADR-0007, the local Next.js 16.2.2 CSS and viewport documentation, and the applicable Next.js and Playwright working instructions.
- Confirmed branch `codex/mobile-shell-investigation-record` and a clean starting working tree.
- Baseline `npm run lint`: passed.
- Baseline network-enabled `npm run build`: passed with Next.js 16.2.2 and all 17 routes generated or classified successfully.

## Implementation

- Converted `.phone-shell` to a three-row grid for status, `minmax(0, 1fr)` scroll content, and bottom navigation.
- Preserved the desktop shell at 390 by 820 pixels.
- Replaced mobile `calc(100vh - 82px)` sizing with ordered `100vh`, `100svh`, and `100dvh` shell sizing.
- Moved bottom navigation from absolute positioning into grid flow.
- Applied top and bottom safe-area environment insets on mobile.
- Contained document and inner-scroller horizontal overflow and overscroll, and limited the inner scroller to vertical pan gestures.
- Removed the obsolete overlay-compensation bottom padding from shared screen content.
- Added `.playwright-cli/` to `.gitignore` and removed the previously tracked session snapshot identified by the investigation handoff.
- No individual product page component was changed.

## Local deterministic verification

- Post-change CSS contract assertions: passed.
- Post-change `npm run lint`: passed.
- Post-change network-enabled `npm run build`: passed with all 17 routes generated or classified successfully.

## Failed attempt: strict Welcome snapshot parser

The first self-contained browser matrix opened the local application and passed the `document.title` grammar probe. After the fresh-snapshot `Skip` action, the harness failed to extract the `Explore a ready-made demo` ref and stopped before loading sample data or running geometry measurements.

The fresh snapshot proved the button existed as `button "Explore a ready-made demo" [active] [ref=e40]`. The parser had assumed the ref immediately followed the accessible name and did not allow the optional `active` state attribute. Browser and exact-listener cleanup completed with `LISTENER_REMAINS=False`, so the failure left no server running.

Recovery changed the parser to accept variable same-line snapshot metadata. A standalone check against the captured snapshot returned `RECOVERED_REF=e40`. This tooling failure produced no application evidence and is recorded as L50 in `lessons.md`.

## Local browser geometry evidence

The corrected self-contained browser run loaded sample data through the Welcome UI and made no model action. It passed 17 of 17 geometry cases:

- all seven representative routes at 390 by 653 pixels;
- `/people` and `/remember` at widths 320, 360, 375, 390, and 430 pixels, each at 653 pixels tall;
- document and inner-scroller scroll width equaled client width in every case;
- attempted document and inner-scroller horizontal scroll remained zero;
- computed inner-scroller behavior was `overflow-x: hidden`, `overscroll-behavior-x: none`, and `touch-action: pan-y`;
- bottom navigation remained within the 653-pixel visual viewport at initial load and after the inner scroller moved to its maximum vertical offset;
- desktop verification at 1280 by 900 pixels measured the shared phone shell at exactly 390 by 820 pixels.

The run created mobile and desktop screenshots before the later harness failure. Visual inspection is pending. Cleanup reported `LISTENER_REMAINS=False`.

## Failed attempt: narrow Playwright ref grammar

After all geometry and desktop assertions passed, the same run stopped while locating the Remember textarea for a focused-input check. The fresh snapshot showed `textbox "What you remember" [active] [ref=f20e39]`, but the parser accepted only the short `e39` ref shape seen earlier.

The ref parser was corrected to capture the entire bracketed token and treat it as opaque. A standalone recovery check returned `RECOVERED_TEXTAREA_REF=f20e39`. The failure did not contradict the completed geometry evidence and is recorded as L51 in `lessons.md`.

## Focused-input and request evidence

A scoped follow-up reused a fresh snapshot and the opaque-ref parser. It found textarea ref `f1e39`, clicked it, and confirmed:

- active element tag: `TEXTAREA`;
- bottom navigation bounds: 573 through 653 pixels;
- visual viewport bounds: 0 through 653 pixels;
- navigation remained inside the visual viewport;
- `/api/remember` request count: zero;
- listener remaining on isolated port 3174 after cleanup: false.

Headless Chrome did not open a real mobile software keyboard. This result proves focused-input layout at the tested visual viewport, not physical keyboard resize or overlay behavior.

## Screenshot inspection

- The 390-by-653 `/people` screenshot showed full-width content with no horizontal clipping artifact and the complete navigation row visible at the viewport bottom.
- The 1280-by-900 screenshot showed the existing rounded 390-by-820 desktop phone frame, with the scrolled content and navigation separated into their grid rows.
- Next.js development-tool controls were outside the application shell and were not treated as product UI.

## Unverified boundaries

- No physical iPhone, iPad, or Android device was available in this local run.
- Retractable Safari or Chrome browser bars, iOS rubber-band physics, display cutouts, home-indicator clearance, installed PWA mode, and a real software keyboard remain manual-device acceptance items.
- No CI workflow, push, Vercel deployment, or production smoke test was requested or performed.

## Exact implementation commit verification

Commit `7e97de4ae605994ed08ceb2bc3ed7f97a7be351c` (`fix: stabilize mobile viewport shell`) contains the runtime CSS change, ADR acceptance, browser-artifact cleanup, failure lessons, and this implementation record as it stood before exact-commit verification.

Against that exact commit:

- working tree before verification: clean;
- `git show --check --oneline --stat HEAD`: passed;
- `npm run lint`: passed;
- network-enabled `npm run build`: passed with Next.js 16.2.2;
- production build route result: all 17 routes generated or classified successfully.

Publication state remains local only. The commit was not pushed, checked by CI, deployed, or tested in production.

## Physical iPhone 14 correction

### New production evidence

After the initial local implementation and WebKit checks, the user supplied a Safari screenshot from a physical iPhone 14 in portrait orientation and confirmed the issue affected every page. The screenshot showed the shared notch, page content, and bottom navigation shifted left together while Safari chrome remained aligned. This corrected the earlier acceptance conclusion and localized the remaining defect to the shared document/shell boundary rather than any People-page card or individual product layout.

A read-only production CSS fetch confirmed that the deployed page already contained the initial grid shell, dynamic viewport, safe-area, and vertical-touch rules. That fetch establishes only the CSS version that exhibited the defect; it does not establish the corrected behavior.

### Corrected shared-shell implementation

- Removed the redundant `overflow-x: clip` declarations from `html` and `body` while retaining `overflow-x: hidden` and horizontal overscroll suppression.
- Added explicit 100% width and zero minimum width to `html` and `body`.
- Added an explicit zero body margin instead of relying only on framework preflight.
- Added explicit width/min-width bounds to the shared stage and min/max-width bounds to the phone shell.
- Preserved the three-row grid, dynamic viewport sizing, safe-area rules, inner vertical scroller, bottom-navigation flow, desktop frame, and every individual product page component.

This is a conservative root-boundary correction for physical WebKit. It does not claim that headless WebKit reproduced the physical offset.

### Browser-tool corrections

The first alleged iPhone result was discarded after its device gate revealed Windows HeadlessChrome at 1280 by 720 and DPR 1; the installed CLI had ignored a configuration file placed at the wrong default path. The corrected gate used explicit WebKit and iPhone 14 settings and reported a 390 by 664 inner viewport, a 390 by 844 screen, DPR 3, and an iPhone Safari user agent.

Several later attempts produced no application evidence: missing WebKit installation, uncached or unavailable CLI forms, daemon permission failures, invalid CLI grammar, a 124-second many-process matrix timeout, an expired dev server, stale Next child processes, a non-hydrated `127.0.0.1` development origin, and stale `.next` CSS. A final status probe also repeated an invalid PowerShell `foreach` pipeline before its corrected rerun. Every attempt, evidence, recovery, and prevention rule is recorded as L52-L65 in `lessons.md`.

Direct stylesheet inspection proved the stale server was still returning the old `calc(100vh - 82px)` and absolute navigation rules. After stopping the exact repo-owned Next child processes and removing only the validated untracked `web/.next`, a fresh port-3184 server returned the current grid, root-hidden, and zero-body-margin rules and omitted root clip and the old height calculation.

### Corrected local verification

- Baseline before the correction: `npm run lint` passed.
- Corrected CSS contract assertions: passed.
- Corrected `npm run lint`: passed.
- Corrected `npm run build`: passed with Next.js 16.2.2 and all 17 routes generated or classified successfully.
- A single-process WebKit matrix used the installed iPhone 14 device descriptor and local sample data without making an OpenAI request.
- Routes `/`, `/remember`, `/people`, `/prep`, `/settings`, and `/welcome` all measured a 390-by-664 inner/visual viewport, 390-by-844 screen, and DPR 3.
- On every route, `html`, `body`, `.app-stage`, `.phone-shell`, and `.phone-scroll` measured from left 0 to right 390. The bottom navigation did the same on every route where it exists.
- Document, body, shell, and inner-scroller scroll widths equaled their client widths. Attempts to set document and scroller horizontal offsets to 40 ended at zero.
- Computed root and body width was 390 pixels, minimum width was zero, root/body horizontal overflow was hidden, and body margin was zero.
- Visual inspection of the generated People screenshot with Rachel and Sarah data showed the complete left edge and the intended 16-pixel content inset. The black `N` control was the Next.js development toolbar and not product UI.
- No browser console error was emitted during the successful matrix.
- The local dev listener was stopped after verification.

### Remaining acceptance boundary

The corrected code has not been pushed, checked by exact-commit CI, deployed, or rechecked on the user's physical iPhone. The original screenshot remains production evidence of the defect, not of the correction. Safari browser-bar transitions, installed PWA mode, Android Chrome, and a real software keyboard also remain unverified after this correction.

## Physical right-edge correction and cross-mobile widening

### New physical evidence

After the root-offset correction was merged, the user supplied a second physical iPhone 14 Safari screenshot in portrait orientation. The left inset was present, but the shared settings control, second primary action, review card, Recent people controls, person card, and bottom navigation all extended toward or beyond the right visible edge. The user also clarified that acceptance is for phones generally, not only iPhone 14.

The second screenshot supersedes the prior physical acceptance conclusion. It does not support redesigning the Home page or its cards individually because unrelated elements in every shared row move to the same right boundary.

### Bounded diagnosis

Fresh local WebKit baseline geometry still measured the 390-pixel shell, scroller, screen content, cards, and navigation inside a 390-pixel visual viewport. That baseline did not reproduce physical Safari's crop, so it is not evidence that the pre-change CSS was correct on the device.

The baseline did expose two shared CSS contract gaps:

- `.phone-shell` declared grid rows but left its only column implicit instead of constraining it with `minmax(0, 1fr)`;
- `.phone-status`, `.phone-scroll`, `.screen-content`, and `.bottom-nav` depended on automatic grid stretching and did not all declare explicit 100% width and maximum-width bounds.

With a physical WebKit layout or font-metric difference, an implicit grid column can become wider than the shell while `.phone-shell { overflow: hidden; }` clips the excess. This is the most bounded current diagnosis; the headless engines did not reproduce the original physical failure.

### Shared implementation

- Added `grid-template-columns: minmax(0, 1fr)` to the shared phone shell.
- Bound the status row, inner scroller, shared screen content, and bottom navigation to `width: 100%`, `min-width: 0` where applicable, and `max-width: 100%`.
- Bound the mobile stage and shell to `100vw`, with `100dvw` used when supported.
- Retained the dynamic-height, safe-area, vertical-scroll, horizontal-containment, and desktop-frame decisions already accepted by ADR-0007.
- Did not change any individual product page component.
- Did not hard-code the mobile application to 390 pixels; the shell follows the current viewport through at least the tested 320-430 pixel range.

### Local deterministic and production-build checks

- Clean merged-tree baseline `npm run lint`: passed before the new CSS edit.
- Post-change source CSS contract: passed for the bounded grid column, scroller width, screen-content width, navigation width, and `100vw`/`100dvw` mobile rules.
- Post-artifact-cleanup `npm run lint`: passed.
- `npm run build`: passed with Next.js 16.2.2; all 17 routes were generated or classified successfully.
- The built CSS under the discovered `.next/static/chunks` tree contained the bounded grid column, dynamic viewport width, scroller width, and screen-content width markers.

### Cross-engine mobile browser evidence

The final matrices loaded built-in sample data only through the Welcome UI and made zero `/api/remember` requests.

WebKit used the installed iPhone 14 descriptor and passed its device gate at a 390 by 664 visual viewport, 390 by 844 screen, and DPR 3. System Google Chrome used the Pixel 7 descriptor and passed its gate at a 412 by 839 visual viewport, 412 by 915 screen, and DPR 2.625.

For both engines:

- routes `/`, `/remember`, `/people`, `/prep`, `/settings`, `/people/rachel`, `/people/rachel/recall`, and `/welcome` passed;
- Home and People passed at 320, 360, 375, 390, and 430 CSS pixels;
- document client and scroll widths equaled the current viewport width;
- shell, grid column, scroller, screen content when present, and navigation when present ended at the current viewport width;
- no shared-shell descendant crossed the left or right boundary;
- forced document and inner-scroller horizontal offsets remained zero;
- bottom navigation stayed inside the visual viewport before and after maximum vertical scroll;
- the desktop phone shell remained 390 by 820 pixels;
- no browser console error was emitted.

Visual inspection of the final iPhone 14 and Pixel 7 Home screenshots showed complete settings, action, card, section-control, and bottom-navigation right edges with balanced content insets. The black `N` control was the Next.js development toolbar, not product UI. The temporary scripts, screenshots, and CLI session files were removed after inspection.

### Failed verification attempts

No failed tool attempt was counted as application evidence. The recorded failures included stale or expired Next dev children, intermittent CLI package-cache failures, Windows long-expression argument splitting, sandbox `spawn EPERM`, an exact URL wait, an optional-Welcome-region assumption, denied default process inspection, a missing bundled Chromium binary, a temporary-harness lint error, a fail-fast parallel wrapper, an obsolete built-CSS directory guess, a misplaced lesson-detail append, an unexpected untracked help-output file caused by argument splitting, and a wildcard-based Git status misclassification. Their evidence, recovery, and prevention rules are recorded as L67-L78 in `lessons.md`.

### Remaining acceptance boundary

This second correction is local branch evidence only. It has not been pushed, checked by exact-commit CI, deployed, or rechecked on the user's physical iPhone or any physical Android phone. The new screenshot is production evidence of the merged pre-correction defect, not evidence of the local fix. Retractable browser bars, installed PWA mode, safe-area hardware, and a real software keyboard still require physical-device acceptance after an authorized deployment.
