# Rehello Documentation

This directory separates current engineering evidence from historical product material.

## Information architecture

| Directory | Purpose | Authority |
| --- | --- | --- |
| [`decisions/`](decisions/) | Architecture and product decisions in ADR format, including alternatives and accepted tradeoffs. | Authoritative for why a technical or product direction was chosen. |
| [`engineering-log/`](engineering-log/) | Timestamped implementation, verification, failure, and deployment evidence. | Authoritative for what was actually done and verified. |
| [`product/`](product/) | Product scope and specifications. | Baseline product intent; update deliberately when scope changes. |
| [`research/`](research/) | User, reviewer, and model feedback used as product input. | Reference material, not an implementation contract. |
| [`prototypes/`](prototypes/) | Early standalone interface and strategy explorations. | Historical reference only; these files are not built or deployed by the current app. |
| [`../lessons.md`](../lessons.md) | Append-only failure lessons and mandatory prevention rules. | Required preflight reading through the repository-level `AGENTS.md`. |

## Current records

- [ADR-0001: Add GPT-5.6 Quick Remember Without Replacing the Existing Flow](decisions/ADR-0001-gpt56-quick-remember.md)
- [ADR-0002: Establish a Secret-Free GitHub Actions CI Baseline](decisions/ADR-0002-github-actions-ci-baseline.md)
- [ADR-0003: Add User-Authored Entry Prompts to Quick Remember](decisions/ADR-0003-quick-remember-entry-prompts.md)
- [ADR-0004: Make the GPT-5.6 Memory Transformation the Launch Story](decisions/ADR-0004-gpt56-launch-framing.md)
- [ADR-0005: Use Next.js File Conventions as the Browser Icon Source of Truth](decisions/ADR-0005-nextjs-icon-file-conventions.md)
- [ADR-0006: Make Rehello a Mobile-First PWA Instead of a Desktop Dashboard](decisions/ADR-0006-mobile-first-product-surface.md)
- [ADR-0007: Stabilize the Mobile Viewport Shell](decisions/ADR-0007-stabilize-mobile-viewport-shell.md)
- [ADR-0008: Use a Zero-API Demo and One-Request BYOK for Quick Remember](decisions/ADR-0008-byok-and-zero-api-demo.md)
- [ADR-0009: Use Password-Gated Single-User PostgreSQL Storage](decisions/ADR-0009-private-single-user-cloud-storage.md)
- [Engineering Log: GPT-5.6 Quick Remember](engineering-log/2026-07-22-gpt56-quick-remember.md)
- [Engineering Log: GitHub Actions CI Baseline](engineering-log/2026-07-22-github-actions-ci-baseline.md)
- [Engineering Log: Quick Remember Entry Prompts](engineering-log/2026-07-22-quick-remember-entry-prompts.md)
- [Engineering Log: GPT-5.6 Launch Framing and Demo Entry](engineering-log/2026-07-22-gpt56-launch-framing.md)
- [Engineering Log: Rehello Favicon Repair](engineering-log/2026-07-22-rehello-favicon-repair.md)
- [Engineering Log: README User Flow Diagram](engineering-log/2026-07-22-readme-user-flow.md)
- [Engineering Log: Mobile-First README Rationale](engineering-log/2026-07-22-mobile-first-rationale.md)
- [Engineering Log: Product Architecture and Limitations](engineering-log/2026-07-22-product-architecture-limitations.md)
- [Engineering Log: Honest Boundary Copy](engineering-log/2026-07-22-honest-boundary-copy.md)
- [Engineering Log: Mobile Viewport Shell Investigation](engineering-log/2026-07-22-mobile-viewport-shell-investigation.md)
- [Engineering Log: Bottom Navigation Height Stability](engineering-log/2026-07-23-bottom-nav-stability.md)
- [Engineering Log: BYOK and Zero-API Demo](engineering-log/2026-07-22-byok-zero-api-demo.md)
- [Engineering Log: Private Single-User Version](engineering-log/2026-07-23-private-single-user-version.md)
- [Failure Lessons and Prevention Playbook](../lessons.md)
- [MVP Specification](product/mvp-spec.md)
- [GPT Prototype Feedback](research/gpt-feedback.md)

## Source of truth

- Runtime application code lives in [`../web/`](../web/).
- The deployed behavior is determined by a committed deployment SHA and its Vercel configuration, not by prototypes or planning documents.
- The MVP specification predates Quick Remember. ADR-0001 records the accepted scope change; the specification should be revised only as a separate, explicit product decision.
- Files in `prototypes/` may contain outdated dependencies, patterns, or copy. Do not import them into `web/` without a fresh review.

## Documentation conventions

- Engineering logs and decision records are written in English.
- New failed attempts are appended to [`../lessons.md`](../lessons.md) with evidence, recovery, and a concrete next-time rule.
- Engineering logs use concrete dates, times, time zones, commands, and outcomes. Unknown timestamps must be labeled as unknown rather than reconstructed without evidence.
- ADRs are append-only in rationale: add a dated amendment or a superseding ADR instead of rewriting history.
- Temporary screenshots and browser artifacts stay untracked. Copy only intentional evidence into a future tracked `docs/evidence/` directory and document its provenance.
