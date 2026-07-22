# ADR-0003: Add User-Authored Entry Prompts to Quick Remember

## Metadata

- Status: Accepted and locally implemented; publication pending
- Decision date: 2026-07-22
- Exact discussion time: Not captured
- Record drafting started: 2026-07-22 14:22:27 -05:00 (instrumented command output)
- Record created: 2026-07-22 14:24:23 -05:00 (NTFS `CreationTime`)
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/remember-prompt-chips`
- Branch base commit: `222ad147473d174693a10a1d045582f7f1bacdde`
- Decision owner: User
- Technical implementation and analysis: Codex
- Supersedes: None
- Extends: [ADR-0001](ADR-0001-gpt56-quick-remember.md)
- Related engineering log: [`2026-07-22-quick-remember-entry-prompts.md`](../engineering-log/2026-07-22-quick-remember-entry-prompts.md)

## Decision summary

Quick Remember will offer three optional sentence-starter buttons before the note field and will expose the existing 20-character requirement as live interface state.

The controls will help users begin writing while preserving the core product boundary: Rehello may organize a memory, but it must not invent the memory for the user.

The selected implementation:

1. Provides `Where we met`, `What we talked about`, and `What stood out` starter buttons.
2. Inserts only labeled starter text, never synthetic personal facts.
3. Prevents duplicate insertion of an exact starter.
4. Returns focus and the caret to the textarea after insertion.
5. Counts only user-authored content toward the 20-character minimum.
6. Displays the exact number of remaining characters, then `Ready to shape` at the boundary.
7. Keeps `Try an example` only for a completely empty note.
8. Does not change the GPT-5.6 route, structured output, storage model, or privacy disclosure.

## Context

The original Quick Remember screen relied on placeholder text and a disabled primary action. A user could type a short note and see the character counter increase, but the interface did not state that 20 characters were required. The user reported not knowing what content would make `Shape my memory` available and proposed selectable prompts.

This was not primarily a model-quality problem. It was an entry-state and affordance problem:

- the blank textarea demanded recall without offering a first step;
- the disabled action did not explain its prerequisite;
- the example action replaced the entire note rather than helping the user write their own;
- the existing placeholder disappeared as soon as typing began.

The product remains under a same-day contest deadline. A small, locally testable interface change has a better risk/value ratio than adding a new conversation architecture.

## Detailed decisions

### D1. Use content-category starters instead of complete suggested memories

**Decision:** Add three buttons corresponding to information the existing recall card already uses.

**Rationale:**

- `Where we met`, `What we talked about`, and `What stood out` map directly to the existing encounter structure.
- They answer the user's immediate question about what type of information is useful.
- They are broad enough to work across professional, social, and community encounters.
- They do not require the application to guess a name, location, topic, or emotional reaction.

**Rejected alternative:** Buttons containing full sample sentences about fictional people. Those can be useful demonstrations, but they increase the risk that users edit around synthetic facts rather than recording their own memory.

### D2. Insert labels, not generated prose

**Decision:** A button inserts a short labeled starter such as `Where we met: `.

**Rationale:**

- The text makes the note self-describing when multiple prompts are used.
- GPT-5.6 can interpret the lightweight structure without a new API schema.
- The user remains responsible for every factual value after the colon.
- The behavior is deterministic, local, instant, and free of API cost.

**Consequence:** The note may look semi-structured rather than conversational. This is accepted because Quick Remember explicitly accepts messy notes.

### D3. Exclude starter labels from the minimum-content calculation

**Decision:** The inserted labels do not count toward the 20-character submission threshold.

**Rationale:**

- Two or three labels could otherwise enable the primary action without any personal content.
- The minimum exists to ensure the model receives enough user material to shape.
- Counting application-authored scaffolding would satisfy the letter of the old rule while defeating its purpose.

**Consequence:** The visible raw character counter and the eligibility calculation intentionally measure different things. The raw counter continues to enforce the 1,200-character transport limit; the status measures user-authored content eligibility.

### D4. Explain the disabled state before an error occurs

**Decision:** Show the remaining character count continuously and replace it with `Ready to shape` when eligible.

**Rationale:**

- Users should not need to click a disabled control to learn its prerequisite.
- Exact remaining counts make the boundary testable and predictable.
- Positive readiness text confirms that the interface accepted the note.

**Accessibility:** The status is connected to the textarea with `aria-describedby` and announced with a polite live region.

### D5. Restore typing focus after a starter is chosen

**Decision:** After insertion, focus the textarea and place the caret at the end.

**Rationale:**

- The expected next action is typing.
- On mobile, requiring another tap adds unnecessary friction.
- The behavior supports keyboard and pointer input without changing the note content.

### D6. Keep the full example as a blank-state escape hatch

**Decision:** Retain `Try an example`, but show it only when the note is empty.

**Rationale:**

- It remains useful for a judge or visitor who wants to understand the completed input shape quickly.
- Hiding it after the user starts prevents accidental replacement and reduces visual competition.
- The prompt buttons now serve the incremental-authoring use case.

### D7. Defer realtime voice from this branch

**Decision:** Do not add speech-to-speech conversation, microphone permissions, transcription, or audio persistence in this branch.

**Rationale:**

- Voice introduces a separate model/runtime path, session lifecycle, microphone state, interruption behavior, privacy copy, cost controls, and mobile-browser testing.
- The prompt controls directly repair the observed blocker with no new infrastructure or API call.
- The remaining contest window favors completing and publishing the focused interaction.

**Future direction:** A later optional `Talk it out` mode may transcribe a short, explicitly initiated recording into this same textarea. A full realtime social companion should be evaluated as a separate product milestone with explicit duration and cost limits.

## Alternatives considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| Keep only placeholder text | Rejected | It disappears during typing and does not explain the disabled action. |
| Keep only `Try an example` | Rejected as the sole aid | It demonstrates the feature but replaces the user's note instead of scaffolding authorship. |
| Add a multi-field form | Rejected for Quick Remember | Duplicates the existing guided flow and removes the speed advantage of the free-form mode. |
| Insert complete fictional suggestions | Rejected | Risks anchoring users to invented facts. |
| Count starter labels toward 20 characters | Rejected | Allows empty scaffolding to unlock a paid GPT request. |
| Enable the button and show an error after click | Rejected | Defers an explainable prerequisite until after failure. |
| Add full realtime voice now | Deferred | Material scope, privacy, browser, and cost expansion under the deadline. |

## Consequences

### Positive

- Users receive three concrete ways to begin.
- The disabled state explains itself.
- User-authored content remains the eligibility basis.
- The change is deterministic and incurs no API cost until the existing primary action is intentionally submitted.
- No API, schema, persistence, or deployment configuration changes are required.
- The existing guided mode remains available.

### Negative and accepted

- The prompt area adds vertical height to an already narrow mobile screen.
- Three buttons wrap across two rows in the current application shell.
- The raw character counter can be greater than the content count because inserted labels are excluded from eligibility.
- Exact-string detection is intentionally simple; manually editing a starter can make its button available again.
- This change does not solve speech input, accessibility needs beyond the scoped controls, or broader model grounding evaluation.

## Implementation mapping

| Decision area | Implementation |
| --- | --- |
| Prompt definitions | `QUICK_MEMORY_PROMPTS` in `web/src/app/remember/page.tsx` |
| User-content length | `getQuickMemoryContentLength` |
| Deterministic insertion and focus | `addQuickMemoryPrompt` |
| Live eligibility state | `charactersNeeded` and `canShape` in Quick Remember render state |
| Accessibility | Prompt group label, textarea description, and polite live status |
| Blank-only example | Conditional `Try an example` action |

## Validation evidence

- ESLint passed at 2026-07-22 14:08:54 -05:00.
- The network-enabled Next.js production build passed at 2026-07-22 14:09:27 -05:00.
- A local production-server browser run passed from 2026-07-22 14:21:10 through 14:21:52 -05:00.
- The browser verified the empty, starter-only, 19-user-character, and 20-user-character states.
- The starter-only state preserved the full 20-character requirement and returned focus to the textarea.
- The 19-character state kept the action disabled; the 20-character state enabled it.
- No framework error overlay was detected on Remember or Home.
- No GPT or other application API request was made during this verification.

See the related engineering log for failed environment/CLI attempts, exact captured output, cleanup evidence, and screenshot limitations.

## Unresolved items

- The local feature has not yet been committed or pushed.
- No exact-head GitHub Actions run exists for the feature.
- No Vercel deployment or production smoke test contains this interface change.
- The known rate-limit gap on the server-funded GPT endpoint remains unresolved.
- A real-device mobile check has not been performed.
- Speech input and realtime conversation remain deferred.

## Revisit criteria

Review this decision if:

- users repeatedly ignore or misunderstand the starters;
- the added vertical height measurably reduces completion;
- users expect a starter to be removable as a toggle;
- raw and user-content character counts cause confusion;
- multilingual starter copy becomes a product requirement;
- short-note model quality shows that 20 user-authored characters are insufficient;
- a speech-to-text mode is approved and must share the same eligibility rules.

## Amendment policy

Future changes should append a dated amendment or create a superseding ADR. Do not rewrite this rationale to imply that later voice, multilingual, deployment, or analytics decisions were known on 2026-07-22.
