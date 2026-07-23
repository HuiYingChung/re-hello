# Engineering Log - Bottom Navigation Height Stability

## Record metadata

- Date: 2026-07-23
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/bottom-nav-stability`
- Starting commit: `547513693f7de3c6c30d5966146b74ccce556f8f`
- Runtime implementation commit: `68fde5d`
- Push, CI, deployment, and production verification: not requested and not performed

## Authorized scope

Commit the preceding documentation work, diagnose the user's report that the bottom navigation still moved vertically on some mobile scroll gestures, implement a bounded shared-shell correction, and commit the correction. No individual product page, API behavior, Vercel state, or production deployment was authorized.

The preceding README and Vercel documentation changes were committed separately as `5475136` (`docs: clarify BYOK and deployment status`). The viewport work then moved to branch `codex/bottom-nav-stability`.

## Required preflight

- Read the repository and nested `AGENTS.md` instructions and the complete `lessons.md`.
- Read ADR-0007, the prior mobile-shell implementation record, the local Next.js 16.2.2 CSS and viewport documentation, and the applicable Next.js and Playwright working instructions.
- Reused the earlier investigation's physical-device uncertainty boundary instead of treating desktop emulation as mobile Safari or Chrome evidence.
- Baseline `npm run lint`: passed before the viewport edit.

## Diagnosis

The shared shell was already a three-row CSS Grid, and the bottom navigation was already in its own normal-flow row. The intermittent vertical movement was therefore not caused by an individual page pushing the navigation.

Two remaining shared-shell rules matched the reported trigger:

1. Mobile height resolved to `100dvh`. Dynamic viewport height changes as retractable browser controls change the visible viewport.
2. `.phone-scroll` still computed to `overscroll-behavior-y: auto`. A continued gesture at the top or bottom of the inner scroller could chain beyond that scroller.

The local Chrome baseline at 390 by 664 pixels measured:

- shell height: 664 pixels;
- navigation bounds: 584 through 664 pixels;
- inner-scroller vertical overscroll: `auto`;
- document and body scroll height: 664 pixels.

Changing only the emulated viewport height from 664 to 724 pixels changed the shell height to 724 pixels and the navigation bounds to 644 through 724 pixels. The navigation followed the full 60-pixel viewport-height delta. This is mechanism evidence for the CSS coupling, not a reproduction of a physical browser-toolbar animation.

## Implementation

Runtime commit `68fde5d` makes only the shared-shell and evidence-hygiene changes:

- adds `overscroll-behavior-y: contain` to `.phone-scroll`;
- locks mobile `html` and `body` to a non-scrolling shell boundary;
- changes the mobile stage from dynamic `100dvh` sizing to ordered `100vh` and stable `100svh` sizing;
- makes the mobile stage start-aligned and overflow-contained;
- lets `.phone-shell` consume the stable stage height;
- preserves the normal-flow navigation row, safe-area padding, responsive width rules, and 390-by-820 desktop frame;
- ignores temporary `output/playwright/` browser artifacts;
- appends the new evidence and tradeoff to ADR-0007 without rewriting the earlier decision history.

No product page component or OpenAI API route changed.

## Local browser evidence

The browser run used Playwright CLI with installed Chrome and an iPhone 14 device descriptor. It loaded built-in sample data through the Welcome UI and did not invoke a GPT action.

At a 664-pixel viewport height, `/people` and `/remember` passed at widths 320, 360, 375, 390, and 430 pixels:

- document and inner-scroller scroll widths equaled their client widths;
- forced document and inner-scroller horizontal offsets remained zero;
- shell height remained 664 pixels;
- navigation bounds remained 584 through 664 pixels after the inner scroller moved to its maximum vertical offset;
- document scroll top remained zero;
- body overflow computed to `hidden`;
- inner-scroller vertical overscroll computed to `contain`.

On `/people`, the inner scroller reached its 727-pixel maximum scroll top. A further 1,200-pixel downward wheel gesture left the inner scroll top at 727, document scroll top at zero, and navigation bounds at 584 through 664.

At a 900-by-1000 desktop viewport, the phone frame remained exactly 390 by 820 pixels. The 390-by-664 People screenshot showed the complete navigation row and no horizontal clipping. The black `N` control in the development screenshot was the Next.js development toolbar, not product UI. Playwright reported no browser console error.

## Deterministic and exact-commit verification

Before the runtime commit:

- `npm test`: passed, 2 files and 9 tests;
- `npm run lint`: passed;
- `npm run build`: passed with Next.js 16.2.2 and all 17 routes generated or classified successfully;
- the discovered built CSS contained stable `100svh` height and vertical overscroll containment and omitted mobile `100dvh` height.

Against exact runtime commit `68fde5d`:

- working tree: clean before verification;
- `git show --check --oneline --stat HEAD`: passed;
- `npm test`: passed, 2 files and 9 tests;
- `npm run lint`: passed;
- `npm run build`: passed with Next.js 16.2.2 and all 17 routes generated or classified successfully.

The browser matrix was run against the content that was then committed as `68fde5d`; it was not rerun from a production server after the commit. Exact-commit deterministic checks and pre-commit local browser evidence are intentionally reported separately.

## Failed attempts

The first development-server command used a short direct shell timeout. The wrapper timed out but left a Next.js child alive. A second start reported `EADDRINUSE`, the orphan logged `EPIPE`, and a bounded HTTP request to that broken server timed out. Recovery stopped the exact reported PID, restarted the server in a managed yielded execution cell, and separately stopped the three confirmed repository-owned child processes after browser verification. This failure is recorded as L97.

Two later Playwright CLI calls failed before browser interaction with npm `ENOTCACHED` in the restricted environment. The unchanged commands succeeded with narrowly approved network access. These failures produced no application evidence and are recorded as L98.

## Remaining acceptance boundary

- No physical iPhone, iPad, or Android device was available.
- Retractable Safari and Chrome browser controls, iOS rubber-band physics, installed PWA safe areas, and a real software keyboard remain physical-device checks.
- A stable small viewport deliberately does not stretch the application into transient pixels revealed when browser controls retract.
- No push, exact-commit CI, Vercel deployment, or production smoke test was requested or performed.
