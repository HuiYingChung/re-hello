# ADR-0004: Make the GPT-5.6 Memory Transformation the Launch Story

## Metadata

- Status: Accepted and locally implemented; publication pending
- Decision date: 2026-07-22
- Exact discussion time: Not captured
- Record drafting started: 2026-07-22 14:50:02 -05:00 (instrumented command output)
- Record created: 2026-07-22 14:52:12.547 -05:00 (NTFS `CreationTime`)
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch: `codex/launch-framing`
- Branch base commit: `087488cabac9e4986f4d4d7f79c17c6b55cca686`
- Decision owner: User
- Technical implementation and analysis: Codex
- Supersedes: None
- Extends: [ADR-0001](ADR-0001-gpt56-quick-remember.md)
- Related engineering log: [`2026-07-22-gpt56-launch-framing.md`](../engineering-log/2026-07-22-gpt56-launch-framing.md)

## Decision summary

Rehello will present its existing GPT-5.6 Quick Remember transformation as the signature launch moment and will make the existing ready-made demo a prominent first-run choice.

For this launch branch, the product will not add a second GPT surface to Prep and will not add realtime voice. The accepted strategy is to make the strongest completed interaction immediately understandable, testable, and visible across Welcome, social metadata, and repository documentation.

The implementation will:

1. state that GPT-5.6 shapes messy remembered details into a useful recall card;
2. call the first Welcome action `Shape my first memory`;
3. present `Explore a ready-made demo` as a full-width secondary action;
4. keep both actions visible on a narrow mobile viewport;
5. align title, description, PWA, social image, and README language;
6. preserve the existing explicit-submit privacy boundary;
7. defer new model routes and voice until after the launch-critical surface is stable.

## Context

The contest is explicitly centered on building with GPT-5.6. Rehello already uses GPT-5.6 Terra for a concrete transformation, but its repository description called Quick Remember optional and led with a general local-first memory product. That framing made the model appear replaceable even though Quick Remember is the clearest launch demonstration: a rough note becomes structured, immediately useful recall material.

At the same time, Rehello's first-run sample experience existed but was visually understated. A Product Hunt visitor who did not want to enter personal data could overlook the sample action and arrive at an empty state. Because the contest is leaderboard-based and mobile traffic is important, the time-to-understanding and time-to-demo are launch-critical.

The remaining schedule favored a focused communication and onboarding change over expanding architecture. Adding GPT generation to Prep would be technically feasible, but it would also introduce another server contract, additional personal-history transmission, model failure states, rate-limit exposure, and test scope. Realtime voice would introduce substantially more product and privacy state.

## Detailed decisions

### D1. Treat Quick Remember as the signature AI interaction

**Decision:** Lead with the transformation from rough memory to recall card instead of counting or multiplying AI endpoints.

**Rationale:**

- Contest relevance depends on whether GPT-5.6 performs meaningful product work, not on the number of routes that call it.
- Quick Remember already turns unstructured personal context into a structured and actionable social aid.
- The input and output can be understood in one short demo.
- Reframing the completed interaction has lower launch risk than adding a new one.

**Consequence:** Other deterministic parts of Rehello remain valuable but are not presented as separate AI features.

### D2. Make the demo an explicit onboarding choice

**Decision:** Promote sample data to a full-width secondary action on the final Welcome slide.

**Rationale:**

- A visitor can inspect a meaningful populated product without entering private information.
- The option is available before the user encounters an empty Home screen.
- Secondary styling preserves the direct Quick Remember path as the recommended first action while making the alternative unmistakable.

**Rejected alternative:** Automatically seed every first visit. That would blur the boundary between sample and user data and could make the application feel pre-populated without consent.

### D3. Name the primary action after the model-supported outcome

**Decision:** Use `Shape my first memory` rather than `Remember my first person`.

**Rationale:**

- `Shape` connects directly to the Quick Remember action and to GPT-5.6's actual role.
- `First memory` accurately describes the note-to-card interaction reached by the button.
- The label helps a contest visitor anticipate the next screen before tapping.

### D4. Put the final Welcome actions inside the mobile viewport

**Decision:** Move the Welcome height from an inline fixed value to a responsive CSS class using dynamic viewport height on narrow screens.

**Rationale:**

- The promoted demo action has no value if it is below the first visible screen.
- An inline fixed height prevented the existing responsive stylesheet from adapting the Welcome view.
- `100dvh` follows the current mobile visual viewport more closely than a fixed 820-pixel shell.

**Accepted limitation:** This is a browser viewport check, not verification on every device or browser chrome configuration.

### D5. Synchronize launch copy across discovery surfaces

**Decision:** Use the same GPT-5.6 transformation in README, metadata, manifest, and generated social preview.

**Rationale:**

- Product Hunt and social visitors may encounter the title or image before the application.
- Consistent copy reduces the gap between contest claim and observed first-run experience.
- Each surface describes a behavior already implemented by the server route.

**Copy boundary:** Do not claim autonomous relationship management, continuous memory, realtime companionship, or broader model use than the application provides.

### D6. Preserve the local-first privacy boundary without claiming no analytics

**Decision:** State that saved people, moments, and reminders remain in browser storage, and that only an explicitly submitted Quick Remember note goes through the server-side OpenAI route. Remove the blanket `no tracking` statement.

**Rationale:**

- The existing application includes Vercel Analytics, so `no tracking` was not code-verifiable.
- A precise data-path statement is more useful and honest than a broad privacy slogan.
- The launch framing should not overstate either model access or privacy properties.

### D7. Defer GPT-generated Prep starters

**Decision:** Keep the current deterministic Prep topic mining for this branch.

**Rationale:**

- Sending stored encounter history to a new server route expands the personal-data boundary.
- The feature would need prompt design, structured output, loading and failure states, rate limiting, cost controls, privacy copy, and new browser coverage.
- It risks destabilizing a product whose strongest demo loop already exists.
- A rushed second endpoint would not automatically make the first endpoint feel more essential.

**Revisit condition:** Consider a separately scoped Prep enhancement after launch if user testing shows that mined topics are insufficient and the data-sharing, cost, and failure behavior can be made explicit.

### D8. Defer realtime voice and a “social best friend” mode

**Decision:** Do not add realtime audio to this launch branch.

**Rationale:**

- Voice adds microphone permission, session lifecycle, interruption handling, latency, browser compatibility, audio privacy, and materially different cost behavior.
- “Social best friend” changes the product promise from memory support to active companionship and deserves deliberate safety and retention decisions.
- The remaining deadline is better spent stabilizing and presenting the current core.

**Future direction:** A bounded, explicitly initiated `Talk it out` capture mode could later transcribe into the existing Quick Remember note. That is smaller and easier to explain than an always-available realtime companion.

## Alternatives considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| Add GPT-generated conversation starters to Prep immediately | Deferred | Meaningful new route, personal-data, cost, failure-state, and verification scope under the launch deadline. |
| Add full realtime voice immediately | Deferred | Material permission, session, privacy, latency, mobile-browser, and cost expansion. |
| Leave GPT-5.6 as an optional README detail | Rejected | Undersells the implemented transformation and weakens the contest narrative. |
| Automatically seed sample data | Rejected | Removes explicit user choice and can confuse sample content with personal content. |
| Keep the sample action as a quiet text link | Rejected | Too easy for a first-time visitor to miss. |
| Make sample data the primary action | Rejected | The user-authored GPT flow should remain the main product promise. |
| Claim that all Rehello behavior is AI-powered | Rejected | Inaccurate; most recall, persistence, reminders, and topic mining remain local and deterministic. |
| Remove local-first language entirely | Rejected | The storage and explicit-submit boundaries are real product properties worth preserving. |

## Consequences

### Positive

- The contest story maps to an existing, inspectable model transformation.
- First-time visitors can choose either the core GPT flow or a populated demonstration on the final Welcome screen.
- The mobile viewport no longer hides the final action pair in the verified size.
- Social and install surfaces reinforce the same value proposition.
- No new server, model, persistence, or deployment configuration is introduced.
- Verification can avoid paid model requests.

### Negative and accepted

- The launch tagline is more contest-specific and less timeless than the original `A gentle place for the people you meet` line.
- The final Welcome slide contains a denser explanation than before.
- The sample CTA has greater visual weight and may divert some users from entering their own first memory.
- Rehello still has only one GPT-backed route; the decision is that the route's product role matters more than route count.
- This change does not resolve model quality evaluation, public endpoint rate limiting, or production publication.
- `100dvh` behavior can still vary with older mobile browsers and embedded webviews.

## Implementation mapping

| Decision area | Implementation |
| --- | --- |
| Welcome transformation copy and CTA labels | `web/src/app/welcome/page.tsx` |
| Responsive Welcome viewport height | `web/src/app/globals.css` and `web/src/app/welcome/page.tsx` |
| Page, Open Graph, and Twitter metadata | `web/src/app/layout.tsx` |
| PWA launch copy | `web/src/app/manifest.ts` |
| Generated social card | `web/src/app/opengraph-image.tsx` |
| Repository positioning and privacy correction | `README.md` |
| Evidence and decision index | `docs/engineering-log/2026-07-22-gpt56-launch-framing.md` and `docs/README.md` |

## Validation evidence

- Final-source ESLint passed from 2026-07-22 14:47:20 through 14:47:27 -05:00.
- The final-source production build passed from 2026-07-22 14:47:46 through 14:47:59 -05:00 and generated all 16 routes.
- The final Welcome slide passed local browser verification at 390 by 653 from 14:48:31 through 14:48:57 -05:00.
- The primary CTA opened Quick Remember without generating an application API request.
- The demo CTA created the existing five-person, five-encounter sample and opened Home.
- The social image rendered at 1200 by 630 without a framework error overlay.
- No OpenAI request was made during validation.

See the related engineering log for the failed branch lock, patch-context failure, URL-wait socket error, exact browser bounds, cleanup evidence, and temporary screenshot limitations.

## Unresolved items

- The local implementation has not yet been committed or pushed.
- No exact-head GitHub Actions run exists for the change.
- No Vercel deployment or production smoke test contains the change.
- The public API rate-limit gap remains unresolved.
- The Product Hunt card has not been previewed on Product Hunt itself.
- A real physical mobile device has not been checked.
- GPT-generated Prep assistance and voice remain deferred.

## Revisit criteria

Review this decision if:

- contest reviewers still describe GPT-5.6 as incidental after seeing the revised demo;
- users prefer the original non-technical product framing;
- the sample-data action materially reduces user-authored Quick Remember starts;
- first-run viewport analytics or real-device testing shows CTA clipping;
- Prep topic mining fails to create useful follow-up prompts;
- privacy and cost controls are approved for additional model-backed features;
- a bounded speech-capture workflow can be tested separately from realtime companionship.

## Amendment policy

Future changes should append a dated amendment or create a superseding ADR. Do not rewrite this record to imply that later AI features, voice behavior, publication, rate limits, or production results were known on 2026-07-22.
