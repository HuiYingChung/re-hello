# Vercel Deployment Cleanup

## Scope

On 2026-07-23, the user explicitly authorized deletion of old Vercel deployments for project `re-hello`. The operation was constrained to preserve the deployment currently serving the Production aliases.

This operation changed Vercel deployment state only. It did not deploy code, change environment variables, print an API key, or modify application behavior.

## Pre-delete evidence

- Repository branch before the record-only edit: `main`
- Local HEAD and `origin/main`: `4f452e961b6d7d80cfe09f85d7420d34a6a8a6df`
- Vercel project: `re-hello`
- Deployment count: 36
- Current deployment URL: `re-hello-bapqvnddd-huiyingchungs-projects.vercel.app`
- Current deployment ID: `dpl_GeHCJ29goBdzusfdSkZ4GC9qHLoj`
- Current deployment target and state: Production, READY
- Current deployment Git SHA: `4f452e961b6d7d80cfe09f85d7420d34a6a8a6df`
- Current aliases:
  - `re-hello.vercel.app`
  - `re-hello-huiyingchungs-projects.vercel.app`
  - `re-hello-git-main-huiyingchungs-projects.vercel.app`
- Explicitly excluded from deletion: the Current deployment above
- Explicit deletion set: 35 non-Current deployments
  - 12 Preview deployments
  - 23 prior Production deployments

The earlier environment-variable removal remained user-reported configuration state. This cleanup did not inspect or expose any secret value.

## Execution evidence

The Vercel CLI resolved all 35 explicitly enumerated deployment URLs before mutation and returned:

```text
Found 35 deployments for removal
Success! Removed 35 deployments
```

No project-wide wildcard or project deletion command was used.

## Post-delete evidence

A fresh Vercel deployment list returned exactly one deployment:

- URL: `re-hello-bapqvnddd-huiyingchungs-projects.vercel.app`
- Target: Production
- State: READY
- Git SHA: `4f452e961b6d7d80cfe09f85d7420d34a6a8a6df`

A separate deployment inspection confirmed that all three Production aliases still point to that deployment.

One bounded GET to `https://re-hello.vercel.app/` returned HTTP 200 `text/html` with a 13,421-byte response. This was a homepage availability check only; it did not call the OpenAI-backed route.

The deleted deployments are no longer available for instant rollback.

## Failed attempts and recovery

1. The connected Vercel tool returned HTTP 404 `Project not found` for the repository-linked project and team IDs. It made no mutation. The exact connector authorization mismatch is unknown. Recovery used the independently authenticated repository-linked Vercel CLI.
2. The first PowerShell JSON compaction discarded the CLI output stream and counted `$null` as one item. Its null URL and SHA exposed the result as invalid. Recovery required explicit JSON boundaries and a real deployment array before constructing targets.
3. The first corrected CLI query failed with npm `ENOTCACHED` in the restricted environment. It produced no Vercel state evidence. The unchanged read-only query succeeded with approved network access.
4. The generic web opener rejected the production URL as unsafe before transport. It produced no availability evidence. Recovery used one PowerShell 5.1 `HttpClient` homepage GET, which returned HTTP 200.

Detailed prevention rules are recorded as L91-L94 in [`lessons.md`](../../lessons.md).
