# ADR-0006: Make Rehello a Mobile-First PWA Instead of a Desktop Dashboard

## Metadata

- Status: Accepted and locally documented; publication pending
- Decision date: 2026-07-22
- Exact discussion time: Not captured
- Record drafting started: 2026-07-22 16:27:12 -05:00 (instrumented command output)
- Record created: 2026-07-22 16:29:43.035 -05:00 (NTFS `CreationTime`)
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/add-readme-user-flow`
- Branch state before this decision record: `ab48efa8936d83144b2904ba2f98d944a0746e82`
- Decision owner: User
- Technical analysis and documentation: Codex
- Supersedes: None
- Related: [ADR-0004](ADR-0004-gpt56-launch-framing.md)
- Related engineering log: [`2026-07-22-mobile-first-rationale.md`](../engineering-log/2026-07-22-mobile-first-rationale.md)

## Decision summary

Rehello's current MVP will provide one phone-sized, touch-first product surface as an installable PWA. It will not develop a separate desktop dashboard or desktop-specific information architecture for this launch.

Desktop browsers remain compatible: they display the same constrained phone surface rather than being blocked. The decision is therefore mobile-first, not a claim that the web application is technically mobile-only.

This focus follows the real usage context. Rehello is most useful immediately after meeting someone, shortly before seeing them again, or at the moment the user decides to reconnect. Those moments usually happen away from a desk, while a phone is already available.

## Context

Rehello is not a contact-management database whose main job is bulk organization. Its core loop is lightweight and time-sensitive:

1. capture a few imperfect details before they fade;
2. review a compact recall card just before the next interaction;
3. set a gentle follow-up reminder while the intention is fresh;
4. prepare briefly for an event without turning the interaction into research work.

A wide desktop dashboard would create more room for tables, filters, multi-column history, and administrative controls. Those capabilities could be useful later, but optimizing around them now would pull the product toward CRM behavior and away from its promise of calm, immediate social support.

The implemented product already reflects the mobile-first direction:

- `web/src/app/globals.css` constrains the primary shell to 390 pixels on larger screens;
- below the 640-pixel breakpoint, the shell becomes full-width and removes its simulated-device border;
- `web/src/components/app-shell.tsx` uses a bottom navigation designed for thumb access;
- `web/src/app/manifest.ts` declares standalone display and portrait orientation;
- saved data remains local to the browser, reducing the setup required for a quick personal tool.

## Detailed decisions

### D1. Optimize for the moment of use, not the amount of screen space

**Decision:** Design the primary experience for short, in-context phone sessions.

**Rationale:**

- Meeting details become less reliable as time passes, so immediate capture matters more than a richer later form.
- Recall is most valuable just before a real interaction, often while commuting, waiting, or entering a venue.
- Follow-up intent is easiest to preserve when a reminder can be set at the moment the thought occurs.
- A socially anxious user benefits from a small next action more than a dense management surface.

**Consequence:** Touch targets, one-column reading order, short prompts, and low blank-page anxiety take priority over data density and simultaneous panels.

### D2. Ship one product surface for the MVP

**Decision:** Do not create a separate desktop layout, navigation model, or desktop-only feature set for the current MVP.

**Rationale:**

- One surface keeps interaction behavior and launch verification bounded during a short contest schedule.
- A second information architecture would multiply responsive states and acceptance paths without improving the primary real-world use case.
- A desktop dashboard could encourage premature expansion into bulk editing, analytics, and CRM-like workflows.

**Consequence:** Larger screens intentionally retain a narrow phone shell. This is a visible product constraint, not an unfinished responsive breakpoint.

### D3. Keep desktop access as a compatibility path

**Decision:** Do not block desktop browsers or use device detection. Let a desktop visitor use the same phone-sized web experience.

**Rationale:**

- Product Hunt judges and contributors may first open the link on a laptop.
- Browser compatibility is useful for demos, development, backup, and restoration.
- Device blocking would add failure modes without protecting the product promise.

**Consequence:** Rehello is accurately described as mobile-first rather than native-mobile or mobile-only.

### D4. Use a PWA before considering a native application

**Decision:** Retain the installable web application as the delivery format for this stage.

**Rationale:**

- A home-screen PWA supports the intended quick-return behavior without an app-store installation funnel.
- The same deployment link works for judges, testers, and users.
- Native packaging would add platform-specific build, review, permission, and release work before the core loop is validated.

**Consequence:** Native-only capabilities are not part of the current promise, and physical-device PWA behavior still requires explicit verification.

### D5. Revisit the constraint only when observed use demands it

**Decision:** Add a desktop-specific surface only when evidence shows that users need sustained organization work that cannot be handled responsibly in the current phone flow.

**Review triggers:**

- repeated demand for bulk import, editing, comparison, or export;
- long encounter histories becoming difficult to review in one column;
- accessibility testing showing that the constrained shell creates a material barrier on desktop;
- a team or shared-workspace use case replacing the current personal-memory model;
- analytics or structured research showing meaningful desktop use beyond launch evaluation.

## Alternatives considered

| Alternative | Decision | Reason |
| --- | --- | --- |
| Build independent mobile and desktop layouts now | Rejected for MVP | Doubles interaction and verification scope without serving the primary in-context use case. |
| Expand fluidly into a multi-column desktop dashboard | Rejected for MVP | Encourages record-management behavior and weakens the calm personal-tool positioning. |
| Block non-mobile devices | Rejected | Harms judges, demos, and compatibility while adding no meaningful product protection. |
| Build native iOS and Android apps first | Deferred | Adds distribution and platform overhead before the core memory loop is validated. |
| Keep one phone-sized PWA that also opens on desktop | Accepted | Matches real usage moments and keeps one coherent launch surface. |

## Accepted tradeoffs and risks

- Desktop users do not receive a layout that uses their full screen.
- Dense histories and bulk operations may become cumbersome if the dataset grows.
- A 390-pixel shell can look like a prototype to visitors unless the README explains that it is intentional.
- PWA installation, browser chrome, safe areas, and viewport behavior can vary across mobile platforms.
- The existing browser checks do not substitute for physical-device testing.
- Concentrating on mobile does not by itself prove that the interaction works well for every accessibility need.

## Documentation and implementation mapping

| Decision area | Evidence |
| --- | --- |
| Product rationale | Root `README.md`, `Why mobile first` |
| Constrained desktop shell | `web/src/app/globals.css`, `.phone-shell` |
| Full-width narrow-screen behavior | `web/src/app/globals.css`, `@media (max-width: 640px)` |
| Thumb-oriented navigation | `web/src/components/app-shell.tsx` |
| Installable portrait PWA | `web/src/app/manifest.ts` |

## Honest status

- This change documents and explains an existing mobile-first implementation; it does not add a new runtime restriction.
- No application source, responsive rule, manifest value, route, storage behavior, or deployment is changed by this ADR.
- The application remains accessible from desktop browsers.
- No physical-device, installed-PWA, cross-browser, CI, Vercel, or production verification was performed for this documentation-only change.
- Publication remains local until the branch is pushed and merged.

## Amendment policy

Future platform changes should append a dated amendment or create a superseding ADR. Do not rewrite this rationale to imply that later desktop, native, accessibility, or device-testing evidence was known on 2026-07-22.
