# Engineering Log - Mobile Viewport Shell Investigation

## Record metadata

- Date: 2026-07-22
- Time zone: America/Chicago (UTC-05:00 on this date)
- Investigation report drafting started: 2026-07-22 17:26:41.436 -05:00
- Record expansion timestamp: 2026-07-22 17:27:59.431 -05:00
- Record created: 2026-07-22 17:29:59.536 -05:00 (NTFS `CreationTime`)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Starting branch after the user's merge and fetch: `main`
- Starting and fetched `main` commit: `14ee9db95de0733e09eea13e0ba0e84446e8fe32`
- Record branch: `codex/mobile-shell-investigation-record`
- Production URL inspected: <https://re-hello.vercel.app/>
- Production deployment SHA: not verified
- Runtime implementation status: not started

## User report and investigation objective

The user reported that mobile vertical scrolling sometimes leaves the bottom navigation covered by browser chrome and that the application can move sideways. The user asked whether the mobile layout needs a large redesign.

The investigation objective was to separate three possible causes:

1. a page element wider than the viewport;
2. an inner scroll container that still permits horizontal gesture behavior;
3. a shared-shell height and safe-area error caused by mobile browser chrome.

This was a diagnosis task. No application source, deployment, production data, or OpenAI route was changed.

## Source evidence

The following current source behavior was inspected:

- `web/src/app/globals.css:37` gives `body` a `min-height` of `100vh`.
- `web/src/app/globals.css:52` gives `.app-stage` a `min-height` of `100vh`.
- `web/src/app/globals.css:61` defines the shared `.phone-shell`.
- `web/src/app/globals.css:88-90` gives `.phone-scroll` a fixed height and only declares `overflow-y: auto`.
- `web/src/app/globals.css:105-107` absolutely positions `.bottom-nav` at `bottom: 0`.
- `web/src/app/globals.css:318` gives the mobile `.phone-shell` a `min-height` of `100vh`.
- `web/src/app/globals.css:325` sizes the main mobile scroller with `calc(100vh - 82px)`.
- `web/src/app/globals.css:329` uses `100dvh` only for the Welcome-specific scroller, producing inconsistent viewport semantics between Welcome and the main application.
- `web/src/app/layout.tsx:78` sets `viewportFit: "cover"`.
- No `safe-area-inset-top`, `safe-area-inset-bottom`, or other safe-area environment variable exists in the checked application source.
- `web/src/components/app-shell.tsx:44-52` renders a nested scroll area and an absolutely overlaid navigation sibling inside the same shell.

The CSS Values Level 4 specification defines default viewport units such as `vh` against the large viewport. It explicitly warns that content sized with those units can be obscured when retractable browser UI is expanded. WebKit's `viewport-fit: cover` guidance also requires authors to consume safe-area insets when important bottom controls extend to screen edges.

Primary references:

- <https://www.w3.org/TR/css-values-4/#viewport-relative-lengths>
- <https://webkit.org/blog/7929/designing-websites-for-iphone-x/>
- <https://developer.chrome.com/blog/whats-new-css-ui-2023#dynamic_viewport_units>

## Production browser method

- Browser: isolated headless Chrome session through Playwright CLI.
- The deployed application was inspected, not a local development server.
- The representative base viewport was 390 by 844 CSS pixels.
- Onboarding was completed only in the isolated session's localStorage.
- Built-in sample data was loaded through the visible Welcome UI, again only in isolated browser localStorage.
- No `/api/remember` request and no paid OpenAI request was made.
- Snapshot timestamps embedded by the browser tool are UTC; the converted times below use UTC-05:00.

Headless Chrome does not reproduce a physical mobile browser's retractable address bar, safe-area hardware, or iOS rubber-band animation. Its geometry proves DOM and CSS boundaries, not complete physical-device behavior.

## Production measurements

### Fully populated Home at 390 by 844

The sample-data Home state was available by 2026-07-22 17:18:56.778 -05:00.

- document client width: 390
- document scroll width: 390
- `.phone-scroll` client width: 390
- `.phone-scroll` scroll width: 390
- `.phone-scroll` client height: 762
- `.phone-scroll` scroll height: 2013
- attempted programmatic horizontal scroll to 50 pixels: remained 0
- computed `.phone-scroll` `overflow-x`: `auto`
- computed `.phone-scroll` `overflow-y`: `auto`
- computed `.phone-scroll` `overscroll-behavior-x`: `auto`
- bottom navigation bounds: top 764, bottom 844, height 80
- bottom navigation gap from the layout viewport bottom: 0
- bottom navigation bottom padding: 15.2 pixels
- elements outside the 390-pixel viewport: 0

### Seven-route matrix at 390 pixels

From 2026-07-22 17:20:05.355 through 17:20:36.477 -05:00, the following deployed routes were measured:

- `/`
- `/remember`
- `/people`
- `/prep`
- `/settings`
- `/people/rachel`
- `/people/rachel/recall`

Every route reported:

- document scroll width equal to the 390-pixel client width;
- inner scroller width equal to its 390-pixel client width;
- zero elements extending beyond the viewport;
- attempted programmatic horizontal scroll remaining at zero;
- computed horizontal overflow and horizontal overscroll behavior both `auto`;
- bottom navigation ending exactly at pixel 844 with zero viewport gap.

### Narrow-to-wide width matrix

From 2026-07-22 17:21:36.854 through 17:22:35.249 -05:00, `/people` and `/remember` were measured at 320, 360, 375, 390, and 430 CSS pixels.

At every width and route:

- document scroll width equaled document client width;
- inner scroll width equaled inner client width;
- no element crossed the right viewport boundary.

## Diagnosis

### Bottom navigation: confirmed shared-shell defect

The main mobile shell is sized with default `vh`, and the bottom navigation is anchored to the bottom of that large layout box. Default `vh` can extend behind expanded mobile browser UI. Because the navigation has zero gap from that boundary, any difference between the large layout viewport and the currently visible viewport can cover the control.

The risk is amplified by `viewport-fit: cover` without safe-area padding. In installed PWA mode, the bottom bar can also compete with the home-indicator region.

### Horizontal movement: no true width overflow reproduced

No measured route or width produced content wider than its client width. The production evidence does not support a page-specific fixed-width defect.

The shared scroller nevertheless computes to `overflow-x: auto`, `overscroll-behavior-x: auto`, and `touch-action: auto`. The most likely explanation for the reported sideways movement is a horizontally permissive inner scroll container and mobile overscroll physics. This remains an inference until physical Safari reproduction.

### Nested scrolling: plausible contributor, not independently proven

The document itself does not own the long vertical scroll; `.phone-scroll` does. Browser-toolbar expansion and retraction can respond differently around nested scrollers. This structure plausibly contributes to the user's intermittent address-bar observation, but headless Chrome cannot independently prove that interaction.

## Scope recommendation

Do not redesign every page. Perform a focused, medium-risk refactor of the shared mobile shell:

1. use a three-row CSS Grid for status, scroll content, and bottom navigation;
2. size the mobile shell with dynamic viewport units and a safe fallback;
3. keep the navigation in grid flow instead of absolutely overlaying it;
4. consume top and bottom safe-area insets;
5. explicitly contain horizontal overflow and overscroll;
6. preserve the current desktop phone-frame presentation.

A one-line `overflow-x: hidden` patch is not sufficient because it would leave the address-bar and safe-area defects unchanged.

The proposed technical decision is recorded in [ADR-0007](../decisions/ADR-0007-stabilize-mobile-viewport-shell.md). Its status remains Proposed until the next task authorizes implementation.

## Required next-task verification

- Measure the exact local implementation at 320, 360, 375, 390, and 430 pixels.
- Recheck all seven production-representative routes with sample data.
- Assert no horizontal document or inner-scroller movement.
- Assert navigation bounds against the current visual viewport before and after vertical scroll.
- Inspect narrow and desktop screenshots.
- Run a real iOS Safari check with browser bars expanded and retracted.
- Run an installed iOS PWA check for home-indicator clearance.
- Run Android Chrome with browser bars expanded and retracted.
- Open the Remember textarea and verify keyboard behavior.
- Run ESLint and the production build against the exact implementation commit.
- Keep local, CI, deployment, and production evidence separate.

## Failed attempts and recoveries

### Unhandled zero-match memory search

The first combined skill-and-memory discovery command ended with exit 1 because its final `rg` search found no relevant memory entry. The Playwright skill text was read successfully, but the composite status did not preserve that distinction.

Recovery: treat the memory result as an explicit zero-match and continue from repository evidence. L45 records the repeated prevention rule.

### Uncached Playwright CLI

The first Playwright CLI help command failed with npm `ENOTCACHED` because the package was not present in the restricted cache. No browser was opened.

Recovery: rerun the unchanged package and command with narrowly approved npm network access. L46 records the prevention rule.

### Unsupported top-level return in `run-code`

After the first measured Home snapshot at 2026-07-22 17:09:23.835 -05:00, the first geometry script failed with `SyntaxError: Unexpected token 'return'`. It produced no geometry result.

Recovery: move the measurement to the CLI's expression evaluator. L47 records the prevention rule.

### Windows native-argument quote loss

The first expression-evaluator attempt then failed with `SyntaxError: Unexpected token '*'` because quotes around `querySelectorAll("*")` did not survive the Windows native-command boundary. It produced no geometry result.

Recovery: store the complete expression in a task-specific PowerShell variable and use JavaScript single-quoted strings encoded within it. The next geometry command passed. L48 records the prevention rule.

### Untracked browser snapshots

Playwright navigation and snapshot operations created 21 untracked `.playwright-cli/page-*.yml` files because `.playwright-cli/` is not ignored. The fetched `main` branch already tracks one older snapshot file.

Recovery: close the exact browser session, enumerate only untracked files under `.playwright-cli`, verify every absolute path remains inside that directory, and remove those 21 files while preserving the tracked file. The working tree returned to clean before record creation. L49 records the prevention rule.

## Repository handoff state

- `main` and `origin/main` were both `14ee9db95de0733e09eea13e0ba0e84446e8fe32` after a successful standalone fetch.
- The investigation branch was created from that exact clean commit.
- The production measurements are evidence from the public URL, but no Vercel deployment SHA was verified.
- No runtime source, product data, environment variable, API route, OpenAI request, deployment, or production state was changed.
- The 21 untracked browser artifacts were removed; the older tracked snapshot was preserved.
- The next task should add `.playwright-cli/` to `.gitignore` and deliberately remove the tracked snapshot as part of the implementation branch.

## Record validation

At 2026-07-22 17:30:49.393 -05:00, the local documentation validator passed:

- exact four-file documentation scope;
- current-source assertions for `100vh`, the Welcome-only `100dvh` rule, absolute bottom navigation, `viewport-fit: cover`, absent safe-area variables, and the shared inner-scroller structure;
- unique and increasing lesson order with exact tail L45-L49;
- English decision and engineering records;
- relative Markdown links;
- `git diff --check`.

No lint, production build, browser rerun, CI, deployment, or production smoke test was required for this docs-only handoff commit. The runtime application remains unchanged.

## Collaboration attribution

- User: reported the mobile navigation and horizontal-gesture symptoms, challenged the layout foundation, and requested a durable handoff for a new task.
- Codex: inspected source, measured the deployed application across routes and widths, bounded confirmed causes versus inference, and prepared the proposed repair and acceptance criteria.
