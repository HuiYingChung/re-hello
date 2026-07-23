# ADR-0008: Use a Zero-API Demo and One-Request BYOK for Quick Remember

- **Status:** Accepted
- **Date:** 2026-07-22
- **Decision owners:** Winnie and Codex
- **Scope:** Quick Remember demo behavior, OpenAI credential ownership, request handling, analytics boundary, and automated verification
- **Supersedes:** ADR-0001 decisions D1, D8, and the owner-API-cost rationale in D9

## Context

ADR-0001 deliberately used a project-owner OpenAI key so contest evaluators could see the GPT-5.6 transformation without setup. That reduced demo friction but made every public Quick Remember request a potential charge to the project owner. The product owner does not want an open-ended public model-usage subsidy.

The product still needs a useful demo that requires neither an API key nor a paid request. A visitor who wants to transform a personal note can reasonably bring a dedicated OpenAI project key, provided the interface is honest about where that credential travels and the application does not retain it.

The existing nine-question guided flow, ready-made sample dataset, browser-local records, Responses API structured output, and recall-card review remain valuable and should not be replaced.

## Decision

### D1. Make both ready-made demos deterministic and zero-API

`Explore a ready-made demo` continues to seed sample people, encounters, and reminders directly in browser localStorage.

`See a no-API example` in Quick Remember loads a checked-in synthetic Maya note and matching `QuickMemoryDraft` directly in the browser. It must not call `/api/remember` or OpenAI.

The example is labeled `Demo result · No API request` in the review state.

### D2. Require a visitor-owned key for personal GPT shaping

Personal notes use bring-your-own-key (BYOK). The user explicitly opens an inline key prompt and submits a dedicated OpenAI project key with the current note.

The interface states that:

- the note and key pass through Rehello's server to OpenAI for the request;
- Rehello does not save the key;
- a dedicated, restricted project key is preferred;
- a ChatGPT subscription does not include OpenAI API usage.

There is no separate BYOK settings page and no remembered-key option.

### D3. Remove the project-owner OpenAI key from the runtime path

`POST /api/remember` must not read `process.env.OPENAI_API_KEY` or use any server-key fallback. A request without a visitor key is rejected before an OpenAI client is created.

This is a structural cost boundary: leaving a stale deployment environment variable in place cannot make the new route charge the owner's OpenAI project. Removing that remote variable remains a separate, approval-gated deployment operation.

The owner's long-lived dedicated test key may be reused for controlled manual tests. It is not deployed, committed, logged, or automatically exercised. Rotation is required if exposure is suspected, not after every ordinary test.

### D4. Relay the key in a one-request server path

The key is:

- held in React state only while the prompt and request are active;
- sent in the custom `x-openai-api-key` request header, never in the URL or JSON body;
- cleared from React state after every success or failure;
- never written by Rehello to localStorage, sessionStorage, backups, or logs.

The server validates an optional browser `Origin` header, key presence and maximum length, JSON shape, and note length before contacting OpenAI. It preserves `store: false`, structured Zod output, bounded input/output, `Cache-Control: no-store`, and generic client-safe errors.

This is a best-effort non-persistence boundary, not a claim that JavaScript strings can be cryptographically erased from memory or that hosting and provider infrastructure have zero transient processing.

### D5. Remove third-party analytics from the application

Remove Vercel Analytics from the root layout and dependencies. A route-only component gate is insufficient because a script loaded on Welcome can remain active after client-side navigation to `/remember`.

This keeps the BYOK credential-entry surface free of the app's former third-party analytics script. It does not make claims about hosting-level request logs or OpenAI processing.

### D6. Add secret-free contract tests to CI

Vitest route tests use a mocked OpenAI client. They prove that:

- an owner environment key is ignored;
- a visitor key is required;
- invalid origin and note input stop before client construction;
- a valid visitor key reaches the OpenAI client;
- `store: false` and structured output remain configured;
- authentication, permission, rate-limit, and generic failures map to bounded messages;
- response bodies do not expose the submitted key or provider error detail.

A deterministic fixture test covers the no-API demo card. GitHub Actions runs tests before lint and build. CI receives no OpenAI key and makes no live provider request.

## Alternatives considered

### Continue using the project-owner server key

Rejected. Rate limits and provider budgets can reduce exposure but do not change who pays for public requests. OpenAI project budgets are monitoring controls rather than a guaranteed hard stop.

### Call OpenAI directly from the browser

Rejected. A direct browser client would broaden credential exposure, require browser-enabled SDK behavior, and remove the existing server validation and error-redaction boundary. Official OpenAI guidance advises against deploying API keys in client-side environments.

### Remember a visitor key in localStorage or a cookie

Rejected. Persistence improves convenience but materially increases credential exposure, creates backup and cleanup questions, and is unnecessary for a small demo.

### Remove AI from the product entirely

Rejected. GPT-5.6's bounded note-to-card transformation remains the core product demonstration. The fixed example gives zero-cost exploration while BYOK preserves access to the real transformation.

### Add accounts, encrypted secret storage, and per-user quotas

Deferred. That would create a materially larger hosted product with authentication, database, encryption, recovery, and compliance responsibilities.

## Consequences

### Positive

- Anonymous visitors cannot spend the project owner's OpenAI balance through the route.
- Evaluators can see the core before-and-after artifact without an API key or API call.
- Personal-note shaping remains available with real GPT-5.6 structured output.
- The original guided flow remains a completely local fallback.
- CI verifies the credential boundary without secrets, cost, or provider nondeterminism.

### Tradeoffs and limitations

- BYOK adds friction and asks the visitor to trust Rehello's server with the key for one request.
- Removing Analytics also removes the existing product-usage telemetry.
- Rehello cannot guarantee that a visitor's key has credit or model permission.
- The endpoint can still consume Rehello hosting invocations; BYOK removes owner-funded model usage, not all abuse or infrastructure cost.
- Same-origin validation is defense-in-depth, not authentication.
- Browser extensions, password managers, compromised devices, hosting infrastructure, and OpenAI are outside Rehello's in-repository persistence guarantees.
- Deployment, remote environment-variable removal, WAF configuration, and production smoke testing remain separate approval-gated work.

## Verification plan

Before publication:

1. Run the mocked unit suite, lint, and a production build locally.
2. Verify in a real browser that the fixed example makes zero `/api/remember` requests.
3. Verify that a personal note opens the key prompt without sending a request.
4. Verify that the guided flow still starts at step 1/9.
5. Verify that the key is absent from localStorage, sessionStorage, URL, backup output, and the rendered DOM after an attempted request.
6. Check the working tree for accidental secret material.

After explicit deployment approval:

1. Remove the old `OPENAI_API_KEY` from Vercel environments.
2. Publish the exact verified commit.
3. Confirm exact-head CI and deployment status separately.
4. Run at most one user-authorized live smoke request with the owner's dedicated test key.
5. Verify production demo traffic makes no OpenAI request.

## References

- [OpenAI API key safety best practices](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- [ADR-0001: Add GPT-5.6 Quick Remember Without Replacing the Existing Flow](ADR-0001-gpt56-quick-remember.md)
- [Engineering Log: BYOK and Zero-API Demo](../engineering-log/2026-07-22-byok-zero-api-demo.md)
