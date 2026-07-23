# ADR-0009: Use Password-Gated Single-User PostgreSQL Storage

- **Status:** Accepted
- **Date:** 2026-07-23
- **Decision owner:** Benjamin
- **Scope:** Private access, durable storage, synchronization, portability, and hosting dependencies

## Context

The owner wants to use the application alone on an iPhone. Browser-only
storage is too fragile and does not move between devices. A native iOS build,
self-hosted server, or full account platform would add setup and maintenance
that are disproportionate for one user.

Vercel and Netlify functions do not provide a durable writable project
filesystem. A database is therefore still required for persistence.

## Decision

1. Protect every application and API route with one owner-configured password.
   A successful login creates a signed, HTTP-only, same-site cookie. No user
   table, email flow, OAuth provider, or password-reset service is added.
2. Store one versioned JSON document in Neon PostgreSQL through
   `@neondatabase/serverless`. The table is created lazily and has exactly one
   allowed row.
3. Keep the existing browser storage as a responsive local mirror. On first
   authenticated load, cloud data wins when present; otherwise existing local
   records are migrated to PostgreSQL. Later core-data changes upload a
   debounced complete snapshot.
4. Retain readable JSON import and export as the platform-exit path.
5. Keep OpenAI BYOK optional. Do not add DeepInfra or another AI integration.
6. Accept last-write-wins synchronization because this deployment has one
   owner. Revisit the storage model before adding another user or collaborative
   editing.

## Alternatives considered

### Browser storage only

Rejected because clearing Safari data or changing devices can lose records.

### SQLite inside the Vercel project

Rejected because the serverless filesystem is not durable shared storage.

### Supabase or a full authentication platform

Deferred. It can provide more features, but duplicates services that are not
needed for one password and one data document.

### Native Swift application

Deferred because signing, distribution, and ongoing iOS maintenance make it a
larger project. The mobile PWA remains the simplest iPhone surface.

### Self-hosted server

Rejected for now because it creates more operational work and a larger failure
surface than the owner wants.

## Consequences

Positive:

- Data survives browser clearing and is available across the owner's devices.
- The app stays small and can use free Vercel and Neon tiers at this scale.
- PostgreSQL and JSON backups preserve reasonable platform portability.
- Authentication requires only two configured secrets.

Tradeoffs:

- Vercel and Neon remain external runtime dependencies.
- The app has no password recovery or second factor.
- Snapshot synchronization can overwrite a simultaneous edit from another
  device.
- The database record and JSON backup are not end-to-end encrypted.

## Verification

- Pure authentication-token, password-comparison, schema, and calendar
  behavior are covered by Vitest.
- ESLint and a production Next.js build must pass without production secrets.
- A deployed smoke test must separately verify login, write, reload, and logout
  against the configured Neon database.
