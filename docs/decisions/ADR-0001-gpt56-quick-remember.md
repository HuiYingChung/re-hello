# ADR-0001: Add GPT-5.6 Quick Remember Without Replacing the Existing Flow

## Metadata

- Status: Accepted for the local implementation; release pending
- Decision date: 2026-07-22
- Exact discussion time: Not captured; the decision was made before the first recorded implementation change at 2026-07-22 11:55:01 -05:00
- Record created: 2026-07-22 12:53:15 -05:00 (file CreationTime)
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Branch at record creation: `main`
- Base commit: `8eb07e1206e2157f2e238b02a2f1cb050760f00d`
- Decision owner: User
- Technical implementation and analysis: Codex
- Supersedes: None
- Related engineering log: [`2026-07-22-gpt56-quick-remember.md`](../engineering-log/2026-07-22-gpt56-quick-remember.md)

## Decision summary

Rehello will add one focused AI interaction called **Quick Remember**. A user submits a free-form note about someone they met, and a server-side GPT-5.6 request converts that note into the existing Rehello recall-card structure.

This iteration will:

1. Use the project owner's server-side OpenAI API key instead of requiring visitors to bring their own key.
2. Use `gpt-5.6-terra` through the OpenAI Responses API with strict structured output.
3. Preserve the existing nine-question Remember flow as a non-AI alternative and editing path.
4. Continue saving people and encounters in browser localStorage.
5. Send only the submitted Quick Remember note to OpenAI and disclose that boundary in the interface.
6. Configure the OpenAI key as a Sensitive Vercel environment variable for Production and Preview.
7. Use Vercel WAF rate limiting for the expensive API endpoint before adding Upstash.
8. Defer Upstash until Rehello needs durable application-level quotas, per-user limits, or usage history.

## Context

Rehello already had:

- a welcome/onboarding sequence;
- a nine-step flow for saving details about a person;
- a recall card that summarizes what the user wants to remember;
- browser-local persistence through localStorage;
- a deployed Vercel site at <https://re-hello.vercel.app/>.

The user wanted to iterate quickly for the Product Hunt OpenAI Day contest and reported approximately 14 hours remaining. The contest context made an observable GPT-5.6 interaction important, but the time constraint made a broad platform rewrite inappropriate.

The original proposal was a BYOK page. That approach would demonstrate API connectivity but would make every evaluator obtain and paste an API key before seeing the product value. It would also shift credential-management risk and setup friction to judges and visitors.

The existing recall card was already the clearest product artifact. The shortest route to an AI-native demo was therefore to use GPT-5.6 to transform an unstructured memory into that existing artifact.

## Constraints

The decision was made under the following constraints:

- The implementation needed to be usable within the same day.
- The existing opening screen and core visual language should remain intact.
- The original guided flow should not be discarded.
- OpenAI credentials must not be exposed in client JavaScript or committed to Git.
- API spending needed a bounded operational strategy.
- There was no account system or stable user identifier.
- Existing saved data lived in localStorage, not in a server database.
- The production site was already deployed and should not be broken while the local iteration was unfinished.

## Detailed decisions

### D1. Build one high-signal AI moment instead of a general AI layer

**Decision:** Add `messy note → recall card` as the primary AI interaction.

**Rationale:**

- It maps directly onto the existing product promise: remembering people and following up thoughtfully.
- It produces a visible before/after result suitable for a short contest demo.
- It reuses the existing Person, Encounter, and recall-card concepts.
- It limits implementation and evaluation scope.

**Consequence:** Other possible AI features, such as chat, automatic reminders, contact enrichment, and relationship coaching, are outside this iteration.

### D2. Do not require BYOK for the contest flow

**Decision:** Use a server-side project key for the public demo.

**Rationale:**

- Visitors can try the product immediately.
- Judges do not need an OpenAI Platform account or a disposable key.
- The product controls the model, prompt, schema, and error behavior.
- The UI can focus on the memory task rather than credential setup.

**Negative consequence:** The project owner pays for public requests and must protect the endpoint from abuse.

**Revisit when:** Rehello becomes a developer tool, supports multiple providers, or needs to avoid subsidizing user traffic.

### D3. Keep the OpenAI request server-side

**Decision:** Call OpenAI only from `POST /api/remember` in a Next.js Route Handler.

**Rationale:**

- `OPENAI_API_KEY` remains server-only.
- Input validation and output validation occur in one controlled boundary.
- The browser never receives the credential.
- The route can later add shared rate limiting or abuse detection without changing the interface contract.

**Rejected alternative:** Calling OpenAI directly from the browser. This was rejected because it would expose the project key.

### D4. Use `gpt-5.6-terra` with strict structured output

**Decision:** Use `openai.responses.parse` with a Zod schema and `gpt-5.6-terra`.

**Rationale:**

- The model satisfies the GPT-5.6 contest direction.
- Terra provides a practical intelligence/cost balance for a short extraction-and-rewrite task.
- Structured output maps directly to the existing data model.
- Schema validation prevents arbitrary prose from entering the save flow.

**Configured controls:**

- `reasoning.effort: "low"`;
- `text.verbosity: "low"`;
- `store: false`;
- maximum note length of 1,200 characters;
- maximum output token limit of 1,000;
- field-level Zod length limits;
- rejection when the model cannot identify a name;
- instruction to preserve the user's language;
- instruction to use only explicit facts and leave unknown fields empty.

**Known limitation:** A strict schema improves shape reliability but does not prove factual grounding. Broader multilingual and adversarial evaluation remains undone.

### D5. Preserve the original nine-question flow

**Decision:** Quick Remember becomes the default new-person entry, while `One question at a time` opens the original guided flow.

**Rationale:**

- The original flow remains useful for users who prefer prompts.
- It provides a manual correction path when the generated card is incomplete.
- It reduces regression risk and preserves previous product work.
- Existing-person additions continue to use the guided behavior.

**Consequence:** The Remember page now supports two capture modes and requires regression testing for both.

### D6. Keep saved relationship data local to the device

**Decision:** Continue storing Person, Encounter, and reminder data in localStorage.

**Rationale:**

- It preserves the current architecture.
- It avoids adding authentication and a database under the contest deadline.
- It minimizes the server-side personal-data footprint.

**Data boundary:**

- The submitted Quick Remember note is sent to OpenAI for processing.
- The resulting saved Person and Encounter remain in localStorage.
- The application currently has no account sync or cross-device persistence.

**Consequence:** Clearing browser storage removes saved relationship data. This is an existing product limitation, not introduced by GPT-5.6.

### D7. Use explicit review before saving generated content

**Decision:** Show the generated recall card before writing it to localStorage.

**Rationale:**

- The user can detect and correct extraction mistakes.
- `Adjust the details` transfers the draft into the guided flow.
- The model output is not silently treated as authoritative.

**Consequence:** Quick Remember requires an additional confirmation action, which is accepted in exchange for user control.

### D8. Use Vercel Sensitive Environment Variables

**Decision:** Store `OPENAI_API_KEY` in the linked Vercel project for Production and Preview, marked Sensitive. Keep local development in ignored `web/.env.local`.

**Rationale:**

- Production and Preview deployments need the server-side credential.
- Sensitive variables are non-readable after creation in the Vercel dashboard.
- Development already works through the ignored local file.
- No `NEXT_PUBLIC_` prefix is used.

**Current status:** The local project link to Vercel project `re-hello` is confirmed. The user later reported configuring the remote variable and redeploying, but the production artifact returned 404 for `/api/remember` at 2026-07-22 13:13:45 -05:00. The deployed artifact therefore could not exercise or independently confirm the remote variable.

### D9. Prefer Vercel WAF over Upstash for the first public release

**Decision:** Configure a fixed-window Vercel WAF rule for `POST /api/remember`, initially 5 requests per 60 seconds per IP with a 429 response. Do not add Upstash in this iteration.

**Rationale:**

- Vercel WAF can protect the single expensive endpoint without code changes.
- It avoids provisioning Redis and adding `@upstash/redis` and `@upstash/ratelimit` under the deadline.
- The application has no authenticated user identity, so a durable per-user quota cannot yet be implemented accurately.
- The current need is cost containment for one route, not general shared state.

**Limitations:**

- IP limits can affect users behind shared networks.
- Distributed abuse across many IP addresses can still consume API budget.
- WAF limiting is an operational control, not a complete abuse-prevention system.

**Revisit when:**

- Rehello adds authentication;
- limits must follow a user across devices or regions;
- usage records must be queried by the application;
- quotas differ by plan or user;
- the service runs outside Vercel;
- WAF observability is insufficient.

### D10. Fix lint causes instead of suppressing the rules

**Decision:** Remove synchronous state mirroring from effects and introduce an SSR-safe hydration signal. Do not disable the React lint rules.

**Rationale:**

- The errors represented avoidable cascading renders.
- URL state should have a single source of truth in Prep.
- localStorage reads need an explicit hydration boundary in a Next.js application.
- Suppression would hide the architecture issue without improving runtime behavior.

**Consequence:** Home, Recall, Prep, and AppShell changed even though those files were not part of the first GPT feature edit. Those changes were separately linted, built, and browser-tested.

## Alternatives considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| Build a BYOK settings page | Rejected for this iteration | High evaluator friction and weak product demonstration under the deadline. |
| Call OpenAI from the browser | Rejected | Would expose the project credential. |
| Replace the nine-question flow | Rejected | Removes an existing useful path and increases regression risk. |
| Return unstructured model prose | Rejected | Harder to validate and map safely into saved records. |
| Add Upstash immediately | Deferred | Adds infrastructure and dependencies before a durable application-level quota is required. |
| Disable React lint rules | Rejected | Hides the state-management problem rather than repairing it. |
| Add authentication and a server database | Deferred | Material scope expansion incompatible with the current deadline. |

## Consequences

### Positive

- Judges and visitors can experience the AI feature without credential setup.
- The AI result is directly tied to the existing product value.
- The original flow remains available.
- The key stays server-side.
- The structured contract reduces malformed output handling.
- The local-first storage model remains unchanged.
- Vercel WAF provides a fast initial cost-control layer.

### Negative and accepted risks

- The project owner funds public API traffic.
- The endpoint has no authenticated user quota.
- Rate limiting has not yet been configured in Vercel.
- The model can still misunderstand or rephrase facts incorrectly.
- The note is processed by OpenAI, so the product is not fully offline or fully device-local.
- localStorage prevents cross-device access and can be cleared by the browser.
- Adding two capture modes increases UI and test complexity.

## Cost and operational guardrails

- The user reported configuring an OpenAI spending limit of $20. This is a user-reported control and was not independently verified during implementation.
- The API route limits note and output size.
- The UI disables submission for notes shorter than 20 characters and while a request is in progress.
- Vercel WAF is the selected first-release request-rate control.
- Upstash remains available as the next control if durable quotas become necessary.
- A production smoke test should use the minimum number of live model calls needed to verify the release.

## Implementation mapping

| Decision area | Primary file or configuration |
| --- | --- |
| Server-side GPT request and schema | `web/src/app/api/remember/route.ts` |
| Quick and guided capture modes | `web/src/app/remember/page.tsx` |
| Structured client type | `web/src/lib/types.ts` |
| Local secret template | `web/.env.example` |
| Secret exclusions | `.gitignore`, `web/.gitignore` |
| Privacy disclosure | `web/src/app/settings/page.tsx`, `README.md` |
| Hydration signal | `web/src/lib/use-hydrated.ts` |
| Home localStorage rendering | `web/src/app/page.tsx` |
| Recall hydration behavior | `web/src/app/people/[id]/recall/page.tsx` |
| Prep URL state | `web/src/app/prep/prep-flow.tsx` |
| Onboarding guard | `web/src/components/app-shell.tsx` |
| Production OpenAI secret | Vercel project environment variable; pending user configuration |
| First-release request limit | Vercel WAF rule; pending user configuration |

## Validation evidence supporting this decision

- A real GPT-5.6 smoke request produced a structured Maya recall card without an observed invented detail in that example.
- The Quick Remember browser flow completed through save and the `Remembered!` state.
- The original guided flow still opened at step 1/9.
- Full ESLint completed with zero errors and zero warnings at 2026-07-22 12:39:27 -05:00.
- The network-enabled production build completed successfully at 2026-07-22 12:40:10 -05:00.
- Browser regression covered onboarding, Home, Prep, Recall, and return-to-Prep navigation without a detected Next.js error overlay.
- `git diff --check` passed at 2026-07-22 12:40:21 -05:00.
- `web/.env.local` was confirmed ignored and untracked at 2026-07-22 12:40:21 -05:00.

See the related engineering log for the distinction between instrumented command timestamps and times reconstructed from file metadata.

## Unresolved items

- The user reported configuring `OPENAI_API_KEY` in Vercel, but the value has not been exercised or independently confirmed because the deployed artifact lacks `/api/remember`.
- The Vercel WAF rule has not been confirmed or published.
- The working tree has not been committed.
- No branch or commit has been pushed.
- A Vercel redeployment was user-reported, but no preview or production deployment has been created from the local Quick Remember changes.
- No production smoke test has been run against the new implementation.
- No formal multilingual or adversarial grounding evaluation exists.
- No durable usage ledger or per-user quota exists.

## Revisit criteria

Review this decision if any of the following occurs:

- public traffic makes the server-funded API cost unacceptable;
- the OpenAI project budget is reached during normal usage;
- WAF limits produce unacceptable false positives;
- users need cross-device saved data;
- authentication is added;
- generated cards repeatedly contain unsupported facts;
- the contest requires a different GPT-5.6 model variant;
- privacy requirements prohibit sending free-form notes to OpenAI;
- the product expands beyond Vercel;
- the nine-question flow becomes unused and creates measurable maintenance cost.

## Amendment policy

Future changes should append a dated amendment or create a superseding ADR. They should not rewrite the original rationale to make later decisions appear to have been known on 2026-07-22.
