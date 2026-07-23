# Helloagain

Helloagain is a private, mobile-first memory app for people and relationships.
It is based on [Rehello](https://github.com/HuiYingChung/re-hello) and is
designed for one owner rather than anonymous public use.

## What this fork adds

- one private password for the entire app;
- durable PostgreSQL storage through Neon;
- a local browser mirror for responsive use and migration of existing data;
- readable JSON import and export for platform independence;
- relationship categories, tags, birthdays, contact details, and notes;
- multiple moments per person and quick capture for existing people;
- one-time and recurring reminders;
- `.ics` calendar export for iPhone Calendar and other calendar apps;
- a primarily German interface;
- optional bring-your-own-key OpenAI structuring, with no DeepInfra dependency.

The application is intentionally small. It does not include multi-user
accounts, social login, analytics, push notifications, or an additional auth
platform.

## Architecture

```text
iPhone / Browser
├── German Next.js interface
├── signed, HTTP-only session cookie
├── local browser mirror
└── authenticated /api/data
    └── one JSON document in Neon PostgreSQL

Optional free-form AI structuring
└── authenticated /api/remember
    └── visitor-provided OpenAI API key for that request only
```

Neon stores one versioned JSON document because this is a single-user app.
That keeps the schema and migrations deliberately small while still using a
real, portable PostgreSQL database. The database can later be exported or
moved away from Neon.

## Required environment variables

Copy [`web/.env.example`](web/.env.example) to `web/.env.local` for local use.
Never commit the real values.

| Variable | Purpose |
| --- | --- |
| `APP_PASSWORD` | Your private login password. Use a long, unique passphrase. |
| `AUTH_SECRET` | Random signing secret for the session cookie. Use at least 32 random bytes. |
| `DATABASE_URL` | Neon PostgreSQL connection string. |

No server-owned OpenAI key is accepted. If you choose AI structuring, the
one-time key stays in page state for that attempt and is not written to the
database, browser storage, URL, or JSON backup.

## Run locally

```bash
cd web
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Verification

```bash
cd web
npm test
npm run lint
npm run build
```

GitHub Actions runs the same checks on Node.js 24 without production secrets.
The build does not contact Neon or OpenAI.

## Vercel

Use these project settings:

- Framework Preset: Next.js
- Root Directory: `web`
- Node.js: 24.x
- Environment variables: `APP_PASSWORD`, `AUTH_SECRET`, and `DATABASE_URL`

For iPhone use, open the production URL in Safari, choose **Teilen**, then
**Zum Home-Bildschirm**.

## Data and privacy boundary

- People, moments, and reminders are stored in the owner-controlled Neon
  database and mirrored in the current browser.
- JSON backups are readable and therefore should be stored privately.
- The application contains no third-party analytics script.
- Vercel and Neon still process normal hosting and database traffic; this is
  not end-to-end encryption.
- OpenAI receives only a note the owner explicitly submits for structuring,
  together with the one-time API key supplied for that request.
- Calendar exports are local `.ics` downloads. Helloagain does not obtain
  access to the iPhone calendar.

## Current limitations

- The data API uses last-write-wins synchronization, which is appropriate for
  one owner but not for simultaneous multi-user editing.
- Reminders appear in Helloagain. iPhone notifications require importing the
  exported calendar event; there is no push service.
- The browser mirror is not an offline guarantee because no service worker is
  included.
- A strong `APP_PASSWORD` is important. There is no password-reset email or
  second factor.

The architecture decision and implementation evidence are recorded in
[`docs/decisions/ADR-0009-private-single-user-cloud-storage.md`](docs/decisions/ADR-0009-private-single-user-cloud-storage.md)
and
[`docs/engineering-log/2026-07-23-private-single-user-version.md`](docs/engineering-log/2026-07-23-private-single-user-version.md).
