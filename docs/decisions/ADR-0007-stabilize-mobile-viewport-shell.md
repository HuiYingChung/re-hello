# ADR-0007: Stabilize the Mobile Viewport Shell

## Status

Proposed on 2026-07-22. No runtime implementation has been authorized or completed in this record.

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

## Proposed decision

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
