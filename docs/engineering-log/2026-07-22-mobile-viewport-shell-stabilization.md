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
