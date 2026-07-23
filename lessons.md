# Rehello Failure Lessons and Prevention Playbook

## Record metadata

- Initial record date: 2026-07-22
- Initial drafting started: 2026-07-22 14:56:49 -05:00
- Initial record created: 2026-07-22 14:59:01.184 -05:00 (NTFS `CreationTime`)
- Time zone: America/Chicago (UTC-05:00 on this date)
- Repository: `C:\Users\Winnie\Dropbox\PC\Documents\Playground\re-hello`
- Initial scope: failures, false starts, false signals, and avoidable rework observed during the GPT-5.6 Quick Remember, CI, entry-prompt, production-verification, and launch-framing work on 2026-07-22
- Maintainer rule: append new lessons; do not rewrite history to hide an earlier failure

## How to use this file

This is an operational prevention file, not a success report. Before doing related work, read the relevant lesson and apply its **Next-time rule** before running the command or editing the code.

Every new entry must include:

1. what failed or produced a false signal;
2. the observed evidence and time, when captured;
3. the root cause or the most honest current diagnosis;
4. how the work recovered;
5. a concrete prevention rule that can be checked next time;
6. the source engineering log when one exists.

Unknown causes and timestamps must remain labeled unknown. A later successful retry does not erase the failed attempt.

## Mandatory preflight checklist

Before changing code or publication state:

- [ ] Fetch Git refs before branching when the user has just merged or fetched elsewhere.
- [ ] Confirm the branch base SHA and working-tree status.
- [ ] Read this file and the closest `AGENTS.md` completely.
- [ ] Read the relevant local Next.js documentation before editing `web/`.
- [ ] Run or inspect the existing baseline checks before attributing errors to new work.
- [ ] Decide whether the verification needs network access, a real browser, a live API request, or only local deterministic checks.
- [ ] For any live API request, define the maximum number of requests and the evidence that proves whether a request occurred.
- [ ] For deployment work, bind local HEAD, pushed SHA, CI SHA, Vercel deployment SHA, and production behavior separately.
- [ ] Use a self-contained browser/server command with an isolated port, readiness check, and exact cleanup.
- [ ] Test the narrow mobile viewport and inspect a screenshot when CTA visibility matters.
- [ ] Verify marketing, privacy, analytics, and setup claims against code before publishing them.

## Failure ledger

| ID | Observed failure or false signal | Prevention rule |
| --- | --- | --- |
| L01 | Existing React hook violations were discovered only after feature implementation began. | Establish lint/build/browser baseline before attributing failures to the new change. |
| L02 | Four restricted-environment builds separately failed on the same two Google Font downloads. | Treat this repository's `next/font` network dependency as known; run the important build with approved network access or immediately retry once after classifying the exact font-fetch error. |
| L03 | Turbopack rejected a temporary external `node_modules` junction used for a key-free CI simulation. | Use a real clean temporary copy plus `npm ci`; do not junction external dependencies into a Turbopack build. |
| L04 | A Vercel CLI environment query timed out and could not prove the remote key existed. | Never infer remote environment state from a local link or a timed-out query; use an authorized dashboard/CLI check or a no-token production behavior probe after the correct SHA is deployed. |
| L05 | Production `/api/remember` returned 404 after a reported redeploy because the deployed artifact was older than the feature. | Verify push, merge, deployment SHA, and route presence in that order before diagnosing environment variables. |
| L06 | A production probe used a PowerShell parameter unavailable in the installed Windows PowerShell. | Check the shell version and use compatible `.NET HttpClient` for status/body probes on Windows PowerShell 5.1. |
| L07 | Browser automation reported a successful click even though no fetch occurred and the UI did not change. | A click return value is not proof; require a network entry, URL/state transition, or expected rendered result before counting the action. |
| L08 | Text/URL wait operations failed with operating-system connection timeouts. | Prefer bounded polling of `location.href` and page state; retain cleanup and do not interpret the wait failure as an application failure. |
| L09 | `Start-Process` failed because its environment contained duplicate `Path` and `PATH` keys. | Avoid rebuilding the entire inherited environment for hidden launchers; use a self-contained command and set only task-specific variables. |
| L10 | Detached dev-server launchers exited or lost their listener when the parent tool process ended. | Start, verify, browse, and stop the server inside one tool lifecycle; do not assume a detached child survives the boundary. |
| L11 | A browser attempt hit `EADDRINUSE` on port 3100. | Select an isolated port, check it before launch, capture the actual listener PID, and stop only that PID. |
| L12 | Windows CLI quoting removed JavaScript string quotes from browser setup code. | Pass nontrivial JavaScript through stdin or a tool-supported expression input, not nested shell quoting. |
| L13 | Git branch creation was denied when the restricted environment could not create a lock file. | Use read-only Git checks first, then request the narrow approved Git mutation command instead of retrying broad shell variants. |
| L14 | A multi-file patch failed because one `layout.tsx` context no longer matched. | Inspect current file context and apply small file-specific patches; verify that a failed atomic patch changed nothing before continuing. |
| L15 | An inline 820-pixel Welcome height put launch CTAs below the visible viewport. | Do not use inline fixed heights for responsive shells; use responsive CSS and verify at 390 by 653 plus a short desktop viewport. |
| L16 | A case-sensitive text assertion returned `mentionsGPT: false` for visually uppercased GPT copy. | Normalize case or query a stable semantic element; do not convert a harness artifact into a product change without corroborating evidence. |
| L17 | README claims said `no tracking` despite Vercel Analytics and pointed sample-data setup to the wrong UI location. | Trace claims to code and walk the current first-run flow before editing public documentation. |
| L18 | A parallel verification wrapper surfaced the failed build output but did not preserve the sibling lint result. | Use result collection that preserves every sibling outcome, or rerun each command separately with its own timestamps before recording status. |
| L19 | The original disabled `Shape my memory` action did not explain its 20-character requirement. | Every disabled primary action must expose the unmet prerequisite; test empty, boundary-minus-one, and boundary states. |
| L20 | GPT-5.6 was described as optional even though the contest required a clear model-centered story. | Before launch, map the claim to the strongest real model transformation and show it in the first-run and social-preview surfaces. |
| L21 | A staged diff check found a blank line at EOF, but a composite shell command continued and obscured the check's exit status. | Run integrity gates as standalone commands or capture and propagate their exit codes immediately. |
| L50 | A strict Welcome snapshot regex rejected a valid button ref when Playwright inserted an `active` attribute. | Parse the ref from the remainder of the matching snapshot line instead of assuming it immediately follows the accessible name. |
| L51 | A textarea-ref parser assumed every Playwright ref used the simple `e39` form and rejected a valid frame-prefixed ref. | Capture the complete bracketed ref token; treat ref values as opaque identifiers. |
| L52 | Windows PowerShell could not resolve `System.Net.Http.HttpClient` before the assembly was loaded. | Load `System.Net.Http` explicitly before constructing `HttpClient` in Windows PowerShell 5.1. |
| L53 | A lesson patch reused context from the feature branch after the user switched to `main`. | Re-read the branch and exact patch target immediately after every branch switch. |
| L54 | A Playwright mobile configuration was silently ignored, so a desktop Chrome result looked like iPhone evidence. | Gate mobile runs on user agent, viewport, screen size, and DPR, and pass device options explicitly. |
| L55 | A broad npm-cache search produced noisy, truncated output and a nonzero composite result. | Use the focused CLI help command before searching package caches. |
| L56 | The first WebKit iPhone gate failed because the browser binary was absent. | Prove the requested browser is installed before starting the application matrix. |
| L57 | Headless WebKit passed while a physical iPhone screenshot still showed the whole shared shell shifted left. | Treat physical-device evidence as the acceptance authority and correct the shared root rather than product pages. |
| L58 | Browser-tool discovery used the wrong working-directory path, an uncached `@latest` package, and then an assumed global executable. | Use the skill wrapper's exact package form and verify paths relative to the declared working directory. |
| L59 | `Start-Process` again failed on duplicate `Path` and `PATH` environment keys. | Do not use `Start-Process` for this workspace's dev server; use a managed foreground tool cell. |
| L60 | Several Playwright CLI attempts failed in package resolution, daemon permissions, command naming, or JavaScript grammar before measuring the page. | Fix one CLI layer at a time and count no page evidence until a minimal command returns browser state. |
| L61 | A many-process CLI matrix exceeded 124 seconds and returned no measurements. | Run one browser process with an in-process matrix and a bounded, explicit cleanup path. |
| L62 | Expired or detached Next dev children caused a navigation timeout, stale listeners, and misleading readiness failures. | Verify server readiness immediately before browsing and inspect exact child PIDs when a managed parent ends. |
| L63 | The browser first loaded non-hydrated SSR through `127.0.0.1`, then a stale `.next` stylesheet from before the shell fix. | Use the server-declared origin and prove the served CSS contract before trusting browser assertions. |
| L64 | The first two `.next` cleanup attempts failed because surviving Next child processes still held Turbopack files. | Stop every command-line-confirmed repo Next child before deleting the validated untracked cache path. |
| L65 | The final status probe repeated the invalid direct pipe after a PowerShell `foreach` statement. | Always assign `foreach` output to a variable before piping it to a formatter. |
| L66 | A combined prerequisite read ended nonzero because its guessed Next documentation glob matched no files. | List the installed documentation tree first and handle an expected zero-match search explicitly. |
| L67 | Repeated mobile-width browser attempts targeted expired or lock-holding Next dev children and produced no page evidence. | Clear only command-line-confirmed repo dev children, then require HTTP 200 immediately before a browser matrix with enough server lifetime for approvals. |
| L68 | Long Playwright CLI evaluation expressions were split by Windows native argument handling, while npm also intermittently returned `ENOTCACHED`. | Prove one short CLI expression, then move a long multi-route measurement into one workspace-owned Playwright Core program. |
| L69 | The first direct Playwright Core WebKit launch failed with sandbox `spawn EPERM`. | Retry only the exact browser-launch command with narrow execution approval and treat the denied launch as zero application evidence. |
| L70 | The first direct harness assumed an exact URL wait and later assumed every shell route had `.screen-content` and bottom navigation. | Poll observable route state and make route-specific shell regions optional while keeping shared-boundary assertions mandatory. |
| L71 | The first repo-process command-line inspection was denied by the default sandbox. | After read access is denied, request narrow read-only process inspection before stopping any exact repo-owned PID. |
| L72 | The Chromium mobile matrix could not launch because Playwright's bundled Chromium executable was absent. | Check for an installed system Chrome and reuse it with the same mobile descriptor before downloading another browser runtime. |
| L73 | Post-change lint scanned the temporary Playwright Core CommonJS script and failed on `no-require-imports`. | Remove ignored browser scripts and screenshots before running repository lint. |
| L74 | A parallel CSS-contract and lint wrapper returned only the lint failure, losing the sibling CSS result. | Run final gates separately or use an all-settled collector that always prints every result. |
| L75 | The first production CSS inspection guessed the obsolete `.next/static/css` directory. | Enumerate the built `.next/static` tree before selecting CSS files for contract checks. |
| L76 | The first L73-L75 detail patch reused a repeated source line and inserted the blocks before L52. | Append ordered records only after a unique final-entry sentence and validate heading order immediately. |
| L77 | Windows CLI argument splitting created an unexpected untracked help-output file at the web root. | After any native-argument failure, inspect the complete untracked-file set, not only expected browser artifact directories. |
| L78 | A final PowerShell status validator used `-like '??*'` and misclassified every modified line as untracked. | Use `StartsWith('?? ')` or escape wildcard metacharacters when parsing porcelain status. |
| L79 | The OpenAI documentation MCP installer could not launch `codex.exe`, including after narrow execution approval. | After the approved identical retry also returns `Access is denied`, stop retrying CLI variants and use the official-domain documentation fallback. |
| L80 | A documentation line-count command repeated the invalid direct pipe after a PowerShell `foreach` statement. | Collect `foreach` output in a task-specific variable before piping it, including in read-only discovery commands. |
| L81 | The BYOK implementation began on `main` instead of an isolated feature branch. | Create the scoped `codex/` feature branch immediately after read-only preflight and before the first working-tree edit. |
| L82 | The first background dev-server command hid its launch result inside a 30-second readiness loop and timed out without a PID. | Start the server in one observable step, then poll readiness separately with the captured process handle or cell ID. |
| L83 | Both `Start-Process` variants failed on duplicate `Path` and `PATH` environment keys. | After the duplicate-key error repeats with `-UseNewEnvironment`, stop using `Start-Process` and use a managed execution cell with explicit termination. |
| L84 | The Playwright skill reference used the obsolete `network` command for the installed CLI. | Check the installed CLI help when a referenced command is rejected, then use its current command name without retrying aliases. |
| L85 | Route-gating Analytics did not remove a script already loaded before SPA navigation to `/remember`. | For a credential-entry SPA route, remove the third-party analytics integration globally unless a fresh-document boundary is enforced and verified. |
| L86 | A Playwright CLI `route --body` JSON string lost its quotes through Windows native argument reconstruction. | Use a page-context route handler with `JSON.stringify` when a mocked JSON body must survive Windows CLI parsing. |
| L87 | The installed Playwright CLI rejected the skill's bare-`await` `run-code` form. | Read `run-code --help` and pass the installed version a function that explicitly accepts `page`. |
| L88 | The first post-browser `npm ci` could not unlink the locked Lightning CSS native binary. | Before a clean install, confirm every repo-owned Next.js child process is gone, not only the outer execution cell and listening port. |
| L89 | Default-sandbox process command-line inspection was denied. | After the read-only denial, request narrow approval and filter command lines to the exact workspace before stopping any PID. |
| L90 | A read-only secret-classification script used unavailable modern .NET hash helpers. | Use PowerShell 5.1-compatible `SHA256.Create().ComputeHash()` or avoid hashing when tracked-baseline comparison is sufficient. |
| L91 | The connected Vercel tool returned `Project not found` for the repository-linked project ID. | Treat connector and CLI authorization as separate scopes; verify through the linked CLI before concluding that a project or deployment is absent. |
| L92 | A Vercel JSON compaction command discarded the CLI output stream and converted `$null` into a false one-deployment result. | Require a non-empty JSON boundary and a known current deployment before using parsed CLI output to select destructive targets. |
| L93 | The first corrected Vercel JSON query failed with npm `ENOTCACHED` in the restricted environment. | Retry the unchanged read-only query once with approved network access; do not mutate deployments until the complete target set is recovered. |
| L94 | The generic web opener rejected the production `.vercel.app` URL as unsafe before making a request. | When a deployment smoke URL is rejected before transport, use one bounded PowerShell 5.1 `HttpClient` request and keep the tool denial separate from production evidence. |
| L95 | A combined ripgrep fact-check used an invalid escaped alternation and failed before reading any source evidence. | Pass multiple fixed patterns with separate `-e` arguments and keep paths outside the regex. |
| L96 | The first pinned Mermaid render could not find Puppeteer's expected Chrome Headless Shell. | Check for an installed system Chrome and pass it through a scoped Puppeteer config before downloading another browser. |

## Detailed lessons

### L01. Establish the baseline before blaming the new feature

**Failure:** Initial full-project lint reported five `react-hooks/set-state-in-effect` errors and one `react-hooks/exhaustive-deps` warning in code that existed before the GPT route work.

**Why it mattered:** Without a baseline, these errors could have been incorrectly attributed to Quick Remember or left to fail CI later.

**Recovery:** The implementation replaced effect-driven state mirroring with hydration-aware derivation, `useSyncExternalStore`, and URL-derived Prep state. No lint rule was disabled.

**Next-time rule:** Before feature edits, run lint and build when practical, or explicitly capture the known baseline failures. In this app, do not mirror localStorage or URL state into React state from an effect when the value can be derived after hydration.

**Source:** [GPT-5.6 Quick Remember engineering log](docs/engineering-log/2026-07-22-gpt56-quick-remember.md)

### L02. Classify the known Google Fonts network failure immediately

**Failure:** Restricted-environment production builds failed on Instrument Serif and Noto Sans TC at least four times: 12:39, 13:22, 14:08, and 14:53 CT.

**Root cause:** The existing `next/font/google` build path needed access to `fonts.googleapis.com`; the restricted environment could not establish that connection.

**Recovery:** The same builds passed with network access. Compilation, TypeScript, and all 16 routes succeeded.

**Next-time rule:** When an important Rehello build is executed in a restricted environment, account for the known font fetch before interpreting the result. If the exact two font-fetch errors occur, label the attempt as an environment failure and retry once with approved network access. Do not modify product code merely to silence an environment-only failure unless the team separately decides to self-host fonts.

**Sources:** [Quick Remember log](docs/engineering-log/2026-07-22-gpt56-quick-remember.md), [CI baseline log](docs/engineering-log/2026-07-22-github-actions-ci-baseline.md), [entry-prompt log](docs/engineering-log/2026-07-22-quick-remember-entry-prompts.md), and [launch-framing log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L03. Do not use a `node_modules` junction for Turbopack isolation

**Failure:** At 13:27:53-13:27:57 CT, the first key-free CI simulation failed because Turbopack rejected a temporary external `node_modules` junction.

**Root cause:** The shortcut did not reproduce the filesystem assumptions of a clean install.

**Recovery:** A clean temporary copy with its own Node.js 24 `npm ci` completed lint and build with no `.env.local` and no `OPENAI_API_KEY`.

**Next-time rule:** For clean-room or secret-free verification, copy the application into an isolated temporary directory and run `npm ci`. Never infer CI validity from a dependency junction that the real workflow does not use.

**Source:** [GitHub Actions CI baseline engineering log](docs/engineering-log/2026-07-22-github-actions-ci-baseline.md)

### L04. A timed-out environment query proves nothing about Vercel secrets

**Failure:** At 12:48:07 CT, a read-only Vercel CLI environment query timed out.

**False inference to avoid:** A linked local `.vercel/project.json`, a user report, or a timeout does not confirm a remote variable's presence or value.

**Recovery:** After the correct commit was deployed, a deliberately invalid short production request returned the route's 400 validation response instead of its 503 missing-configuration response. That confirmed only that the function saw a non-empty key.

**Next-time rule:** Report secret presence, secret value, provider project settings, and runtime behavior as separate claims. Never print the value. Use the Vercel dashboard/authorized CLI for configuration and a zero-token behavior probe only after the exact feature SHA is deployed.

**Source:** [GPT-5.6 Quick Remember engineering log](docs/engineering-log/2026-07-22-gpt56-quick-remember.md)

### L05. Verify the deployed artifact before debugging its environment

**Failure:** At 13:13:45 CT, production returned `404 text/html` for `/api/remember` after the user reported redeploying.

**Root cause:** The production artifact was older than the local Quick Remember implementation; the route did not exist in that deployment.

**Recovery:** The feature was committed, pushed, merged, and deployed. Exact merge SHA CI and the Vercel check passed before the production probe was repeated successfully.

**Next-time rule:** Use this order: local HEAD -> pushed branch SHA -> merged SHA -> CI SHA -> Vercel deployment SHA/status -> production route presence -> environment behavior -> optional live model request. Do not diagnose a secret on an artifact that does not contain the route.

**Source:** [GPT-5.6 Quick Remember engineering log](docs/engineering-log/2026-07-22-gpt56-quick-remember.md)

### L06. Use commands supported by the installed PowerShell

**Failure:** At 13:49:40 CT, `Invoke-WebRequest -SkipHttpErrorCheck` failed before making a request because the installed Windows PowerShell did not support that parameter.

**Recovery:** The probe used `.NET HttpClient`, which returned the status, content type, cache policy, and body without requiring a PowerShell 7-only flag.

**Next-time rule:** Check `$PSVersionTable.PSVersion` before using version-specific parameters. For controlled HTTP probes that need non-2xx response bodies on Windows PowerShell 5.1, prefer `.NET HttpClient`.

**Source:** [GPT-5.6 Quick Remember engineering log](docs/engineering-log/2026-07-22-gpt56-quick-remember.md)

### L07. A reported click is not evidence of a request

**Failure:** During production verification, the first automation click reported success, but the page stayed unchanged and the Performance API showed no `/api/remember` request.

**Recovery:** Because zero fetches were confirmed, one native DOM `button.click()` retry was allowed. Exactly one resource entry then appeared and the expected review card rendered.

**Next-time rule:** Before retrying a potentially paid action, prove that the first action caused no provider request. Require at least one objective side effect: a matching resource entry, expected UI state, server receipt, or URL transition. Cap live model attempts in advance.

**Source:** [GPT-5.6 Quick Remember engineering log](docs/engineering-log/2026-07-22-gpt56-quick-remember.md)

### L08. Avoid fragile text and URL wait primitives on Windows

**Failure:** Text-based and URL-based browser waits ended in operating-system connection timeouts, including Windows socket error 10060 during launch-framing verification.

**Diagnosis:** The page state had already rendered correctly in at least one case; the wait primitive failed independently of the application assertion.

**Recovery:** Later checks used bounded fixed waits followed by direct inspection of `location.href`, DOM state, localStorage, and error overlays.

**Next-time rule:** Use short bounded waits and poll observable state. When a wait tool fails, inspect the page before declaring the product broken. Always close the browser and stop the exact server listener.

**Sources:** [Quick Remember log](docs/engineering-log/2026-07-22-gpt56-quick-remember.md) and [launch-framing log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L09. Do not rebuild the inherited environment for `Start-Process`

**Failure:** At 14:09:50 CT, a hidden dev-server launcher failed because PowerShell encountered both `Path` and `PATH` keys.

**Root cause:** Windows environment keys are case-insensitive even when a constructed map contains both forms.

**Recovery:** The final verification used a self-contained server/browser command rather than a separately detached hidden launcher.

**Next-time rule:** Do not clone and rewrite the full environment map. Set only task-specific variables, and never repurpose common system variables. Prefer one self-contained lifecycle over `Start-Process` for automated verification.

**Source:** [Quick Remember entry-prompt engineering log](docs/engineering-log/2026-07-22-quick-remember-entry-prompts.md)

### L10. Keep the server and browser in one tool lifecycle

**Failure:** Two hidden launchers and a later isolated port 3101 attempt did not retain their listeners after the parent tool process ended.

**Root cause:** The automation boundary did not guarantee survival of detached child processes.

**Recovery:** A single command started the production server, waited for readiness, ran browser checks, closed the browser, and stopped the captured listener PID.

**Next-time rule:** Do not launch the server in one tool call and assume it remains available in another. Make readiness, browser work, and cleanup part of the same bounded command unless the product provides a persistent server mechanism.

**Source:** [Quick Remember entry-prompt engineering log](docs/engineering-log/2026-07-22-quick-remember-entry-prompts.md)

### L11. Check the port before starting the server

**Failure:** A combined dev-server/browser attempt returned `EADDRINUSE` on port 3100.

**Recovery:** Later attempts used isolated ports and verified the final listener was absent after cleanup.

**Next-time rule:** Select a task-specific port, test whether it is free, capture the listener PID after startup, and stop only that exact PID. Never kill broad process groups to recover from a port collision.

**Source:** [Quick Remember entry-prompt engineering log](docs/engineering-log/2026-07-22-quick-remember-entry-prompts.md)

### L12. Pass browser JavaScript through stdin

**Failure:** At 14:19:52-14:20:00 CT, Windows CLI quoting removed string quotes from the onboarding localStorage expression.

**Recovery:** The successful browser run passed JavaScript evaluation through stdin.

**Next-time rule:** Any expression containing nested strings, JSON, `$`, backticks, or shell metacharacters must use stdin or the browser tool's structured input. Do not add more shell escaping to an already fragile command.

**Source:** [Quick Remember entry-prompt engineering log](docs/engineering-log/2026-07-22-quick-remember-entry-prompts.md)

### L13. Separate read-only Git inspection from approved Git mutation

**Failure:** The first `git switch -c` attempt for `codex/launch-framing` was denied because the restricted environment could not create the Git lock file.

**Related risk:** Before fetching, local refs appeared stale relative to the user's report that the branch had been merged and fetched.

**Recovery:** `git fetch origin --prune` confirmed merged commit `087488c`, then the narrow branch command was retried with approved Git write access.

**Next-time rule:** After an external merge, fetch first and compare `main`, `origin/main`, and the intended base. Use read-only commands without escalation. For branch, stage, or commit operations, request only the narrow Git mutation required; do not retry with broader filesystem authority.

**Source:** [GPT-5.6 launch-framing engineering log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L14. Patch current contexts in small units

**Failure:** A combined multi-file patch failed because its `layout.tsx` context did not match. The atomic patch applied nothing.

**Recovery:** Current diffs and file contents were re-inspected, then small file-specific patches were applied and reviewed.

**Next-time rule:** Read the exact target region immediately before patching. Split changes by file or cohesive concern. After any patch failure, verify the working tree before assuming partial application.

**Source:** [GPT-5.6 launch-framing engineering log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L15. Fixed inline heights defeat responsive launch UX

**Failure:** The first launch-framing screenshot showed both final Welcome actions below a 624-pixel viewport because the scroll container had an inline 820-pixel height.

**Root cause:** The inline style overrode the intended responsive behavior.

**Recovery:** The height moved to a dedicated CSS class using the phone-frame height on desktop and `100dvh` on narrow screens. At 390 by 653, both actions were fully visible with `scrollTop` equal to zero.

**Next-time rule:** Layout properties that must change across viewports belong in responsive CSS, not inline fixed values. For launch-critical mobile paths, assert CTA bounding rectangles and inspect a screenshot at 390 by 653 before committing.

**Source:** [GPT-5.6 launch-framing engineering log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L16. Normalize assertion text before diagnosing the UI

**Failure:** A diagnostic check reported `mentionsGPT: false` even though the page visibly contained `Powered by GPT-5.6`.

**Root cause:** The check was case-sensitive while the element's rendered text was transformed to uppercase.

**Recovery:** The result was labeled a harness artifact and corroborated with visual and DOM evidence; no unnecessary product change was made.

**Next-time rule:** Normalize with a case-insensitive comparison or query a stable element/accessible name. A single failed string heuristic must not overrule stronger browser evidence.

**Source:** [GPT-5.6 launch-framing engineering log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L17. Verify public claims against code and the current UI

**Failure:** The README claimed `no tracking` even though `@vercel/analytics` was loaded, and it told users to find sample data in Settings even though the first-run path was Welcome.

**Root cause:** Documentation described an intended or older state instead of the code that would ship.

**Recovery:** The blanket tracking claim was removed, the precise browser-storage/OpenAI-submit boundary was documented, and the sample-data instructions were corrected.

**Next-time rule:** Before changing README, Product Hunt copy, privacy text, or setup instructions, trace every behavioral claim to code and walk the exact user path in a browser. Avoid absolute claims such as `no tracking` unless repository and deployment evidence support them.

**Source:** [GPT-5.6 launch-framing engineering log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L18. Preserve all outcomes when parallel checks fail

**Failure:** At 14:53 CT, lint and build were launched together. The build failed on the known font network issue, and the orchestration wrapper surfaced only the build failure rather than preserving a complete sibling lint result.

**Recovery:** Lint was rerun with its own timestamps, and the build was rerun with network access. Both exact-feature-commit checks passed.

**Next-time rule:** Use an all-settled result collector for parallel checks or run each check in a wrapper that returns its exit code as data. Do not record a sibling as passed, failed, or skipped unless its own output was captured.

**Source:** [GPT-5.6 launch-framing engineering log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md)

### L19. Disabled actions must explain their prerequisite

**Failure:** A user could type into Quick Remember without knowing why `Shape my memory` remained disabled. The 20-character minimum existed only in code.

**Recovery:** The UI now exposes exact remaining characters, provides three user-authored sentence starters, and tests empty, 19-character, and 20-character states. Inserted labels do not count toward eligibility.

**Next-time rule:** A disabled primary action must have a visible, accessible reason. Test the empty state, every automatic scaffold, the boundary minus one, and the exact boundary. Application-authored scaffolding must not unlock a paid request.

**Sources:** [Quick Remember entry-prompt engineering log](docs/engineering-log/2026-07-22-quick-remember-entry-prompts.md) and [ADR-0003](docs/decisions/ADR-0003-quick-remember-entry-prompts.md)

### L20. Launch framing must make the real AI role obvious

**Failure:** Rehello's README described GPT-5.6 as an optional route, which weakened the story for a contest explicitly about building with GPT-5.6.

**Recovery:** The launch surfaces now lead with the real rough-note-to-recall-card transformation, and the ready-made demo is visible on the final Welcome screen. No unsupported AI capability was claimed.

**Next-time rule:** Before contest submission, write one sentence describing the model's indispensable user-facing transformation and verify that the first-run flow, social preview, metadata, README, and demo all prove the same sentence. Do not add a rushed second AI route merely to increase route count.

**Sources:** [GPT-5.6 launch-framing engineering log](docs/engineering-log/2026-07-22-gpt56-launch-framing.md) and [ADR-0004](docs/decisions/ADR-0004-gpt56-launch-framing.md)

### L21. Do not hide a failed gate inside a composite shell command

**Observed at:** Exact time not captured; after 2026-07-22 14:59:36 -05:00

**Failure:** `git diff --cached --check` reported a new blank line at the end of `AGENTS.md`. The same PowerShell invocation then ran status and diff-display commands, so the overall tool result did not preserve the earlier check's failure status.

**Root cause:** The file patch left an unnecessary final blank line, and the composite verification command did not save or immediately propagate `$LASTEXITCODE` from the integrity gate.

**Recovery:** The blank line was removed, the failure was added to this append-only record, and the staged check was rerun as a standalone command.

**Next-time rule:** Run commit-blocking gates such as `git diff --check` and `git diff --cached --check` alone, or capture their exit code before executing any later command. Never infer pass from the final exit code of a multi-command diagnostic sequence.

**Source:** Local staged-diff output while creating this file; no separate engineering log exists for this documentation-only correction.

## Known unresolved risks, not completed lessons

These items remain open and must not be described as fixed:

- `/api/remember` still lacks durable distributed application-level rate limiting.
- A provider spending limit is not equivalent to request abuse prevention.
- One controlled synthetic GPT example is not a formal hallucination or multilingual evaluation.
- The launch-framing branch has not yet been pushed, merged, deployed, or production-smoke-tested.
- The final mobile check used a browser viewport, not a physical device.
- Product Hunt's actual gallery/card rendering has not been verified.
- GPT-generated Prep assistance and realtime voice are deliberately deferred.

## Append-only lesson template

```markdown
### LXX. Short prevention-oriented title

**Observed at:** YYYY-MM-DD HH:MM:SS UTC offset, or `Exact time not captured`

**Failure:** What failed or produced a false signal.

**Evidence:** Command output, status, screenshot, network entry, or file state.

**Root cause:** Confirmed cause, or `Unknown` with the current best boundary.

**Recovery:** What eventually worked.

**Next-time rule:** A concrete action that must happen before repeating the operation.

**Source:** Relative link to the detailed engineering log or decision record.
```

### L26. Do not mix manual icon metadata with Next.js icon file conventions

**Observed at:** 2026-07-22 15:25:05-15:27:48 -05:00

**Failure:** Two local browser checks found that `app/icon.svg` was not emitted in the document head while any `metadata.icons` configuration remained. Removing only the manual favicon, shortcut, and SVG entries did not make the file-convention SVG reappear; even an `icons` object containing only the Apple icon still suppressed it.

**Root cause:** In this Next.js 16.2.2 build, the explicit `metadata.icons` value acted as the icon metadata source instead of being merged with all colocated icon file conventions.

**Recovery:** The existing Apple PNG was copied byte-for-byte to `app/apple-icon.png`, and the explicit `metadata.icons` object was removed. The final design uses app file conventions for `favicon.ico`, `icon.svg`, and `apple-icon.png`, while the web manifest continues to own the PWA PNG declarations.

**Next-time rule:** Choose one source of truth for each icon surface. When using Next.js app icon file conventions, put favicon, SVG icon, and Apple icon in `app/` and do not add a parallel `metadata.icons` object. Verify the actual emitted head instead of assuming manual and file-based metadata will merge.

**Source:** Local favicon browser verification; the favicon engineering log records the complete sequence and final output.

### L27. Corroborate native image-viewer screenshots before declaring an asset broken

**Observed at:** 2026-07-22 15:29:31-15:30:39 -05:00

**Failure:** A direct-browser screenshot of the rebuilt ICO appeared completely black even though the favicon response was HTTP 200 with the expected MIME type and byte length. Treating that single capture as authoritative would have incorrectly rejected a valid asset.

**Evidence:** The black capture was followed by a fresh browser session using a cache-busting query. The browser reported one complete image with natural dimensions 256 by 256, and the second screenshot visibly showed the cream Rehello tile with the copper `R` and dot.

**Root cause:** The exact screenshot-rendering cause is unknown. The observed boundary is a transient native image-viewer or capture artifact, not an ICO byte, decode, or route failure.

**Recovery:** Closed the first browser and server, opened a fresh session and port, added a cache-busting query, waited two seconds, checked the image element's completion and natural dimensions, and visually inspected a second screenshot.

**Next-time rule:** Never fail an image asset on one native image-viewer screenshot alone. Corroborate the response status, content type, byte length, decoder output, DOM natural dimensions, and a fresh-session visual capture before changing the asset.

**Source:** [Rehello favicon repair engineering log](docs/engineering-log/2026-07-22-rehello-favicon-repair.md)

### L28. Resolve repository-root documents before joining relative links

**Observed at:** Exact time not captured; after 2026-07-22 15:34:16 and before 15:35:06 -05:00

**Failure:** The first local Markdown-link validation stopped with `Join-Path: Cannot bind argument to parameter 'Path' because it is an empty string` when it reached root-level `lessons.md`. No complete link result was produced.

**Root cause:** PowerShell `Split-Path lessons.md -Parent` returns an empty string for a repository-root file, and the validator passed that empty value directly to `Join-Path`.

**Recovery:** Use the resolved repository root when a document has no parent component, then rerun the complete relative-link scan.

**Next-time rule:** A repository-wide relative-link validator must explicitly handle root-level documents. Treat a validator crash as no result, never as evidence that links passed or failed.

**Source:** [Rehello favicon repair engineering log](docs/engineering-log/2026-07-22-rehello-favicon-repair.md)

### L29. Classify exact-commit font-fetch failures before changing application code

**Observed at:** 2026-07-22 15:37:27-15:40:57 -05:00

**Failure:** The first production build against exact feature commit `755f59677f5e09c8688be87e5c84f1cf4adb4687` failed because the restricted environment could not connect to Google Fonts for the existing Instrument Serif and Noto Sans TC imports.

**Evidence:** The failed build reported only font resource connection errors from `next/font`. The same commit built successfully with network access from 15:40:44 through 15:40:57, including compilation, TypeScript, page-data collection, and all 17 routes.

**Root cause:** Network access was unavailable to the first build process. No favicon, TypeScript, route, or application-source defect was reported.

**Recovery:** Re-ran the unchanged exact commit with the network access required by the existing remote-font configuration.

**Next-time rule:** When an exact-commit build fails only on existing Google Font downloads, preserve the failure output, confirm the source SHA is unchanged, and retry with network access before touching application code. Keep the restricted-network failure and the successful retry as separate results.

**Source:** [Rehello favicon repair engineering log](docs/engineering-log/2026-07-22-rehello-favicon-repair.md)

### L30. Run Git fetch as a standalone gate before trusting later ref checks

**Observed at:** Exact time not captured; before 2026-07-22 16:07:31 -05:00

**Failure:** The first pre-branch command could not write `.git/FETCH_HEAD`, but later status and ref-comparison commands succeeded and left the composite shell invocation with exit 0. The output therefore contained a real fetch failure even though the final command status looked successful.

**Root cause:** The restricted environment denied the Git metadata write, and the composite command did not capture or immediately propagate the fetch exit code before running later read-only checks.

**Recovery:** Re-ran `git fetch origin --prune` as a standalone narrowly approved command, then created the documentation branch from the confirmed `main` commit.

**Next-time rule:** Run `git fetch` alone when it is a branch-base precondition. Treat any fetch error as a failed gate regardless of later output, retry only the narrow Git command with the required authority, and compare refs only after that standalone command succeeds.

**Source:** [README user-flow engineering log](docs/engineering-log/2026-07-22-readme-user-flow.md)

### L31. Validate SVG visuals through an explicit raster artifact and file check

**Observed at:** Exact time not captured; after 2026-07-22 16:07:31 and before 16:22:08 -05:00

**Failure:** The first visual-inspection tool could not process the successfully rendered SVG. A subsequent headless Chrome command could not write a relative screenshot path, and the next command created the requested absolute-path PNG but still reported failure because PowerShell exposed a null `$LASTEXITCODE`. The first rendered layout was also rejected because long return edges crossed too many branches.

**Evidence:** Mermaid CLI 11.16.0 rendered the exact README source to SVG. Chrome reported `Access is denied` for the relative output. The absolute-path attempt wrote a 148,834-byte PNG despite the nullable exit-code signal. After simplifying the chart, the final attempt wrote a 91,503-byte PNG that the image viewer opened successfully with readable, unclipped labels.

**Root cause:** The image viewer did not support that SVG input path, Chrome could not use the relative screenshot destination in this environment, and the process-launch behavior did not reliably populate `$LASTEXITCODE`. The initial diagram also encoded too many cross-chart returns for a compact README layout.

**Recovery:** Simplified the diagram, retained SVG rendering as the syntax gate, rasterized it to an explicit absolute temporary path, polled for the PNG, asserted its existence and non-zero length, and visually inspected that PNG. All generated validation artifacts were then removed.

**Next-time rule:** For Mermaid visual review, render the exact fenced source to SVG, rasterize to an explicit absolute temporary PNG, and trust file existence and byte length instead of a nullable launcher exit code. Inspect the PNG for edge crossings, clipping, and readability before accepting the diagram.

**Source:** [README user-flow engineering log](docs/engineering-log/2026-07-22-readme-user-flow.md)

### L32. Distinguish unresolved placeholders from historical status prose

**Observed at:** 2026-07-22 16:23:20 -05:00

**Failure:** The first placeholder scan failed the engineering log because two honest historical-state sentences used the ordinary word `pending`, even though both sentences immediately recorded that the checks subsequently passed.

**Evidence:** The only matches were `still pending at the instant this record was created` and `still pending at record creation`; no `TODO`, `TBD`, bracketed placeholder, or unresolved pending field existed.

**Root cause:** The validator treated every occurrence of `pending` as a placeholder without considering sentence context or placeholder syntax.

**Recovery:** Preserved the accurate historical wording and narrowed the automated check to explicit placeholder forms such as angle-bracketed or bracketed markers and values left unresolved at the end of a field.

**Next-time rule:** Placeholder validation must target placeholder syntax and unresolved fields, not ordinary words inside dated historical evidence. Inspect matches before editing accurate records to satisfy an overbroad regex.

**Source:** [README user-flow engineering log](docs/engineering-log/2026-07-22-readme-user-flow.md)

### L33. Use stable source text as a patch anchor when terminal output is mojibake

**Observed at:** 2026-07-22 16:28:42 -05:00

**Failure:** The first combined documentation patch did not apply because its README context copied the terminal-rendered mojibake sequence `â€”` instead of matching the UTF-8 em dash stored in the file. The patch tool rejected the complete patch, so no partial edits were written.

**Evidence:** The patch reported `Failed to find expected lines` around the sentence ending in `quiet, warm, never nagging`. A subsequent status check was clean, and neither proposed new record file existed.

**Root cause:** The PowerShell output encoding distorted a non-ASCII character, and that rendered text was used as an exact patch anchor.

**Recovery:** Re-anchored the README insertion on the unique ASCII heading `## Design principles`, split the large patch into smaller operations, and rechecked repository state before continuing.

**Next-time rule:** When terminal output displays suspicious encoding, never reuse the corrupted characters as exact patch context. Anchor on nearby stable ASCII text and verify that a rejected multi-file patch left no partial changes.

**Source:** [Mobile-first rationale engineering log](docs/engineering-log/2026-07-22-mobile-first-rationale.md)

### L34. Discover feature files before assuming a dedicated module exists

**Observed at:** 2026-07-22 16:33:43 -05:00

**Failure:** The first architecture-audit command successfully read the API route and produced search evidence, then failed when it tried to read nonexistent `web/src/lib/quick-remember.ts` and `web/src/app/quick-remember/page.tsx` paths. Quick Remember is integrated into `web/src/app/remember/page.tsx` instead of having a dedicated module or route page.

**Evidence:** PowerShell returned `Cannot find path` for `web/src/lib/quick-remember.ts`. A subsequent `rg --files` search listed the actual remember, storage, type, Prep, and Settings files and no dedicated Quick Remember file.

**Root cause:** The audit inferred file organization from the feature name before enumerating repository paths.

**Recovery:** Used `rg --files` to locate the implementation and read focused ranges from `web/src/app/remember/page.tsx`, the API route, storage, types, Prep, and Settings.

**Next-time rule:** Before a multi-file feature audit, enumerate matching tracked paths first. Treat any later missing-file error as an incomplete composite audit even when earlier commands emitted valid output.

**Source:** [Product architecture and limitations engineering log](docs/engineering-log/2026-07-22-product-architecture-limitations.md)

### L35. Handle ripgrep's zero-match exit code explicitly in absence checks

**Observed at:** 2026-07-22 16:35:05 -05:00

**Failure:** A second composite audit read the intended source ranges but ended with exit 1 because its final `rg` filename filter found no service-worker, Workbox, or matching test file. The zero-match result obscured the successful reads and did not produce an explicit absence assertion.

**Evidence:** The command returned source content followed by an overall exit 1. A corrected scan collected all paths into arrays, reported zero offline-worker files and zero test/spec files, and exited 0.

**Root cause:** Ripgrep correctly uses exit 1 for no matches, while the audit treated every nonzero code as an operational failure without distinguishing the expected absence case.

**Recovery:** Replaced the pipeline with an explicit tracked-path collection, counted matching arrays, and emitted a named confirmation when the count was zero.

**Next-time rule:** For absence checks, convert zero matches into a deliberate counted result and an explicit success condition. Do not leave `rg` as the final unhandled command in a composite validation step.

**Source:** [Product architecture and limitations engineering log](docs/engineering-log/2026-07-22-product-architecture-limitations.md)

### L36. Retry the same pinned renderer when restricted npm cache blocks validation

**Observed at:** Exact time not captured; after 2026-07-22 16:36:25 and before 16:41:12 -05:00

**Failure:** The first Mermaid CLI render could not start because the restricted npm environment used `only-if-cached` mode and had no cached response for `@mermaid-js/mermaid-cli`. The exact README source comparison passed, but no diagram image was produced.

**Evidence:** npm returned `ENOTCACHED` for the registry request, reported that it could not write an npm log in the cache directory, and the wrapper raised `Mermaid CLI exited 1`.

**Root cause:** The pinned renderer package was unavailable in the restricted npm cache, and network access was disabled for that attempt. This was a tooling-availability failure, not Mermaid syntax evidence.

**Recovery:** Re-ran the unchanged Mermaid CLI 11.16.0 command with narrowly approved npm network access. It rendered the exact second README Mermaid block to a 58,766-byte PNG, which was visually inspected before all temporary artifacts were removed.

**Next-time rule:** When a pinned documentation renderer fails only with `ENOTCACHED`, preserve the failure, retry the identical version and source with narrowly scoped network access, and do not modify the diagram unless the renderer or visual inspection reports an actual content problem.

**Source:** [Product architecture and limitations engineering log](docs/engineering-log/2026-07-22-product-architecture-limitations.md)

### L37. Never use a HOME variable variant for PowerShell scratch data

**Observed at:** Failure time not captured; recovery began at 2026-07-22 16:45:26 -05:00

**Failure:** A reminder-boundary audit stopped after its early file reads because it assigned Home-page source to `$home`. PowerShell variable names are case-insensitive, so `$home` collided with the read-only `$HOME` variable and raised `Cannot overwrite variable HOME because it is read-only or constant`.

**Evidence:** The command emitted the reminder component and storage output, then terminated at the `$home=Get-Content web/src/app/page.tsx` assignment. The Home, Settings, and notification-reference checks after that assignment did not run.

**Root cause:** A prohibited system-variable name was repurposed as a scratch variable despite the repository workflow rule to avoid every HOME variant.

**Recovery:** Re-ran the incomplete portion with `$homePage`, completed the Home and Settings reads, and explicitly counted notification, push, service-worker, and calendar references.

**Next-time rule:** Never declare `$HOME`, `$home`, or any case variant. Use task-specific names such as `$homePage`, and treat all output after a failed variable assignment as not executed.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L38. Do not repeat a known mojibake patch-anchor failure

**Observed at:** Failure confirmed at 2026-07-22 16:46:59 -05:00

**Failure:** The first combined copy-correction patch repeated L33 by using the terminal-rendered mojibake form of the README em dash as exact context. The patch tool rejected the complete patch before writing any application or documentation file.

**Evidence:** `apply_patch` reported that it could not find the `Stay in touch` README lines. An immediate status and text search showed a clean working tree and all original product strings still present.

**Root cause:** A large patch reused corrupted terminal text instead of the stable ASCII-only anchor mandated by L33.

**Recovery:** Split application and README edits into smaller patches, anchored the README changes on nearby ASCII-only lines, and rechecked each result.

**Next-time rule:** L33 is mandatory, not advisory. For any file containing non-ASCII punctuation, patch only the minimum ASCII line or stable heading unless the exact source bytes were read through a verified encoding path.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L39. Distinguish a restricted font fetch from a source build failure

**Observed at:** 2026-07-22 16:52:56.623 -05:00 to 16:53:04.853 -05:00

**Failure:** The first production build stopped while Next.js tried to fetch the configured Instrument Serif and Noto Sans TC stylesheets from Google Fonts.

**Evidence:** `next build` reported connection failures for `fonts.googleapis.com` and named only the two `next/font` imports from `web/src/app/layout.tsx`. It did not report a TypeScript, application, or route error.

**Root cause:** The restricted execution environment could not reach the external font host during build-time asset resolution.

**Recovery:** Re-ran the identical `npm run build` command against unchanged source with narrowly approved network access. The second attempt completed compilation, TypeScript checking, page-data collection, and generation of all 17 static pages.

**Next-time rule:** When a build fails only at an existing `next/font` network fetch, preserve the exact error, retry the unchanged build with narrowly scoped network access, and do not edit application code unless the network-enabled build exposes a source defect.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L40. Use a unique anchor when appending an ordered record

**Observed at:** Failure confirmed at 2026-07-22 16:54:20.318 -05:00

**Failure:** The patch that added L39 matched the first repeated `Source` line in `lessons.md`, so the new entry was inserted between L37 and L38 and broke ascending lesson order.

**Evidence:** The immediate heading scan reported L37, L39, then L38 at lines 512, 528, and 544.

**Root cause:** The patch used a non-unique link line as its insertion anchor and assumed the patcher would select the final occurrence.

**Recovery:** Removed the misplaced block, reinserted it after the unique L38 prevention text, added this failure record, and reran the numeric-order validator.

**Next-time rule:** Before appending to an ordered document, anchor on a unique final sentence or explicit end marker. Immediately validate both content and order; never assume a repeated context line selects the intended occurrence.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L41. Delimit PowerShell variables before adjacent punctuation

**Observed at:** Exact time not captured; confirmed after 2026-07-22 16:54:20 and before 16:56:17 -05:00

**Failure:** The first composite truth validator did not parse because an interpolated error message contained `$index:`. PowerShell interpreted the colon as part of a scoped variable reference.

**Evidence:** PowerShell raised `Variable reference is not valid` at the lesson-order error string before any validation statement ran.

**Root cause:** The script placed punctuation immediately after an unbraced variable inside a double-quoted string.

**Recovery:** Replaced the interpolated message with PowerShell's `-f` format operator and reran the validator from the beginning.

**Next-time rule:** In PowerShell diagnostics, prefer `-f` formatting or `${variable}` whenever punctuation follows a variable. A parser error means the entire composite validation is unexecuted.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L42. Keep validators independent of JSX line wrapping and shell-expression shortcuts

**Observed at:** Exact time not captured; confirmed before 2026-07-22 16:56:17 -05:00

**Failure:** The second composite validator emitted repeated errors because `if` was placed where PowerShell expected a command, and its exact full-sentence assertion for the readable-JSON copy failed because JSX split the sentence across a line break.

**Evidence:** PowerShell repeatedly reported `if` as an unrecognized term, then named only `Settings warns readable JSON` as the failed truth assertion. Source inspection showed the intended sentence across two adjacent JSX lines.

**Root cause:** The reporting loop relied on an invalid expression shortcut, while the content check was more sensitive to formatting than to meaning.

**Recovery:** Replaced the shortcut with a normal `foreach` plus statement-level `if`, and checked two stable semantic fragments instead of one whitespace-sensitive sentence.

**Next-time rule:** Write validator reporting as ordinary statements, and make copy assertions tolerant of source-only line wrapping while still requiring the important user-facing phrases.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L43. Validate the repository's actual numbering contract

**Observed at:** Failure confirmed before 2026-07-22 16:56:53.332 -05:00

**Failure:** The third validator required every lesson number to be contiguous and therefore failed at the historical jump from L21 to L26 even though the headings remained strictly increasing and the current L37-L40 additions were correctly ordered.

**Evidence:** All 13 product truth checks passed, then the script reported `expected L22, found L26`. A full heading scan confirmed that L22-L25 were historically absent rather than misplaced by this change.

**Root cause:** The validator strengthened the documented requirement from unique, increasing numbers to a contiguous sequence without checking the existing file convention.

**Recovery:** Changed the contract to unique lesson numbers, globally increasing order, and an exact current tail sequence. The replacement validator was rerun against the whole file.

**Next-time rule:** Derive structural validators from both the written requirement and the existing baseline. Do not introduce a stronger invariant unless the repository already satisfies it or the task explicitly requires migration.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L44. Retry only the explicit Git mutation after a sandbox index-lock denial

**Observed at:** Exact time not captured; recovery confirmed by 2026-07-22 16:58:59.249 -05:00

**Failure:** The first explicit nine-file staging command could not create `.git/index.lock` and exited with permission denied.

**Evidence:** Git returned `fatal: Unable to create .../.git/index.lock: Permission denied` before the staged-path and status checks ran. The repository had not been partially staged.

**Root cause:** The default workspace sandbox allowed source writes but denied this Git metadata mutation.

**Recovery:** Re-ran only the same path-limited `git add --` operation with approved Git-write permission, then passed `git diff --cached --check` and confirmed exactly the intended nine staged paths.

**Next-time rule:** When a sandbox denies `.git/index.lock`, verify that staging did not partially occur, request permission for the same path-limited Git mutation, and never broaden the file list or use a blanket add.

**Source:** [Honest boundary copy engineering log](docs/engineering-log/2026-07-22-honest-boundary-copy.md)

### L45. Convert expected memory-search absence into an explicit result

**Observed at:** Exact time not captured; before 2026-07-22 17:09:23.835 -05:00

**Failure:** A composite discovery command successfully read the Playwright skill and then exited 1 because its final `rg` search found no relevant Rehello mobile-layout entry in the memory registry.

**Evidence:** The tool output contained the complete skill text, an empty `MEMORY HITS` section, and overall exit code 1.

**Root cause:** The command repeated L35 by leaving an expected no-match `rg` invocation as its unhandled final operation.

**Recovery:** Classified the memory lookup as a zero-match, stopped memory discovery, and continued from current repository and production evidence.

**Next-time rule:** Memory discovery must count or explicitly handle zero matches. Do not let an expected empty lookup obscure successful prerequisite reads or appear to be an operational failure.

**Source:** [Mobile viewport shell investigation](docs/engineering-log/2026-07-22-mobile-viewport-shell-investigation.md)

### L46. Classify an uncached browser CLI before diagnosing the application

**Observed at:** Exact time not captured; before 2026-07-22 17:09:23.835 -05:00

**Failure:** The first `@playwright/cli` help command failed before browser launch because restricted npm used `only-if-cached` mode and had no cached package response.

**Evidence:** npm returned `ENOTCACHED` for `@playwright/cli` and reported that it could not write a log under the npm cache directory.

**Root cause:** The required diagnostic CLI package was absent from the restricted npm cache. No Rehello request or browser action occurred.

**Recovery:** Re-ran the unchanged package and help command with narrowly approved npm network access, then opened an isolated browser session.

**Next-time rule:** When a pinned or explicit browser CLI fails only with `ENOTCACHED`, record it as tool availability, retry the identical command with narrow network access, and do not infer an application defect.

**Source:** [Mobile viewport shell investigation](docs/engineering-log/2026-07-22-mobile-viewport-shell-investigation.md)

### L47. Match Playwright CLI code to the command's execution grammar

**Observed at:** Exact time not captured; after 2026-07-22 17:09:23.835 and before 17:16:11.857 -05:00

**Failure:** The first geometry measurement used a top-level `return` in Playwright CLI `run-code` and failed with `SyntaxError: Unexpected token 'return'`.

**Evidence:** The CLI returned the syntax error and no viewport, scroll-width, or navigation geometry result.

**Root cause:** The submitted snippet assumed function-body return semantics that the selected CLI command did not provide at its top level.

**Recovery:** Re-expressed the measurement as a value-producing expression for the CLI `eval` command.

**Next-time rule:** Before sending a long browser diagnostic, prove the chosen CLI command's grammar with a one-line expression. Treat a syntax failure as zero page evidence and rerun the full measurement only after the probe succeeds.

**Source:** [Mobile viewport shell investigation](docs/engineering-log/2026-07-22-mobile-viewport-shell-investigation.md)

### L48. Pass complex Playwright expressions through one PowerShell variable

**Observed at:** Exact time not captured; after L47 and before 2026-07-22 17:16:11.857 -05:00

**Failure:** The first `eval` geometry expression failed with `SyntaxError: Unexpected token '*'` because quotes around the universal selector did not survive the Windows native-command argument boundary.

**Evidence:** The error was consistent with the browser receiving `querySelectorAll(*)` instead of a quoted selector, and no geometry result was returned.

**Root cause:** Nested JavaScript double quotes were reconstructed incorrectly between PowerShell and the native CLI, repeating the quoting class already identified by L12.

**Recovery:** Stored the full expression in a task-specific PowerShell variable and used JavaScript single-quoted strings encoded inside the PowerShell value. The next command returned the complete JSON measurement.

**Next-time rule:** For Playwright CLI `eval` on Windows, pass one prebuilt expression argument from a task-specific variable and validate it with a small probe. Do not stack shell escapes around nested JavaScript quotes.

**Source:** [Mobile viewport shell investigation](docs/engineering-log/2026-07-22-mobile-viewport-shell-investigation.md)

### L49. Keep Playwright session snapshots out of the repository

**Observed at:** Artifacts created from 2026-07-22 17:09:23.835 through 17:22:35.249 -05:00; cleanup completed before 17:26:41.436 -05:00

**Failure:** Playwright navigation and snapshot commands created 21 untracked `.playwright-cli/page-*.yml` files because the directory was not ignored. The fetched main branch already contained one tracked snapshot from an earlier commit.

**Evidence:** `git status --short` listed 21 untracked snapshot files, `git check-ignore` returned no rule, and `git ls-files` listed the older tracked snapshot.

**Root cause:** The browser CLI writes session snapshots to `.playwright-cli` by default, while the repository ignores `.agent-browser` and test-report directories but not `.playwright-cli`.

**Recovery:** Closed the exact browser session, enumerated only untracked `.playwright-cli` paths, validated every resolved path stayed inside the expected directory, removed 21 generated files, preserved the tracked file, and confirmed a clean working tree.

**Next-time rule:** Add `.playwright-cli/` to `.gitignore` before further CLI browser work and deliberately remove any tracked session snapshot in a scoped commit. During cleanup, enumerate only untracked files and never delete the directory recursively when tracked evidence is present.

**Source:** [Mobile viewport shell investigation](docs/engineering-log/2026-07-22-mobile-viewport-shell-investigation.md)

### L50. Treat Playwright snapshot attributes as variable metadata

**Observed at:** The final Welcome snapshot was created at 2026-07-22 17:43:22.902 -05:00; the harness failure followed immediately, but its exact time was not captured.

**Failure:** The first mobile-shell browser matrix stopped before loading sample data because its snapshot parser did not find the visible `Explore a ready-made demo` button.

**Evidence:** The fresh snapshot contained `button "Explore a ready-made demo" [active] [ref=e40]`, while the parser required `[ref=...]` to appear immediately after the accessible name. The server and browser cleanup still completed, and `LISTENER_REMAINS=False` confirmed that port 3174 was released.

**Root cause:** The harness treated Playwright's optional state attributes as a fixed snapshot grammar. The button was present and active; this was not an application rendering or navigation failure.

**Recovery:** The parser was changed to accept same-line metadata between the accessible name and ref. A standalone check against the captured fresh snapshot returned `RECOVERED_REF=e40` before the browser matrix was retried.

**Next-time rule:** When extracting a ref from a fresh Playwright snapshot, match the accessible role and name, then allow variable same-line attributes before `[ref=...]`. Preserve the snapshot and classify a parser mismatch separately from application behavior.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L51. Treat Playwright ref values as opaque identifiers

**Observed at:** The Remember snapshot was created at 2026-07-22 17:49:19.354 -05:00; the harness failure followed immediately, but its exact time was not captured.

**Failure:** The corrected browser matrix passed all 17 mobile geometry cases and the desktop-frame assertion, then stopped before the focused-textarea check because the parser did not recognize the textarea ref.

**Evidence:** The fresh Remember snapshot contained `textbox "What you remember" [active] [ref=f20e39]`. The parser allowed only refs matching `e` followed by digits. Browser and listener cleanup again completed with `LISTENER_REMAINS=False`.

**Root cause:** Playwright generated a frame-prefixed ref after repeated navigations, but the harness treated the earlier short `e40` form as the ref schema. The textarea was already rendered and active; this was not an application focus failure.

**Recovery:** The parser was changed to capture the entire non-closing-bracket token after `ref=` and to treat it as opaque. A standalone check against the captured snapshot returned `RECOVERED_TEXTAREA_REF=f20e39` before retrying the focused-input verification.

**Next-time rule:** Never validate Playwright ref syntax beyond its enclosing `[ref=...]` marker. Capture and reuse the complete token from the latest snapshot because navigation and frame context can change its prefix.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L52. Load the HTTP assembly explicitly in Windows PowerShell

**Observed at:** Exact time not captured; after the user confirmed the iPhone 14 issue affected every page in portrait orientation and before the corrected production CSS probe on 2026-07-22.

**Failure:** The first read-only production CSS probe stopped before making an HTTP request because Windows PowerShell could not resolve `[System.Net.Http.HttpClient]`.

**Evidence:** PowerShell returned `Unable to find type [System.Net.Http.HttpClient]` at the constructor line. No production response or application behavior was measured by that attempt.

**Root cause:** The installed Windows PowerShell session had not loaded the `System.Net.Http` assembly automatically before the type was referenced.

**Recovery:** The unchanged read-only probe was rerun after `Add-Type -AssemblyName System.Net.Http`. It fetched two production CSS assets and confirmed that the deployed application contained the grid shell, safe-area rules, and vertical-touch containment.

**Next-time rule:** In Windows PowerShell 5.1, run `Add-Type -AssemblyName System.Net.Http` before constructing `HttpClient`. Treat a missing type as a local runtime setup failure and zero network evidence.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L53. Re-read patch context after a branch switch

**Observed at:** Exact time not captured; during the worktree cleanup requested after the iPhone 14 production follow-up on 2026-07-22.

**Failure:** The first attempt to record L52 failed verification because its patch expected L50 and L51 ledger rows that existed on `codex/mobile-shell-investigation-record` but not on the current `main` branch.

**Evidence:** `apply_patch` reported that it could not find the expected L50 and L51 lines. The failed atomic patch changed nothing, and `git status -sb` remained clean on `main`.

**Root cause:** The patch reused target context read before the user switched branches instead of re-reading `lessons.md` from the current worktree.

**Recovery:** The current branch, lesson headings, ledger, and final detailed block were inspected again. The replacement patch used the current tail as its unique insertion anchor and retained L52-L53 numbers to avoid colliding with L45-L51 already present on the feature branch.

**Next-time rule:** After any branch switch or user-directed worktree change, re-read the exact target region immediately before applying a patch. Never reuse a patch anchor from a previous branch snapshot.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L54. Gate mobile emulation on device facts

**Observed at:** Exact time not captured; during the physical-iPhone follow-up on 2026-07-22.

**Failure:** The first supposed iPhone 14 measurement used a configuration file at `.playwright-cli/iphone14/playwright-cli.json` that the installed CLI did not read. The run looked geometrically healthy but was desktop Chrome, not mobile WebKit.

**Evidence:** The result reported a Windows HeadlessChrome user agent, 1280 by 720 inner viewport, and device pixel ratio 1. `playwright-cli open --help` later identified `.playwright/cli.config.json` as the default configuration path and exposed explicit `--browser` and `--device` options.

**Root cause:** The workflow reference described a configuration location that did not match the installed CLI version, and the first harness did not assert device identity.

**Recovery:** The run was discarded. WebKit was opened with `--browser webkit --device "iPhone 14"`, and the gate required an iPhone user agent, 390-pixel inner width, 390 by 844 screen, and DPR 3 before collecting layout evidence.

**Next-time rule:** Every mobile browser run must fail fast unless user agent, inner viewport, screen dimensions, and DPR match the requested device. A width-only result is not mobile evidence.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L55. Prefer focused CLI discovery over broad cache searches

**Observed at:** Exact time not captured; immediately before the corrected Playwright device gate on 2026-07-22.

**Failure:** A broad recursive search of the npm cache, combined with a help probe, produced noisy and truncated output and exited nonzero.

**Evidence:** The composite result did not provide a stable executable or configuration answer, while the focused `open --help` command immediately returned the supported device and config flags.

**Root cause:** Discovery searched a large implementation cache before asking the installed command for its public grammar.

**Recovery:** Stopped the broad search and used focused CLI help, then applied explicit browser and device flags.

**Next-time rule:** Ask the installed executable for command-specific help first. Search package implementation files only when the public help lacks the required fact, and never combine the search with the acceptance probe.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L56. Prove the requested browser binary before the matrix

**Observed at:** Exact time not captured; during the WebKit iPhone gate on 2026-07-22.

**Failure:** The first explicit WebKit iPhone 14 launch stopped because the WebKit browser binary was not installed.

**Evidence:** Playwright reported the missing executable before navigation. No application request or geometry measurement occurred.

**Root cause:** The CLI package was available, but its separately managed WebKit runtime was absent.

**Recovery:** Installed WebKit 26.5 (59.4 MiB), reran the device gate, and obtained the expected iPhone user agent, 390 by 664 inner viewport, 390 by 844 screen, and DPR 3.

**Next-time rule:** Before starting a browser matrix, run a minimal launch/version gate for the exact engine. Treat missing browser installation as tool setup and zero application evidence.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L57. Let physical-device evidence override emulation acceptance

**Observed at:** User screenshot received on 2026-07-22 after the initial stabilization had passed local Chrome and WebKit geometry checks.

**Failure:** The accepted shared-shell implementation still appeared shifted left on a physical iPhone 14 in portrait orientation across all pages.

**Evidence:** The supplied Safari screenshot showed the shared notch, product content, and bottom navigation displaced together, while browser chrome remained aligned. Earlier emulation had measured every shared box at left 0 and right 390, so it did not reproduce the physical failure.

**Root cause:** The earlier acceptance over-relied on headless geometry. The most bounded diagnosis from the physical screenshot is a root visual-viewport offset interacting with redundant root `overflow-x: clip`, not a People card or page-specific width defect.

**Recovery:** Removed root `overflow-x: clip`, explicitly set `html` and `body` to width 100% and min-width 0, reset body margin, and bounded the stage and shell. Fresh WebKit verification then kept all shared boxes at 0 through 390 on six routes.

**Next-time rule:** Physical iOS evidence outranks headless acceptance for visual-viewport and browser-chrome behavior. When every shared layer moves together, correct the root shell and do not redesign individual pages.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L58. Keep browser-tool discovery relative and version-stable

**Observed at:** Exact time not captured; after applying the physical-device correction on 2026-07-22.

**Failure:** One composite command ran from `web/` but tried to read `web/package.json`, then requested uncached `@playwright/cli@latest`. The next recovery attempt assumed a global `playwright-cli` executable that was not on `PATH`.

**Evidence:** PowerShell reported the nonexistent `web/web/package.json`; npm returned `ENOTCACHED`; and the following command reported `playwright-cli` was not recognized. None of these attempts launched a browser.

**Root cause:** The commands ignored their declared working directory and improvised package/executable forms instead of using the skill wrapper's exact package invocation.

**Recovery:** Read `package.json` relative to `web/`, used `npx --yes --package @playwright/cli playwright-cli`, and then pinned the already downloaded executable only after locating it explicitly.

**Next-time rule:** Resolve every path against the command's working directory and use the skill wrapper's package form verbatim. Do not add `@latest` or assume a global binary during recovery.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L59. Do not repeat the duplicate-Path Start-Process failure

**Observed at:** Exact time not captured; during the corrected local browser setup on 2026-07-22.

**Failure:** A background `Start-Process npm.cmd` attempt again failed with `Item has already been added. Key in dictionary: 'Path' Key being added: 'PATH'`, producing a null PID.

**Evidence:** The command returned `Pid:null` plus the duplicate-key exception, and no listener was created by that attempt.

**Root cause:** The current inherited Windows environment still contains case-insensitive duplicate path keys, exactly the condition already documented by L09.

**Recovery:** Used the tool's managed long-running foreground cell for `npm run dev`, with separate readiness and exact termination checks.

**Next-time rule:** In this workspace, do not use `Start-Process` for Next server verification. Apply L09 immediately and launch the server through a managed foreground command cell.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L60. Separate Playwright CLI plumbing from page evidence

**Observed at:** Exact times not captured; during the corrected WebKit verification on 2026-07-22.

**Failure:** Several CLI attempts failed before a reliable measurement: npm intermittently returned `ENOTCACHED`; the pinned executable hit `EPERM` writing its user-level daemon; an unapproved console composite never opened a session and also used the nonexistent `network` command; and a multi-statement `run-code` snippet returned `SyntaxError: Unexpected identifier 'page'`.

**Evidence:** Each attempt returned an npm, filesystem, command-grammar, or JavaScript parser error. The misleading console composite ended with exit code 0 only because its last cleanup command succeeded.

**Root cause:** Package resolution, sandbox permissions, CLI command grammar, and page JavaScript grammar were changed together instead of being proven one at a time.

**Recovery:** Located the installed Playwright Core runtime, switched to one workspace-owned verification script, and required its first successful output to include actual iPhone viewport and DOM geometry.

**Next-time rule:** Prove package resolution, process launch, session persistence, and one minimal page read as separate gates. Propagate every native exit code, and do not count a session-open or click message as layout evidence.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L61. Use one browser process for a multi-route matrix

**Observed at:** The failed command timed out after approximately 124 seconds on 2026-07-22.

**Failure:** A PowerShell matrix launched a separate CLI client process for every storage, navigation, evaluation, screenshot, and cleanup step. It exceeded the command timeout and returned no buffered measurements.

**Evidence:** The tool reported exit code 124 after 124 seconds. A subsequent session listing showed `iphone14fix` and `iphone14matrix2` still open.

**Root cause:** Per-command CLI startup and daemon round trips multiplied across six routes, while all output remained buffered behind one shell invocation.

**Recovery:** Closed all residual sessions and replaced the matrix with one Playwright Core browser/context/page process that navigated every route internally and closed in `finally`.

**Next-time rule:** For more than a few route measurements, use a single browser process and emit one result per route. Keep session cleanup in the same program even when an assertion fails.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L62. Verify the live server immediately before browser work

**Observed at:** Exact times not captured; during repeated local WebKit attempts on 2026-07-22.

**Failure:** The first single-process browser script timed out navigating to `/welcome` because the original managed server had reached its 604-second lifecycle limit. A replacement then failed with `EADDRINUSE` while readiness polling found no response; a malformed `foreach` pipeline obscured the first PID inspection, `Get-CimInstance` was sandbox-denied, and a 500-millisecond stop check briefly reported the exact Next PID still alive before it exited.

**Evidence:** Playwright returned a 30-second `page.goto` timeout; Next identified stale PID 24892 and repo path; PowerShell reported `An empty pipe element is not allowed`; and later process inspection showed surviving repo Next child processes even after the managed parent cell ended.

**Root cause:** Parent command lifetime, detached npm/Next child lifetime, listener state, and readiness were assumed to be identical. They were not on Windows.

**Recovery:** Used exact listener/process checks, queried command lines with narrow approval, stopped only repo-owned Next processes, selected a fresh port, and required an HTTP 200 immediately before browser launch.

**Next-time rule:** A managed parent ending does not prove its Windows child tree ended. Before every browser run, confirm the exact port returns HTTP 200; after termination, confirm both listener absence and no repo-owned Next child command lines.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L63. Prove hydration and the served stylesheet before layout assertions

**Observed at:** Exact times not captured; during the corrected WebKit matrix on 2026-07-22.

**Failure:** Opening the dev server through `127.0.0.1` rendered SSR controls but blocked a Next development resource, so `Skip` clicks reported success without changing state. After switching to `localhost`, two CSS readiness assertions still failed because the server was returning a stale pre-stabilization stylesheet from `.next`.

**Evidence:** The Next log recorded a blocked cross-origin HMR request and a browser `ChunkLoadError`. Direct stylesheet inspection then showed the old `height: calc(100vh - 82px)` and absolute bottom navigation, while the source file already contained the new grid shell.

**Root cause:** The browser origin did not match the server-declared local origin, and Turbopack's persistent cache survived branch/worktree changes without reflecting the current source.

**Recovery:** Used `http://localhost`, stopped every repo Next process, removed only the validated untracked `web/.next`, restarted on port 3184, and fetched the served stylesheet before browsing. The fresh CSS contained the grid, root hidden overflow, and zero body margin, and omitted both root clip and the old height calculation.

**Next-time rule:** Use the exact local origin printed by Next. Before accepting a layout run after branch switches, fetch the served stylesheet and assert current source markers; rebuild `.next` if any old marker remains.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L64. Stop every Next child before deleting its cache

**Observed at:** Exact time not captured; during the stale `.next` recovery on 2026-07-22.

**Failure:** Two validated recursive removals of untracked `web/.next` failed with access denied on Turbopack `.sst` and `.meta` files, including one attempt with elevated filesystem permission.

**Evidence:** The target resolved inside the repository and `git ls-files -- web/.next` returned zero, but the directory remained. Approved command-line inspection found npm PID 17548, Next CLI PID 31384, and Next server PID 32176 still attached to the repo and port 3183.

**Root cause:** Terminating the managed shell cell stopped neither the npm wrapper nor both Next child processes, which continued to hold cache handles.

**Recovery:** Stopped only those three confirmed repo processes, waited for them to disappear, and reran the same validated removal. `web/.next` then reported `Exists:false` before the fresh server was started.

**Next-time rule:** If a generated Next cache resists deletion, do not retry broad filesystem commands. Inspect command lines, stop only the confirmed repo Next process tree, revalidate the exact untracked target, and then retry once.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L65. Collect PowerShell foreach output before piping

**Observed at:** During the final clean-worktree check after commit `b50258d` on 2026-07-22.

**Failure:** The final composite status probe placed a pipe directly after `foreach (...) { ... }` and failed at parse time with `An empty pipe element is not allowed`.

**Evidence:** The command returned exit code 1 before reporting Git status, listener state, or artifact existence. This repeated the same grammar class already encountered during L62.

**Root cause:** The probe did not apply the recovery already used earlier in the same task: statement-form `foreach` output cannot be piped directly without being collected or wrapped.

**Recovery:** Assigned the loop output to a task-specific `$portResults` variable, piped that variable to `ConvertTo-Json`, and reran the entire status check. The branch was clean and ahead by one commit, ports 3182-3184 had no listeners, and `.playwright-cli` did not exist.

**Next-time rule:** In Windows PowerShell status probes, always write `$results = foreach (...) { ... }` and pipe `$results` afterward. A parser failure invalidates every sibling check in the composite command.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L66. Discover the installed Next documentation tree before filtering it

**Observed at:** During local merge cleanup on 2026-07-22, before merged-tree testing.

**Failure:** A composite prerequisite command successfully read `web/AGENTS.md` and then exited 1 because an `rg --files` filter guessed `.mdx` paths for the installed Next documentation, which actually uses `.md` files.

**Evidence:** The output contained the complete nested guidance and no documentation paths, with overall exit code 1. No lint or build command had started.

**Root cause:** The command assumed documentation extensions and left the expected zero-match `rg` result unhandled, repeating the absence-check class from L35 and L45.

**Recovery:** Listed `web/node_modules/next/dist/docs` first, found the installed CSS and `generateViewport` `.md` guides, and read both completely before testing.

**Next-time rule:** After dependency upgrades or branch merges, enumerate the installed documentation tree before applying a filename filter. If a discovery search may legitimately find nothing, capture that result explicitly instead of letting it invalidate a successful prerequisite read.

**Source:** Current merge cleanup; no separate engineering log was created.

### L67. Clear repo dev children before starting a browser lifecycle

**Observed at:** Exact times not captured; during the physical right-edge follow-up on 2026-07-22.

**Failure:** Several verification launches produced no page evidence because a prior Next dev child still owned the repository lock or because the managed server lifetime expired before the approved browser command began. The first port-3190 launch reported existing PID 5380 on port 3184; a later port-3191 launch reported PID 19732 on port 3190; two WebKit navigations timed out after the corresponding managed server had ended. One readiness probe also printed a zero-valued result and exited 0 after `Invoke-WebRequest` had already reported that it could not connect.

**Evidence:** Next printed `Another next dev server is already running` with the exact PIDs and repository directory. The expired managed cells returned exit 124 at 604 and 184 seconds, and Playwright returned 30-second `page.goto` timeouts. The misleading readiness composite included `Unable to connect to the remote server` despite its final exit code 0.

**Root cause:** The workflow checked only the candidate port, not the repository-wide Next dev lock and surviving child tree. Approval latency also consumed server lifetimes that were too short for the planned matrix, and the first readiness probe did not throw after its HTTP failure.

**Recovery:** Inspected command lines, stopped only confirmed `next dev` children, preserved the unrelated repo `next start -p 3105` process, started port 3193 with a ten-minute lifecycle, and required an actual HTTP 200 immediately before each browser run. Both final engine matrices completed inside that lifecycle.

**Next-time rule:** Before starting Next dev, check for command-line-confirmed repo dev children as well as the requested port. Give the managed server enough time for approval latency, make readiness failure throw, and recheck HTTP 200 immediately before browser launch.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L68. Do not send a long Windows measurement through CLI argument parsing

**Observed at:** Exact times not captured; during the physical right-edge follow-up on 2026-07-22.

**Failure:** The Playwright CLI intermittently returned npm `ENOTCACHED` while reusing an existing session. After an approved retry, the long evaluation was split into too many native arguments. A short `() => document.title` probe passed through `npx.cmd`, but the full expression again failed as either `ENOTCACHED` or `too many arguments`.

**Evidence:** npm named `@playwright/cli` and cache mode `only-if-cached`. The CLI then reported `expected 2, received 6` and later `expected 2, received 4`. None of those full-expression attempts returned DOM geometry.

**Root cause:** Package resolution and PowerShell-to-native argument reconstruction were both on the critical path for a large expression containing many spaces and punctuation.

**Recovery:** Closed the CLI session, located the already installed Playwright Core package through a focused cache-root check, and moved the full measurement into one ignored workspace script using one browser process per engine.

**Next-time rule:** Use the CLI for the device gate and short interaction probes. Once a long expression or multi-route matrix is required on Windows, use one workspace-owned Playwright Core program instead of retrying native argument escaping.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L69. Escalate only the denied browser launch

**Observed at:** Exact time not captured; during the first direct WebKit baseline on 2026-07-22.

**Failure:** The workspace-owned Playwright Core program failed before navigation because the sandbox denied WebKit process creation with `spawn EPERM`.

**Evidence:** The launch log named the installed WebKit executable and failed at `browserType.launch`; no page request, screenshot, or geometry result existed.

**Root cause:** Browser process creation required execution authority outside the default workspace sandbox.

**Recovery:** Re-ran only the exact Node verification program with narrow approval. WebKit launched successfully and subsequent device and page assertions supplied the application evidence.

**Next-time rule:** Treat `spawn EPERM` at `browserType.launch` as a tool boundary and zero application evidence. Request approval for the exact verification executable instead of changing product code or broadening unrelated shell access.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L70. Model route-specific shell regions in the harness

**Observed at:** Exact times not captured; during the cross-mobile geometry matrix on 2026-07-22.

**Failure:** The first direct program stopped on a 30-second exact `waitForURL` after the demo action. After navigation recovery, the first complete WebKit route matrix reached `/welcome` and then threw while reading `.screen-content.left`, because Welcome intentionally uses `.welcome-scroll` and has no bottom navigation.

**Evidence:** Playwright reported the exact URL wait timeout. The later stack pointed to the unconditional content assertion after the matrix had navigated to `/welcome`; source inspection confirmed Welcome shares `.app-stage`, `.phone-shell`, `.phone-status`, and `.phone-scroll` but not `.screen-content` or `.bottom-nav`.

**Root cause:** The harness encoded two stronger assumptions than the product contract: an exact navigation primitive instead of observable route state, and identical inner regions for every shared-shell route.

**Recovery:** Replaced the exact URL wait with bounded `location.pathname` polling. Kept document, shell, scroller, grid-column, descendant-bound, and horizontal-scroll assertions mandatory on every route, while applying content and navigation assertions only when those regions exist. Both final matrices then passed `/welcome` and the seven main routes.

**Next-time rule:** Assert the shared contract at the shared boundary. Poll observable state after client navigation, and treat intentionally route-specific descendants as optional without weakening document, shell, or scroller bounds.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L71. Inspect command lines narrowly after process access is denied

**Observed at:** Exact time not captured; during stale Next child cleanup on 2026-07-22.

**Failure:** The first `Get-CimInstance Win32_Process` call returned `Access denied`, so it could not distinguish repo dev children from another repo-owned production server.

**Evidence:** The default-sandbox call returned HRESULT `0x80041003` and no process list.

**Root cause:** Windows process command-line inspection was outside the default sandbox's read authority.

**Recovery:** Requested narrow read-only approval for Node command lines filtered to the exact repository. The result identified the dev tree on port 3192 separately from `next start -p 3105`; only the dev tree was stopped.

**Next-time rule:** If command-line inspection is denied, do not guess from process names or stop broad Node groups. Request the narrow read-only inspection, filter to the repository, and mutate only the exact confirmed PIDs.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L72. Reuse installed Chrome when bundled Chromium is absent

**Observed at:** Exact time not captured; during the Android mobile-width matrix on 2026-07-22.

**Failure:** Playwright's first Chromium launch stopped before navigation because `chromium_headless_shell-1232` was not installed.

**Evidence:** Playwright named the missing executable and suggested a browser download. No Rehello request or layout measurement occurred.

**Root cause:** The Playwright Core package and WebKit runtime existed, but its separately managed Chromium runtime did not.

**Recovery:** Verified that system Google Chrome existed, launched it through Playwright's `chrome` channel, and applied the Pixel 7 viewport, screen, DPR, touch, mobile, and user-agent descriptor. The full Android/Chromium matrix then passed without downloading a second browser.

**Next-time rule:** Prove the requested engine binary before the matrix. If bundled Chromium is absent, prefer an already installed stable Chrome channel with an explicit mobile device gate before authorizing a new runtime download.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L73. Remove temporary browser programs before lint

**Observed at:** Exact time not captured; after the successful WebKit and Chrome matrices on 2026-07-22.

**Failure:** The first post-change `npm run lint` failed only on `web/output/playwright/measure-mobile-shell.cjs` with `@typescript-eslint/no-require-imports`.

**Evidence:** ESLint reported one error at line 7 of the temporary CommonJS verification program and no application-source error.

**Root cause:** The disposable browser program lived under the lint search root and had not yet been removed after evidence capture.

**Recovery:** Verified that `web/output/playwright` and `web/.playwright-cli` contained no tracked files, removed the exact generated directories, and reran lint successfully.

**Next-time rule:** Capture and inspect browser evidence, then remove ignored or disposable browser programs before repository lint. Do not change lint rules or product module style to accommodate a temporary harness.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L74. Preserve every result from parallel final gates

**Observed at:** Exact time not captured; during the first post-change CSS-contract and lint run on 2026-07-22.

**Failure:** The JavaScript orchestration used `Promise.all`; when lint returned nonzero, the tool surfaced only lint output and did not print the sibling CSS-contract result.

**Evidence:** The combined call contained only the ESLint error even though both nested commands had been launched.

**Root cause:** The orchestration repeated L18 by using fail-fast aggregation for independent final gates.

**Recovery:** Removed the temporary harness and reran the CSS contract and lint as standalone commands. Both produced their own passing output.

**Next-time rule:** Final verification outcomes must be independently observable. Run them separately or use an all-settled collector that emits every exit code and output before deciding overall status.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L75. Discover the production CSS output directory before checking it

**Observed at:** Exact time not captured; immediately after the successful production build on 2026-07-22.

**Failure:** The first built-CSS contract check targeted `.next/static/css`, which did not exist, and therefore falsely reported that the bounded grid column was missing.

**Evidence:** Ripgrep returned an OS error for the nonexistent directory. Listing `.next/static` then showed `chunks`, the build ID directory, and `media`; six CSS files existed across production and development chunk trees.

**Root cause:** The check reused an older Next.js output-path assumption instead of applying L66 to the current 16.2.2 build artifact.

**Recovery:** Enumerated the tree, selected the two production CSS files under `.next/static/chunks`, joined their content, and confirmed the grid-column, `100dvw`, scroller-width, and screen-content-width markers.

**Next-time rule:** After every Next.js build, enumerate `.next/static` and derive the CSS file set from actual output. Never make a missing guessed directory double as a failed CSS-content assertion.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L76. Anchor ordered append-only records on unique tail text

**Observed at:** Exact time not captured; while recording L73-L75 on 2026-07-22.

**Failure:** The first detail patch matched a repeated mobile-log `Source` line and inserted L73-L75 between L51 and L52 instead of after L72.

**Evidence:** The immediate heading scan showed L73-L75 near line 778, followed by L52, while the ledger remained ordered.

**Root cause:** The patch repeated the non-unique-anchor mistake already documented by L40.

**Recovery:** Removed the misplaced blocks, re-anchored them on L72's unique final prevention sentence, added this correction, and reran the heading-order scan.

**Next-time rule:** For append-only ordered records, use the unique title or prevention sentence of the actual final entry, then scan all affected heading numbers immediately. A generic repeated source link is never a valid tail anchor.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L77. Scan the full untracked set after native argument splitting

**Observed at:** Exact time not captured; during the final working-tree check on 2026-07-22.

**Failure:** A long Playwright CLI argument failure had created the unexpected untracked file `web/div), box(.screen-content` outside both known browser artifact directories.

**Evidence:** `git status -sb` reported the quoted path after `web/output/playwright` and `web/.playwright-cli` had already been removed. The 434-byte file was untracked and contained Playwright CLI `eval` help output, confirming that split arguments had been interpreted as an output filename.

**Root cause:** The Windows native-argument reconstruction failure from L68 had side effects beyond the expected CLI session directory, and the first artifact cleanup only targeted known locations.

**Recovery:** Resolved the exact path, proved it stayed under `web`, confirmed Git tracked zero matching files, read its content, removed only that file, and reran full status.

**Next-time rule:** After any native CLI parsing or `--filename` ambiguity, inspect `git status --short -uall` across the entire repository before cleanup. Known artifact directories are not a sufficient scope check.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L78. Do not parse porcelain question marks as PowerShell wildcards

**Observed at:** Exact time not captured; during the final repository hygiene validation on 2026-07-22.

**Failure:** The first validator used `Where-Object { $_ -like '??*' }` to detect untracked paths and therefore classified all four normal ` M` status lines as untracked, then failed the hygiene gate.

**Evidence:** Its JSON output listed the ADR, engineering log, lessons file, and shared CSS under `Untracked` even though every line began with ` M`. The corrected status still contained exactly those four modified files and zero `?? ` lines.

**Root cause:** In PowerShell wildcard matching, each `?` means any single character; the pattern did not represent literal Git porcelain question marks.

**Recovery:** Replaced the wildcard expression with `StartsWith('?? ')` and reran the entire validation. Lesson order, conflict scan, artifact absence, and zero-untracked status then passed.

**Next-time rule:** Parse fixed Git porcelain prefixes with exact string methods such as `StartsWith`. If `-like` is unavoidable, escape every wildcard metacharacter explicitly.

**Source:** [Mobile viewport shell stabilization log](docs/engineering-log/2026-07-22-mobile-viewport-shell-stabilization.md)

### L79. Stop retrying the docs installer after an approved executable denial

**Observed at:** Exact time not captured; during the API-cost-control review on 2026-07-22.

**Failure:** The required OpenAI documentation MCP installation command could not launch `codex.exe`. The default attempt and the identical narrowly approved retry both returned `Access is denied` before the MCP server could be added.

**Evidence:** `codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp` exited 1 twice with PowerShell `NativeCommandFailed`; neither attempt reached MCP registration or network access.

**Root cause:** The current desktop execution boundary denied launching `codex.exe`. The failure did not establish an OpenAI documentation, network, or repository defect.

**Recovery:** Stopped retrying executable and shell variants, then used the skill's official-domain fallback for current OpenAI pricing and project-budget guidance and the connected Vercel documentation search for hosting-side controls.

**Next-time rule:** First inspect whether the OpenAI documentation MCP tools are callable. If they are absent and both the normal installer and the identical approved retry fail at executable launch, record zero MCP-install evidence, stop broadening execution, and use only official OpenAI-domain fallback sources for that turn.

**Source:** Current API-cost-control review; no separate engineering log was created.

### L80. Apply the foreach-output rule to read-only discovery too

**Observed at:** Exact time not captured; during the BYOK planning review on 2026-07-22.

**Failure:** A read-only command intended to count three installed Next.js documentation files placed a pipe directly after a statement-form PowerShell `foreach` loop and failed at parse time with `An empty pipe element is not allowed`.

**Evidence:** The command exited 1 before returning any file or line count. This repeated the exact PowerShell grammar class already recorded in L65.

**Root cause:** The discovery command treated the known `foreach` output rule as relevant only to status probes, even though the grammar restriction applies to every PowerShell statement-form loop.

**Recovery:** Assigned the loop output to the task-specific `$docCounts` variable and piped that variable to `ConvertTo-Json`. The corrected command returned line counts for all three intended local documentation files.

**Next-time rule:** For every PowerShell command, including read-only discovery, write `$results = foreach (...) { ... }` and pipe `$results` afterward. Do not type a pipe immediately after the closing brace of a statement-form loop.

**Source:** Current BYOK planning review; no separate engineering log was created.

### L81. Create the feature branch before the first implementation edit

**Observed at:** Exact time not captured; after the first BYOK implementation and test edits on 2026-07-22.

**Failure:** The local BYOK implementation began on `main` and accumulated uncommitted application, test, CI, and documentation changes before a feature branch was created.

**Evidence:** The implementation record captured `main` at starting commit `e2f316ba816c96ddf8eea891ba347abbbf30df39`. The user then asked why no branch had been opened. `git switch -c codex/byok-zero-api-demo` succeeded with the entire uncommitted change set preserved.

**Root cause:** The implementation treated the instruction not to deploy or publish as sufficient isolation and omitted the repository workflow step of creating a scoped branch before editing.

**Recovery:** Created `codex/byok-zero-api-demo` without stashing, cleaning, committing, or dropping any working-tree file. `git status -sb` confirmed all intended modifications now belong to the new branch.

**Next-time rule:** After mandatory read-only preflight and before the first working-tree edit, create the scoped `codex/` branch for any multi-file feature, even when the requested work is local-only and publication is prohibited.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L82. Separate background-process launch evidence from readiness polling

**Observed at:** Exact time not captured; during BYOK browser verification on 2026-07-22.

**Failure:** The first background Next.js dev-server command combined `Start-Process` with a 30-iteration HTTP readiness loop. The shell command timed out after 30 seconds without printing a PID or launch error, and port 3127 had no listener afterward.

**Evidence:** The command exited 124 at 30.1 seconds with no output. A separate `Get-NetTCPConnection -LocalPort 3127` check returned `NO_LISTENER_3127`.

**Root cause:** The command deferred all process evidence until after readiness polling and caught every request exception, so a launch failure was hidden behind the probe timeout.

**Recovery:** Split launch diagnosis from readiness verification and captured the subsequent `Start-Process` error directly before choosing a different process mechanism.

**Next-time rule:** Start a background server in one observable step and emit its PID or launch error immediately. Poll HTTP readiness only after a valid process handle or execution-cell ID exists.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L83. Stop using Start-Process after repeated duplicate environment-key failures

**Observed at:** Exact time not captured; immediately after L82 during BYOK browser verification on 2026-07-22.

**Failure:** A diagnostic `Start-Process` call failed with `Item has already been added. Key in dictionary: 'Path' Key being added: 'PATH'`, then the script tried to call `Refresh()` on a null process. An otherwise identical retry with `-UseNewEnvironment` failed the same way and repeated the null-handle error.

**Evidence:** Both commands returned the same PowerShell `ArgumentException`; neither produced a PID or started a listener.

**Root cause:** The current Windows PowerShell host exposes colliding case variants in the environment dictionary used by `Start-Process`. `-UseNewEnvironment` did not bypass that construction path. The scripts also failed to guard against a null process after launch failure.

**Recovery:** Stopped retrying `Start-Process`. Started `npm run dev` inside a managed execution cell, captured cell ID 3, and confirmed `GET http://127.0.0.1:3127/remember` returned 200 before browser work.

**Next-time rule:** If `Start-Process` reports duplicate `Path`/`PATH` keys, do not add more variants after one `-UseNewEnvironment` confirmation. Use a managed long-running execution cell, retain its cell ID, and terminate it explicitly after verification.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L84. Verify Playwright CLI commands against installed help

**Observed at:** Exact time not captured; during BYOK network verification on 2026-07-22.

**Failure:** The Playwright skill reference prescribed `network`, but the installed `@playwright/cli` rejected it as an unknown command and printed usage.

**Evidence:** The command exited 1. Installed help listed `requests`, `request`, and related commands under Network, with no `network` alias.

**Root cause:** The skill reference described an older CLI command surface than the package resolved by `npx`.

**Recovery:** Used `requests` and `requests --static`, which returned the current session's full request inventory.

**Next-time rule:** When a Playwright reference command is rejected, read the installed CLI help once and switch to the exact listed command. Do not retry historical aliases.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L85. Route-only analytics gating is insufficient across SPA navigation

**Observed at:** Exact time not captured; during the first no-API demo browser verification on 2026-07-22.

**Failure:** `AnalyticsGate` returned null on `/remember`, but the request inventory still showed `https://va.vercel-scripts.com/v1/script.debug.js` after navigating from Welcome to Remember in the same browser document.

**Evidence:** Playwright `requests --static` showed the Analytics script as request 32, followed by the client-side `/remember` navigation as request 33. The no-API demo itself made no `/api/remember` request.

**Root cause:** Unmounting the Analytics component does not unload or undo a third-party script already fetched and executed before client-side route navigation.

**Recovery:** Removed the Analytics component from the root layout and uninstalled `@vercel/analytics`. Updated interface and documentation claims to state that the app includes no third-party analytics script.

**Next-time rule:** For an SPA credential-entry surface, route-level conditional rendering is not a verified script-isolation boundary. Remove the third-party integration globally unless navigation forces and verifies a fresh document that never loads it.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L86. Do not pass JSON mock bodies through fragile Windows native quoting

**Observed at:** Exact time not captured; during BYOK error-path browser verification on 2026-07-22.

**Failure:** The first `playwright-cli route` mock used `--body` with inline JSON. Windows native argument reconstruction stripped the property-name quotes, so the client received invalid JSON and displayed `Expected property name or '}' in JSON at position 1`.

**Evidence:** The intercepted `/api/remember` request returned 401 without reaching the local route or OpenAI, but `response.json()` failed before the intended mocked error could be shown.

**Root cause:** JSON syntax was embedded in a native CLI argument whose quotes were reconstructed across PowerShell, `npx`, and the Playwright CLI.

**Recovery:** Removed the malformed route and created the mock inside the page context with `route.fulfill({ contentType: 'application/json', body: JSON.stringify(...) })`. The rerun displayed the intended bounded error and still made no provider call.

**Next-time rule:** On Windows, create nontrivial Playwright JSON mocks in a page-context route handler and use `JSON.stringify`. Reserve CLI `--body` for plain text or independently verified simple payloads.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L87. Match run-code input to the installed Playwright CLI contract

**Observed at:** Exact time not captured; immediately after L86 during BYOK browser verification on 2026-07-22.

**Failure:** The first recovery used the skill reference's bare `await page...` `run-code` form. The installed CLI rejected it with `SyntaxError: Unexpected identifier 'page'`.

**Evidence:** `playwright-cli run-code --help` stated that the argument must be a JavaScript function invoked with `page`.

**Root cause:** The skill example and installed CLI version use different `run-code` input contracts.

**Recovery:** Passed `async (page) => { ... }`; the CLI accepted it and installed the JSON-safe route handler.

**Next-time rule:** Before the first `run-code` use in a resolved Playwright CLI version, read that command's help and follow its exact function-or-snippet contract.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L88. Confirm child-process exit before npm clean installation

**Observed at:** Exact time not captured; during the final clean-install verification on 2026-07-22.

**Failure:** The first post-browser `npm ci` failed with `EPERM` while unlinking `node_modules/lightningcss-win32-x64-msvc/lightningcss.win32-x64-msvc.node`.

**Evidence:** npm exited 1 and identified the exact locked native binary. Later command-line inspection found PID 28940 still running this repository's `next start --hostname 127.0.0.1 -p 3128`, even though execution cell 4 had been terminated.

**Root cause:** Terminating the outer managed execution cell did not terminate its spawned Next.js child process, which retained a Windows file handle in `node_modules`.

**Recovery:** Resolved the exact repo-owned PID, stopped only PID 28940, confirmed it exited, and reran `npm ci` successfully. The subsequent test, lint, and build gates all passed.

**Next-time rule:** After browser verification, terminate the execution cell and separately inspect for repo-owned child processes before running `npm ci` or replacing native modules. A closed port alone is not sufficient process-exit evidence.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L89. Escalate only exact workspace process inspection after denial

**Observed at:** Exact time not captured; while diagnosing L88 on 2026-07-22.

**Failure:** The default-sandbox `Get-CimInstance Win32_Process` command returned `Access denied` before it could identify the process holding the native module.

**Evidence:** The command exited 1 with only `Access denied`; it did not return or change process state.

**Root cause:** Windows process command-line inspection crosses the current sandbox's read boundary.

**Recovery:** Requested narrow read-only approval, filtered `node.exe` command lines to the resolved workspace path, and found exactly one match. Stopped only that confirmed PID using the already approved exact process-stop operation.

**Next-time rule:** When default process command-line inspection is denied, request narrow read-only approval immediately. Filter to the exact resolved workspace and display the match before stopping any process.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L90. Keep read-only validators compatible with Windows PowerShell 5.1

**Observed at:** Exact time not captured; during final secret-scan triage on 2026-07-22.

**Failure:** A read-only classifier attempted to call static `SHA256.HashData()` and `Convert.ToHexString()`. Both methods were unavailable in the current PowerShell/.NET runtime, so the command exited 1 before returning its intended redacted classification.

**Evidence:** PowerShell reported one missing-method error for each API. The command did not print the sensitive line or change any file.

**Root cause:** The validator used modern .NET convenience APIs without checking the Windows PowerShell 5.1 runtime surface.

**Recovery:** Avoided the unnecessary hash and used Git baseline comparison plus a tighter key-value pattern. This distinguished the unchanged Markdown empty-variable example from the new test fixture without exposing any value.

**Next-time rule:** Write repository validators for the active PowerShell 5.1 surface. If hashing is actually required, use `SHA256.Create().ComputeHash()` and `BitConverter`; otherwise prefer a simpler baseline comparison.

**Source:** [BYOK and zero-API demo engineering log](docs/engineering-log/2026-07-22-byok-zero-api-demo.md)

### L91. Separate Vercel connector scope from linked CLI scope

**Observed at:** Exact time not captured; during the authorized old-deployment cleanup on 2026-07-23.

**Failure:** The connected Vercel deployment-list tool returned HTTP 404 `Project not found` for project ID `prj_9M5iVwQ2auFgIfFt8gFBZiZMPBlz` under the repository-linked team ID.

**Evidence:** The tool returned no deployment list and made no mutation. The linked Vercel CLI subsequently authenticated as `huiyingchung` and listed all 36 deployments for project `re-hello`.

**Root cause:** The exact connector authorization mismatch is unknown. The observed boundary is that the connector could not resolve a project that the independently authenticated linked CLI could access.

**Recovery:** Stopped using the connector as deletion evidence, authenticated the linked CLI, inspected the current Production deployment and aliases, and used only CLI-confirmed deployment URLs for removal.

**Next-time rule:** Treat connected-tool and CLI access as separate authorization scopes. A connector 404 is not proof that the linked Vercel project is absent; verify through the repository-linked CLI before making or abandoning a deployment decision.

**Source:** [Vercel deployment cleanup engineering log](docs/engineering-log/2026-07-23-vercel-deployment-cleanup.md)

### L92. Reject empty Vercel JSON before counting deployments

**Observed at:** Exact time not captured; immediately after L91 on 2026-07-23.

**Failure:** The first PowerShell compaction command redirected the Vercel CLI's machine output away, then wrapped `$null` in an array. It incorrectly printed `Total: 1`, one null target, and `CurrentExcluded: true`.

**Evidence:** The result contained no deployment URL, SHA, ref, or creation time. No removal command had started, so remote state remained unchanged.

**Root cause:** The command assumed JSON was on the retained native output stream and did not assert that a JSON object or `deployments` array existed before counting. In Windows PowerShell, `@($null).Count` is one.

**Recovery:** Discarded the false result, required explicit JSON start and end boundaries, and reran the read-only list query. The recovered list reported 36 deployments, the exact Current SHA, and 35 non-Current targets.

**Next-time rule:** Before selecting destructive Vercel targets from CLI JSON, require non-empty JSON boundaries, a real `deployments` array, the expected Current URL and SHA, and a non-null URL for every removal target. Never interpret `@($null).Count` as a resource count.

**Source:** [Vercel deployment cleanup engineering log](docs/engineering-log/2026-07-23-vercel-deployment-cleanup.md)

### L93. Classify restricted npm cache failure before Vercel mutation

**Observed at:** Exact time not captured; during recovery from L92 on 2026-07-23.

**Failure:** The first corrected `npx vercel ls` query failed before contacting Vercel because npm was in `only-if-cached` mode and had no cached response for the `vercel` package.

**Evidence:** npm returned `ENOTCACHED`, no JSON object was found, and no removal command had started.

**Root cause:** The restricted execution environment could not resolve the CLI package through the network for that attempt. This was tool availability, not Vercel project-state evidence.

**Recovery:** Repeated the unchanged read-only query with narrowly approved network access. It returned all 36 deployments, after which the explicitly enumerated 35 non-Current URLs were removed successfully and a final list confirmed one remaining deployment.

**Next-time rule:** When an unchanged Vercel read-only query fails only with `ENOTCACHED`, record zero project-state evidence and retry once with approved network access. Do not construct or run a removal command until the full live list has been recovered and the Current deployment is explicitly excluded.

**Source:** [Vercel deployment cleanup engineering log](docs/engineering-log/2026-07-23-vercel-deployment-cleanup.md)

### L94. Separate web-opener URL rejection from production availability

**Observed at:** Exact time not captured; during the final post-delete production check on 2026-07-23.

**Failure:** The generic web opener rejected `https://re-hello.vercel.app/` as unsafe and returned an internal error before sending a production request.

**Evidence:** The tool explicitly labeled the error non-retryable and provided no HTTP status, response headers, or page content. This was zero production availability evidence.

**Root cause:** The web tool's URL safety boundary rejected the deployment hostname. No application or Vercel runtime cause was observed.

**Recovery:** Loaded `System.Net.Http` explicitly in Windows PowerShell 5.1 and made one bounded `HttpClient` GET to the same URL. It returned HTTP 200 `text/html` with a 13,421-byte response.

**Next-time rule:** If a generic web opener rejects a Vercel deployment URL before transport, do not report the site as unavailable and do not retry the same tool. Use one bounded PowerShell 5.1 `HttpClient` request, record its exact status separately, and avoid routes that could trigger paid provider work.

**Source:** [Vercel deployment cleanup engineering log](docs/engineering-log/2026-07-23-vercel-deployment-cleanup.md)

### L95. Keep ripgrep paths outside multi-pattern expressions

**Observed at:** Exact time not captured; during the README BYOK refresh on 2026-07-23.

**Failure:** The first source fact-check placed several alternations, an incorrectly escaped `setApiKey("")` pattern, and the search paths inside one quoted ripgrep expression. Ripgrep returned `regex parse error: unopened group`.

**Evidence:** The command exited 1 before returning any route, key-lifecycle, model, cache, or analytics match. It changed no file.

**Root cause:** The composite regular expression mixed syntax-sensitive search terms with path arguments and relied on fragile nested escaping across PowerShell and ripgrep.

**Recovery:** Repeated the fact-check with one `-e` argument per pattern and explicit paths after the patterns. The corrected query returned the model name, note limits, key header, `store: false`, no-store cache header, key-clearing paths, and owner-key regression test.

**Next-time rule:** For a heterogeneous ripgrep fact-check, pass every search term through a separate `-e` argument and put paths after all patterns. Use fixed-string searches when regular-expression behavior is unnecessary.

**Source:** [README BYOK refresh engineering log](docs/engineering-log/2026-07-23-readme-byok-refresh.md)

### L96. Reuse installed Chrome for pinned Mermaid rendering

**Observed at:** Exact time not captured; during README diagram verification on 2026-07-23.

**Failure:** Mermaid CLI 11.16.0 parsed the invocation but stopped before rendering because Puppeteer could not find its expected `chrome-headless-shell` version in the user cache.

**Evidence:** The CLI reported `Could not find chrome-headless-shell (ver. 150.0.7871.24)` and produced no PNG. This was browser-runtime availability, not Mermaid syntax evidence.

**Root cause:** The pinned Mermaid package was available, but its separately managed default browser binary was not installed at the configured Puppeteer cache path.

**Recovery:** Confirmed that stable system Chrome was installed, supplied its exact executable path through a scoped Puppeteer configuration, and reran the unchanged Mermaid source. The renderer succeeded. Visual inspection then found the first left-to-right layout too wide, so the README source changed to a top-to-bottom layout and the final render was readable and unclipped.

**Next-time rule:** Before downloading a Mermaid-specific browser, check for an installed stable Chrome and pass it through `--puppeteerConfigFile`. Treat a missing default browser as zero diagram evidence; accept the diagram only after syntax render and visual inspection both pass.

**Source:** [README BYOK refresh engineering log](docs/engineering-log/2026-07-23-readme-byok-refresh.md)

### L97. Start long-lived Next.js verification servers in a managed yielded cell

**Observed at:** Exact time not captured; during bottom-navigation baseline verification on 2026-07-23.

**Failure:** The first `npm run dev` command used a short direct shell timeout. The wrapper timed out, but its Next.js child remained alive. A second managed start reported `EADDRINUSE` on port 3197, the orphaned server logged `EPIPE`, and a bounded HTTP request to `/people` timed out.

**Evidence:** Next.js identified the surviving server as PID 28228 on port 3197. The development log recorded `EPIPE: broken pipe, write`, and `Invoke-WebRequest` returned a timeout instead of an HTTP response.

**Root cause:** The timeout terminated the outer shell before the long-lived server was attached to a managed execution cell, while leaving its child process running without a usable output pipe.

**Recovery:** Stopped only PID 28228, restarted the unchanged server command in a yielded execution cell, confirmed HTTP 200 on `/people`, and completed browser verification. After terminating the cell, command-line inspection found three remaining Node children whose commands resolved inside this repository; stopped only those PIDs before the production build.

**Next-time rule:** Start every long-lived Next.js verification server through a managed yielded execution cell from the first attempt. On cleanup, terminate the cell and separately inspect exact repository-owned child command lines before building or replacing generated files.

**Source:** [Bottom navigation height stability engineering log](docs/engineering-log/2026-07-23-bottom-nav-stability.md)

### L98. Treat Playwright CLI `ENOTCACHED` as zero browser evidence

**Observed at:** Exact times not captured; during bottom-navigation browser verification and screenshot capture on 2026-07-23.

**Failure:** A Playwright snapshot command and a later screenshot-preparation command failed before browser interaction because npm cache mode was `only-if-cached` and no usable cached response for `@playwright/cli` was available.

**Evidence:** Both attempts exited with npm code `ENOTCACHED` and named the registry URL for `@playwright/cli`. Neither returned a page result, geometry measurement, or screenshot.

**Root cause:** The restricted execution environment intermittently could not resolve the wrapper's npm package, even though earlier CLI invocations in the same session had succeeded.

**Recovery:** Repeated the unchanged Playwright commands with narrowly approved npm-registry access. The snapshot, mobile matrix, and screenshot then completed successfully.

**Next-time rule:** An npm `ENOTCACHED` result from the Playwright wrapper is tool-availability evidence only. Do not infer browser or application state; retry the exact command once with narrow network approval and accept evidence only from the successful rerun.

**Source:** [Bottom navigation height stability engineering log](docs/engineering-log/2026-07-23-bottom-nav-stability.md)

### L99. Classify restricted temporary-directory errors before changing tests

**Observed at:** Exact time not captured; during the private single-user baseline on 2026-07-23.

**Failure:** The first baseline `npm test` could not create its temporary directory and exited with `EPERM`.

**Evidence:** Vitest stopped before running the existing tests. The identical command with approved filesystem access passed 2 files and 9 tests.

**Root cause:** The restricted execution sandbox blocked temporary-file creation; no application or test defect was observed.

**Recovery:** Repeated the unchanged test command with narrowly approved write access and accepted only that result as test evidence.

**Next-time rule:** When Vitest fails before collection with a sandbox-only `EPERM` on temporary storage, do not modify test code. Retry the exact command once with scoped filesystem approval and compare the command and output.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)

### L100. Classify restricted Next.js build-output errors before editing configuration

**Observed at:** Exact time not captured; during the private single-user baseline on 2026-07-23.

**Failure:** The first baseline `npm run build` could not write the `.next` output and exited with `EPERM`.

**Evidence:** Next.js stopped on generated-file creation. The identical command with approved workspace write access compiled, type-checked, and generated all 17 baseline routes.

**Root cause:** The restricted execution sandbox blocked expected build artifacts; no Next.js configuration defect was observed.

**Recovery:** Repeated the unchanged build with narrowly approved write access.

**Next-time rule:** If a Next.js build fails only while creating `.next` under a read-only sandbox, preserve source and configuration, rerun the identical build with scoped write approval, and report the two outcomes separately.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)

### L101. Wait for dynamic dashboard controls before resolving locators

**Observed at:** Exact time not captured; during authorized DeepInfra removal on 2026-07-23.

**Failure:** The first in-app browser lookup for Vercel's `More` button returned zero immediately after navigation even though a subsequent fresh snapshot showed exactly one button.

**Evidence:** No click occurred and no Vercel state changed during the failed lookup.

**Root cause:** The dynamic marketplace page had not finished rendering the control when the locator count was taken.

**Recovery:** Captured a fresh DOM snapshot, resolved the observed exact button, asserted a count of one, and clicked once.

**Next-time rule:** After navigating a dynamic dashboard, wait for a fresh semantic snapshot that visibly contains the target before counting or clicking it. A zero count during initial render is not evidence that the control is absent.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)

### L102. Do not send keyboard navigation to a non-focusable main landmark

**Observed at:** Exact time not captured; during authorized DeepInfra removal on 2026-07-23.

**Failure:** Attempting to press `End` on Vercel's `main` landmark failed because the focused input target no longer matched the resolved locator.

**Evidence:** The browser reported the locator press failure before any permission or integration action.

**Root cause:** A semantic landmark is not a stable focus target for keyboard scrolling in this browser bridge.

**Recovery:** Used an observed, uniquely focusable link for the navigation attempt, then switched to the official Vercel CLI when the dashboard still omitted its documented uninstall control.

**Next-time rule:** Send navigation keys only to an observed focusable control. If a dashboard omits a documented destructive control after a full semantic inspection, prefer its official authenticated CLI over coordinate or hidden-state workarounds.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)

### L103. Quote optional zsh paths instead of using unmatched globs

**Observed at:** Exact time not captured; during documentation fact-checking on 2026-07-23.

**Failure:** A read-only ripgrep command included the unmatched zsh path glob `web/.env*`; zsh returned `no matches found` and the compound fact-check exited 1.

**Evidence:** The preceding status and diff checks completed, but the intended text scan did not run.

**Root cause:** zsh expands unmatched globs before invoking the command.

**Recovery:** Inspected the known files with explicit paths and later added the intended tracked `web/.env.example`.

**Next-time rule:** For optional files under zsh, enumerate with `rg --files` first or pass explicit known paths. Do not put a possibly unmatched glob directly in a compound validation command.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)

### L104. Re-read exact source context after an apply-patch mismatch

**Observed at:** Exact time not captured; during German welcome-copy editing on 2026-07-23.

**Failure:** The first patch for `welcome/page.tsx` expected a sentence that differed from the current file, so `apply_patch` rejected the hunk without changing the file.

**Evidence:** The patch tool reported the missing expected lines.

**Root cause:** The edit used recalled wording instead of the exact current source.

**Recovery:** Read the relevant file section, rebuilt the patch against exact current lines, and applied it successfully.

**Next-time rule:** Before patching copy that has multiple historical versions, read the exact current block and use that text as patch context. After a context mismatch, do not guess a second time.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)

### L105. Run staged whitespace validation before committing documentation

**Observed at:** Exact time not captured; during publication preparation on 2026-07-23.

**Failure:** The first staged `git diff --cached --check` exited 2 because both newly added private-version documents had an extra blank line at end of file.

**Evidence:** Git named only `ADR-0009` line 85 and the engineering log line 76. No commit or push had occurred.

**Root cause:** The add-file patches left two newline-only final lines that normal Markdown reading did not reveal.

**Recovery:** Removed only the two blank lines, restaged the affected documents and lesson ledger, and repeated the staged validation.

**Next-time rule:** Always run `git diff --cached --check` after staging newly created Markdown files and before committing. Treat whitespace errors as publication blockers, not cosmetic warnings.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)

### L106. Anchor append-only lesson additions to the actual file tail

**Observed at:** Exact time not captured; during lesson-ledger cleanup on 2026-07-23.

**Failure:** New lessons L99-L104 were inserted before existing L98, and L105 was inserted after L99 because the patch context matched an earlier repeated source line rather than the end of the ledger.

**Evidence:** A heading scan showed `L99`, `L105`, `L100` through `L104`, then `L98`.

**Root cause:** The append patches used non-unique repeated Markdown context instead of the true final record.

**Recovery:** Moved only the uncommitted new lesson blocks after L98 and restored ascending L99-L106 order without changing any historical lesson.

**Next-time rule:** Before appending to a ledger, read its final heading and tail. Anchor the patch to that exact final record, then scan the resulting heading order before staging.

**Source:** [Private single-user version engineering log](docs/engineering-log/2026-07-23-private-single-user-version.md)
