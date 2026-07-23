# ADR-0007: Stabilize the Mobile Viewport Shell

## Status

Accepted, with two physical-device corrections implemented locally on 2026-07-22. The implementation preserves individual product pages and changes only the shared shell CSS plus browser-artifact hygiene.

## Context

The user reported two mobile-browser symptoms on the deployed Rehello application:

1. the bottom navigation is sometimes covered by browser chrome while vertically scrolling;
2. the interface can move sideways even though horizontal navigation is not a product interaction.

The application intentionally presents a bounded phone frame on desktop. The same shared shell is reused below 640 pixels, where it becomes the full mobile viewport. Current mobile CSS still sizes the main shell and scroll area with default `vh` units, positions the bottom navigation absolutely, and does not consume the safe-area environment variables exposed by `viewport-fit: cover`.

The production investigation found no true content-width overflow in the measured routes and widths. The horizontal symptom is therefore currently bounded as a scroll-container and overscroll problem, not a proven page-card width defect.

See [the investigation log](../engineering-log/2026-07-22-mobile-viewport-shell-investigation.md) for source lines, production measurements, tooling failures, and unverified boundaries.

## Decision drivers

- The bottom navigation must remain usable with mobile browser bars expanded or retracted.
- Installed PWA mode must respect the home indicator and display cutouts.
- Horizontal movement must not be possible when no product surface requires it.
- The desktop phone-frame presentation should remain intact.
- The correction should be centralized instead of changing every product page.
- Layout behavior should be explainable through CSS rather than a JavaScript viewport event loop.

## Decision

Refactor the shared mobile shell as a three-row CSS Grid:

1. status or top-safe-area row;
2. `minmax(0, 1fr)` scroll-content row;
3. bottom-navigation row.

For mobile widths, size the shell against the dynamic viewport, use a small-viewport fallback where appropriate, keep the bottom navigation in normal grid flow, and add top and bottom safe-area padding with `env(safe-area-inset-*)`.

Explicitly contain the horizontal axis on the document and inner scroller. The inner scroller should permit vertical scrolling only and suppress horizontal overscroll. Remove the fixed `calc(100vh - 82px)` content-height subtraction so navigation height and safe-area padding are not duplicated as magic numbers.

Desktop behavior at widths above 640 pixels should preserve the existing 390-by-820 visual phone frame.

## Alternatives considered

### A. Add only `overflow-x: hidden`

This may hide the sideways symptom but does not correct default-`vh` sizing, absolute navigation placement, dynamic browser chrome, or safe-area overlap. It is not sufficient as the complete correction.

### B. Patch each page independently

Production width measurements did not find page-specific overflow. Page-by-page changes would duplicate work and could hide the shared-shell cause. This alternative is not recommended without new element-level evidence.

### C. Move all mobile scrolling to the root document

Root scrolling could improve native browser-toolbar interaction, but it changes more layout and navigation assumptions than the bounded grid refactor. It remains a fallback if physical-device verification shows that the inner vertical scroller still creates browser-chrome instability.

### D. Track `visualViewport` with JavaScript

A JavaScript resize listener could write a custom viewport-height variable, but it adds event lifecycle, keyboard, orientation, and hydration complexity. Native `dvh`, `svh`, and safe-area environment variables should be preferred unless verified browser behavior requires a fallback.

## Expected consequences

- The bottom navigation will occupy real layout space and should not cover scroll content.
- Dynamic browser bars can change the shell height without leaving the navigation at a stale large-viewport boundary.
- Installed PWA navigation can clear the home indicator through bottom safe-area padding.
- The shared shell becomes the only primary implementation surface; product routes should not need layout-specific fixes.
- The change has broad visual impact because every main route uses `AppShell`, so multi-route and physical-device verification are mandatory.

## Required acceptance evidence

- At 320, 360, 375, 390, and 430 CSS pixels, document and content scroll widths equal their client widths on representative main routes.
- Programmatically setting horizontal scroll does not move the document or the inner scroller.
- Bottom-navigation bounds remain inside the current visual viewport at initial load and after vertical scrolling.
- iOS Safari is checked with browser bars expanded and retracted.
- Installed iOS PWA mode is checked for home-indicator clearance.
- Android Chrome is checked with browser bars expanded and retracted.
- The Remember textarea is checked with the software keyboard open.
- Desktop phone-frame behavior remains visually intact.
- ESLint and the production build pass against the exact implementation commit.

## Explicitly unverified at proposal time

- No physical iPhone, iPad, or Android device was tested.
- Headless Playwright did not emulate retractable browser chrome or iOS rubber-band physics.
- No implementation, deployment, CI run, or production smoke test exists for this proposal.

## Local implementation evidence

The accepted implementation is recorded in [the mobile viewport shell stabilization log](../engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md).

Local browser verification passed 17 geometry cases covering all seven representative routes at 390 by 653 pixels plus `/people` and `/remember` at 320, 360, 375, 390, and 430 pixels. In every case, document and inner-scroller widths matched, attempted horizontal movement remained zero, and navigation stayed inside the visual viewport before and after vertical scrolling. The desktop shell remained exactly 390 by 820 pixels.

Physical iOS Safari, installed iOS PWA, Android Chrome browser-bar behavior, and an actual software-keyboard viewport remain required manual checks. No CI, deployment, or production verification is implied by the local evidence.

## Physical-device correction - 2026-07-22

A subsequent production screenshot from a physical iPhone 14 in portrait orientation showed the shared notch, page content, and bottom navigation shifted left together on every route. That evidence corrected the earlier acceptance conclusion: the product pages were not individually too wide, but the shared document and shell could still acquire a left visual offset in physical Safari.

The decision is amended as follows:

- retain `overflow-x: hidden` on the document and the existing vertical-only inner-scroller containment;
- remove the redundant root `overflow-x: clip` declarations, which did not prevent the physical offset and can interact differently with WebKit's visual viewport;
- give `html` and `body` explicit 100% width, zero minimum width, and a zero body margin;
- give the shared stage and phone shell explicit shrink bounds;
- continue to avoid product-page-specific layout changes.

After rebuilding a stale local `.next` cache, WebKit with the iPhone 14 device descriptor passed six representative routes at a 390-by-664 visual viewport. Every available document, stage, shell, scroller, and navigation box measured from left 0 to right 390; document and scroller scroll widths matched their client widths; forced horizontal scroll remained zero. A local People screenshot with sample data showed the intended 16-pixel content inset on both sides.

This is local correction evidence only. The supplied screenshot is production evidence of the pre-correction defect; it is not evidence that the correction has been deployed. A refreshed physical-iPhone Safari check remains required after an authorized deployment. No CI, deployment, or corrected-production verification has been performed.

## Physical right-edge and cross-mobile amendment - 2026-07-22

After the first physical-device correction was merged, a second iPhone 14 Safari screenshot showed that the left edge was restored but unrelated shared elements were now clipped or crowded at the right visible edge. The user clarified that the product must adapt across phones rather than target one iPhone width.

The decision is amended again:

- the shared grid must declare its only column as `minmax(0, 1fr)` instead of relying on an implicit auto-sized column;
- shared grid rows and screen content must have explicit 100% width and maximum-width containment;
- at mobile breakpoints the stage and shell must follow viewport width with `100vw` and the supported `100dvw` refinement;
- 390 pixels remains only the desktop phone-frame width and an iPhone test point, not a mobile width constant;
- individual product pages remain out of scope unless later element-level evidence identifies a separate defect.

Local WebKit and system Chrome matrices passed all eight shared-shell routes. Home and People also passed at 320, 360, 375, 390, and 430 CSS pixels in both engines. Each current viewport width propagated through the shell grid column, scroller, content, and navigation; no descendant crossed the horizontal boundary; forced horizontal scrolling remained zero; and the desktop shell remained 390 by 820 pixels. The Chrome device gate used a Pixel 7 descriptor at 412 pixels, so this is not an iPhone-only or 390-pixel-only implementation.

This remains local browser evidence. No physical post-change phone test, push, exact-commit CI, deployment, or corrected-production smoke test has occurred. Physical Safari and Android Chrome browser bars, installed PWA safe areas, and a real software keyboard remain required acceptance boundaries.

## Stable-height and vertical-containment amendment - 2026-07-23

After the preceding shared-shell corrections, the user reported that the bottom navigation still moved vertically on some scroll gestures but not others. The current CSS explained the intermittent trigger:

- the mobile stage and shell resolved to `100dvh`, whose computed height changes when retractable browser UI changes the dynamic viewport;
- the inner vertical scroller still used the default `overscroll-behavior-y: auto`, so a gesture at its top or bottom boundary could chain beyond the scroller.

A local Chrome baseline at 390 pixels wide measured the navigation top at 584 pixels in a 664-pixel viewport. Increasing only the viewport height to 724 pixels moved the navigation top to 644 pixels: the shell and navigation followed the full 60-pixel dynamic-height change. Headless Chrome does not reproduce a physical browser toolbar animation, but this measurement confirms the CSS coupling identified by the user's report. The behavior of dynamic viewport units and scroll chaining is also documented by [MDN's viewport-length reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length) and [MDN's overscroll-behavior reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior).

The mobile-height decision is therefore amended:

- use ordered `100vh` and `100svh` sizing for the mobile stage, deliberately omitting `100dvh`;
- keep the mobile document at a fixed, non-scrolling shell boundary;
- contain vertical overscroll inside `.phone-scroll`;
- keep the three-row grid, normal-flow navigation, safe-area padding, responsive width rules, and 390-by-820 desktop frame unchanged.

This chooses a stable, always-available mobile height over stretching the application into transient space revealed while browser controls retract. It also prevents a boundary gesture in the inner scroller from becoming document scrolling. A physical Safari and Android Chrome check is still required because Playwright viewport resizing is mechanism evidence, not a reproduction of mobile browser chrome or rubber-band physics.
