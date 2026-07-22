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
