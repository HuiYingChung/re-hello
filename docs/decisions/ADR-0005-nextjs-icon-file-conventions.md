# ADR-0005: Use Next.js File Conventions as the Browser Icon Source of Truth

## Metadata

- Status: Accepted and locally implemented; publication pending
- Decision date: 2026-07-22
- Exact discussion time: Not captured
- Record drafting started: 2026-07-22 15:32:12 -05:00 (instrumented command output)
- Record created: 2026-07-22 15:34:16.340 -05:00 (NTFS `CreationTime`)
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/fix-rehello-favicon`
- Branch base commit: `73db4670ceb9f09f7fb1fe6ea6e6867fb3807459`
- Decision owner: User
- Technical implementation and analysis: Codex
- Supersedes: The root layout's manually maintained `metadata.icons` configuration
- Related engineering log: [`2026-07-22-rehello-favicon-repair.md`](../engineering-log/2026-07-22-rehello-favicon-repair.md)

## Decision summary

Rehello will use Next.js App Router icon file conventions as the only source for browser tab, general browser, and Apple touch icon metadata:

- `web/src/app/favicon.ico` owns the traditional favicon;
- `web/src/app/icon.svg` owns the scalable general icon;
- `web/src/app/apple-icon.png` owns the Apple touch icon;
- `web/src/app/layout.tsx` will not define a parallel `metadata.icons` object;
- `web/src/app/manifest.ts` will continue to own installable PWA icon declarations in `web/public/`.

The stale Vercel starter favicon is replaced with a multi-size ICO derived from Rehello's existing reviewed 512-pixel brand asset. This decision changes icon delivery, not the brand design.

## Context

The deployed site returned a valid `/favicon.ico`, but the file visibly contained the default black-and-white Vercel triangle rather than Rehello's cream-and-copper identity. Other icon assets already used the correct Rehello `R` and dot, so the problem was asset and metadata consistency rather than missing brand artwork.

The root layout also declared favicon, PNG, SVG, Apple, and shortcut links manually while colocated App Router icon files existed. Local production-build verification showed that retaining any explicit `metadata.icons` value suppressed the expected `app/icon.svg` file-convention link in this Next.js 16.2.2 build. Removing individual manual entries was therefore insufficient.

The icon system has two distinct consumers:

1. browser and Apple metadata emitted into the document head;
2. PWA installation metadata returned by the web manifest.

The decision gives each consumer one clear source of truth.

## Detailed decisions

### D1. Replace the stale ICO with existing Rehello artwork

**Decision:** Build `app/favicon.ico` from `public/icon-512.png` without redesigning the mark.

**Rationale:**

- The existing PNG is already consistent with the app's visual identity.
- Reusing it avoids introducing a second, rushed brand interpretation.
- A multi-size ICO provides conventional sizes for browsers that still prefer ICO resources.

**Generated sizes:** 16, 32, 48, 64, 128, and 256 pixels.

**Determinism boundary:** The conversion used Pillow 12.2.0 from the bundled workspace Python runtime. The resulting SHA-256 is `AE94D21441B6C7AE3D77097AA48D210B7E26B2663C05201872F8860ECBCE910F`.

### D2. Let App Router file conventions generate browser icon links

**Decision:** Remove the entire `metadata.icons` block from the root layout.

**Rationale:**

- Next.js recognizes the colocated favicon, SVG icon, and Apple icon files.
- Local head inspection showed that manual metadata and file conventions did not merge as assumed.
- Removing the parallel object prevents duplicate, suppressed, or contradictory link elements.
- Next.js adds content-derived query strings to the emitted URLs, improving cache invalidation after deployment.

### D3. Add `app/apple-icon.png` as a byte-identical file-convention asset

**Decision:** Copy the existing `public/apple-touch-icon.png` to `app/apple-icon.png` without changing its bytes.

**Rationale:**

- The app file is required for the Apple touch icon file convention.
- Byte identity preserves the already-reviewed 180 by 180 artwork.
- The public file remains available at its old stable URL for backward compatibility.

Both files have SHA-256 `66C6CF51CCA66BB782642B3AD9B2782B99CA8AAA43690F097E2BD690FBAB27A1`.

### D4. Keep manifest icons independent from document-head icons

**Decision:** Leave `manifest.ts` and its `/icon-192.png`, `/icon-512.png`, and `/icon-512-maskable.png` declarations unchanged.

**Rationale:**

- PWA installation requires explicit sizes and purposes that are distinct from favicon metadata.
- The three existing public PNGs already serve that contract.
- Moving them into `app/` would not simplify the manifest and could change stable public URLs.

### D5. Verify emitted metadata, not only source files

**Decision:** Browser acceptance requires inspecting the final production build's actual link elements and fetching every emitted icon URL.

**Rationale:**

- Source presence did not predict how explicit metadata interacted with file conventions.
- A valid build can still emit an incomplete or redundant head.
- Favicon behavior is affected by framework metadata resolution and browser caches.

The accepted final head contains one favicon ICO, one scalable SVG icon, and one Apple touch PNG, with no shortcut icon or plain manually authored favicon link.

## Alternatives considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| Change only `favicon.ico` and keep all manual metadata | Rejected | Leaves two competing metadata systems and redundant icon links. |
| Remove only manual favicon, shortcut, and SVG entries | Rejected after verification | The remaining `metadata.icons` object still suppressed `app/icon.svg`. |
| Keep only a manual Apple icon entry | Rejected after verification | Even the Apple-only object still suppressed the file-convention SVG in the verified build. |
| Use only the SVG icon | Rejected | Reduces compatibility and does not replace the stale traditional ICO. |
| Generate new favicon artwork | Rejected | Existing approved Rehello artwork already solves the identity problem with less launch risk. |
| Delete the legacy public Apple PNG | Rejected | Its old URL may be cached or referenced externally; retaining it is inexpensive. |
| Move all PWA icons into `app/` | Rejected | The manifest has its own explicit public-URL contract and maskable purpose. |

## Consequences

### Positive

- The browser favicon now matches Rehello's established identity.
- Browser metadata has one framework-native source of truth.
- The scalable SVG and Apple icon are emitted automatically.
- PWA install icons remain unchanged.
- Content-derived icon URLs help invalidate stale cached metadata after a deployment.
- Future icon maintenance has an explicit ownership rule.

### Negative and accepted

- The Apple artwork exists in both `public/` and `app/`; this intentional duplication preserves a legacy URL while enabling the file convention.
- The ICO is generated binary output and cannot be meaningfully reviewed as a text diff.
- Some browsers may continue showing a cached old favicon until the tab, browser cache, or installed shortcut refreshes.
- Local verification cannot prove what production serves before merge and deployment.
- The exact cause of one black native image-viewer screenshot remains unknown; independent decode, DOM, and fresh-session visual evidence bounded it as a capture artifact.

## Implementation mapping

| Decision area | Implementation |
| --- | --- |
| Traditional favicon | `web/src/app/favicon.ico` |
| Scalable browser icon | `web/src/app/icon.svg` |
| Apple touch icon | `web/src/app/apple-icon.png` |
| Browser metadata ownership | `web/src/app/layout.tsx` |
| PWA install icons | `web/src/app/manifest.ts` and `web/public/icon-*.png` |
| Failure prevention | `lessons.md` entries L26 and L27 |
| Verification evidence | `docs/engineering-log/2026-07-22-rehello-favicon-repair.md` |

## Validation evidence

- ESLint passed on the final source from 2026-07-22 15:28:46 through 15:28:54 -05:00.
- The production build passed from 2026-07-22 15:28:48 through 15:29:01 -05:00 and generated 17 routes, including `/apple-icon.png`.
- Local browser verification from 15:29:31 through 15:29:48 found exactly one auto-generated favicon, one auto-generated SVG icon, and one auto-generated Apple icon; each returned HTTP 200.
- The manifest remained HTTP 200 and retained exactly its three intended PWA PNG entries.
- A fresh-session visual recheck from 15:30:25 through 15:30:39 showed the correct Rehello artwork at 256 by 256.

See the related engineering log for hashes, response sizes, failed intermediate metadata configurations, the screenshot artifact, and cleanup evidence.

## Unresolved items

- The implementation has not yet been committed, pushed, merged, or deployed.
- No exact-head GitHub Actions run contains this change.
- The public Vercel deployment still serves the previously deployed favicon until a new production deployment completes.
- Browser and operating-system icon caches may require a refresh after publication.
- The change has not been checked on a physical iOS device, installed PWA, or pinned home-screen shortcut.

## Revisit criteria

Review this decision if:

- a future Next.js upgrade changes icon metadata merge behavior;
- the Rehello brand mark changes;
- production head inspection does not match the verified local head;
- iOS or installed-PWA testing reveals a platform-specific icon problem;
- maintaining the byte-identical public Apple fallback becomes unnecessary.

## Amendment policy

Future icon ownership changes should append a dated amendment or create a superseding ADR. Do not rewrite this record to imply that deployment, production cache behavior, or device testing was known on 2026-07-22.

## Amendment: Local feature commit verified on 2026-07-22

The favicon implementation and initial records were committed locally as `755f59677f5e09c8688be87e5c84f1cf4adb4687` at 2026-07-22 15:37:04 -05:00.

ESLint passed against that exact commit from 15:37:16 through 15:37:22. The first production-build attempt failed from 15:37:27 through 15:37:34 because the restricted environment could not fetch the two existing Google Fonts. The unchanged commit was retried with network access and passed from 15:40:44 through 15:40:57, including compilation, TypeScript, page-data collection, and all 17 routes.

This resolves the original local-commit and exact-commit local-verification items. It does not resolve push, pull request, exact-head GitHub Actions, Vercel deployment, production smoke testing, browser-cache behavior, physical-device testing, or installed-PWA verification.
