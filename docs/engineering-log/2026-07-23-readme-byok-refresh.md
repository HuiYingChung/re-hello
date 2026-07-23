# README BYOK Refresh

## Scope

On 2026-07-23, the README was rewritten to match the merged and deployed
zero-API demo plus BYOK product. This was documentation-only work. It did not
change application code, create a deployment, modify Vercel configuration, or
make a paid OpenAI request.

The work was performed on branch `codex/vercel-deployment-cleanup-record` with
starting HEAD `4f452e961b6d7d80cfe09f85d7420d34a6a8a6df`. Existing cleanup-record
changes were preserved.

## Source evidence

The rewrite was checked against:

- `web/src/app/remember/page.tsx` for the three capture paths, minimum note
  length, visitor-key submission, 45-second attempt lifecycle, and key clearing.
- `web/src/app/api/remember/route.ts` for same-origin checking, input limits,
  `gpt-5.6-terra`, Responses API structured output, `store: false`, and
  `Cache-Control: no-store`.
- `web/src/app/api/remember/route.test.ts` for the owner-key non-fallback
  regression and mocked OpenAI request assertions.
- `web/package.json` for the current Next.js, React, OpenAI SDK, Zod, Vitest,
  and UI dependencies.
- `.github/workflows/ci.yml` for the Node.js 24 install, test, lint, and build
  sequence with no API key.
- The existing BYOK ADR and engineering log for browser-storage, backup, and
  zero-API demo evidence.
- The Vercel cleanup record for the live production URL, HTTP 200 homepage
  check, and removal of 35 older deployments.

## Documentation result

The README changed from 354 lines to 259 lines and now leads with:

1. the live production URL;
2. a three-path choice between ready-made demo, BYOK Quick Remember, and guided
   capture;
3. exact deployed-app instructions for using a visitor-owned restricted key;
4. a prominent key trust boundary and cost owner;
5. a compact product tour;
6. one architecture flow;
7. a data and API key boundary table;
8. local setup, limitations, verification, and evidence links.

The rewrite removed repeated architecture and project-tree prose while
preserving the product's narrow GPT role, local-first boundary, hosting-cost
caveat, no-rate-limiter limitation, and no-offline guarantee.

## Verification

- `git diff --check`: passed.
- README relative-link validator: 10 checked, zero broken.
- Required-claim validator: passed for live app, zero-API demo, BYOK path, key
  clearing, owner-key non-fallback, `store: false`, key-free CI, and deployment
  cleanup evidence.
- Stale-claim scan: zero matches for the removed server-key and
  pre-deployment-only wording.
- Mermaid CLI 11.16.0: final top-to-bottom diagram rendered successfully through
  installed stable Chrome.
- Final diagram visual inspection: readable, unclipped, and materially narrower
  than the rejected left-to-right layout.

No application test, build, production deployment, or live OpenAI request was
needed for this documentation-only change. Existing code and deployment
evidence are cited rather than recharacterized as new verification.

## Failed attempts and recovery

1. The first ripgrep source fact-check used an invalid combined regex and
   returned no evidence. It changed no file. Recovery used one `-e` argument per
   pattern with explicit paths.
2. The first pinned Mermaid render could not find Puppeteer's expected Chrome
   Headless Shell. It produced no image. Recovery reused the installed system
   Chrome through a scoped Puppeteer configuration.

Detailed prevention rules are recorded as L95-L96 in
[`lessons.md`](../../lessons.md).
