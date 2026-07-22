# Rehello

> A gentle place for the people you meet.

Rehello is a personal social memory web app for introverts and the
socially anxious. It helps you capture someone right after you meet
them, refresh your memory before you see them again, and stay in
touch — without the pressure of a CRM.

This repo is the working portfolio build: a local-first Next.js app
with no accounts and no tracking. Saved people and moments stay in
the browser; one server-side route uses GPT-5.6 to shape an optional
Quick Remember note into a recall card.

---

## Why it exists

Most "people tools" are built for salespeople. They assume you want
a pipeline, a deal stage, a follow-up cadence. For someone who finds
socializing genuinely tiring, that framing makes the whole idea of
remembering people feel transactional and worse, not better.

Rehello is the opposite shape:

- **Remember** — a soft, prompt-led capture flow (no blank fields).
- **Recall** — a one-card refresh before you see someone again,
  spaced so you do not over-rehearse.
- **Stay in touch** — a single chip-based picker (a week, two weeks,
  a month, or pick a date) that turns "I should reach out" into a
  one-tap reminder.
- **Prep** — for events, mixers, and coffee chats: a small set of
  conversation starters tuned to the kind of event, plus topics
  mined from your own past encounters.

The whole app is designed to feel like a notebook a kind friend
left on your desk — quiet, warm, never nagging.

---

## Design principles

1. **Low blank-page anxiety.** Every input has a placeholder, an
   example, or a chip set. Nothing ever asks "tell me about this
   person" with an empty box.
2. **Show before ask.** Sections explain what they are for (e.g.
   "people you have not refreshed in a while") so the user is
   never guessing why something appeared.
3. **Reversible by default.** Hide a home section, change the sort,
   reorder by drag — every choice has a Settings escape hatch.
4. **No streaks, no scoring.** There are no badges, no "you missed
   a day" guilt loops, no notifications begging you to come back.
5. **Hand-drawn warmth.** Icons get a subtle wobble filter, the
   palette is warm cream and clay, and the wordmark is a serif with
   a single accent dot — small humanizing details over cold UI.

---

## Feature tour

| Surface | What it does |
| --- | --- |
| **Home** | Greeting that adapts to time of day, a featured person worth refreshing, recall preview, recent people, "worth a quick refresh", and upcoming reminders. Each section can be hidden. |
| **People** | Sortable list (Recent / A–Z / Last met / Custom drag-to-reorder) with search. |
| **Person profile** | Name, tags, color, encounter history, "Stay in touch" picker with reminder list. |
| **Remember flow** | Paste one messy note and let GPT-5.6 shape a recall card, or use the original prompt-by-prompt capture flow. |
| **Recall** | Spaced-review card that surfaces what to ask about next time, plus an inline Stay in touch picker. |
| **Prep** | Pick an event type (social mixer / work / class / coffee), get starters tuned to that context plus topics mined from your own conversation history. |
| **Settings** | Restore hidden sections, load sample data, clear all data, view storage size. |

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **lucide-react** for icons
- **@dnd-kit** for drag-to-reorder
- **localStorage** for people, encounters, and reminders
- **OpenAI Responses API** with GPT-5.6 Terra for optional Quick Remember

People, encounters, and reminders still persist in `localStorage`.
Quick Remember sends only the note a user explicitly submits to the
server-side API route; the OpenAI key is never exposed to the browser.

The whole app is statically prerendered where possible. Anything
that depends on local data hydrates on the client.

It is also a **PWA** — installable to home screen, standalone
display mode, themed splash, and a serif-monogram icon.

---

## Running it

```bash
cd web
npm install
npm run dev
```

To use Quick Remember locally, copy `.env.example` to `.env.local`
and set `OPENAI_API_KEY`. Never commit `.env.local`.

Open <http://localhost:3000>. On first load you can choose to seed
sample data from Settings — it creates five people with
intentionally overlapping conversation themes so the topic miner
in Prep has something interesting to surface.

```bash
npm run build   # production build
npm run lint    # eslint
```

GitHub Actions runs `npm ci`, `npm run lint`, and `npm run build`
on every push and pull request using Node.js 24. The CI workflow does
not receive `OPENAI_API_KEY` and does not make a live OpenAI request.

---

## Documentation

- [`docs/README.md`](docs/README.md) — documentation map and source-of-truth rules
- [`docs/decisions/`](docs/decisions/) — detailed architecture and product decisions
- [`docs/engineering-log/`](docs/engineering-log/) — timestamped engineering evidence
- [`docs/product/`](docs/product/) — product specifications
- [`docs/research/`](docs/research/) — historical feedback and research
- [`docs/prototypes/`](docs/prototypes/) — archived standalone explorations

---

## Project structure

```text
re-hello/
├── docs/
│   ├── decisions/          # ADRs: why a direction was chosen
│   ├── engineering-log/    # Timestamped work and verification records
│   ├── product/            # Product specifications
│   ├── research/           # Historical feedback
│   └── prototypes/         # Early standalone explorations, not deployed
├── web/                    # Current Next.js application
│   ├── public/             # PWA icons and static assets
│   └── src/
│       ├── app/            # Routes and server Route Handlers
│       ├── components/     # Shared interface components
│       └── lib/            # Storage, types, and client utilities
└── README.md
```

All persistence flows through `web/src/lib/storage.ts`. There are no
other places that touch `localStorage` directly, which keeps the
data shape easy to evolve.

---

## Status

This is a portfolio project, not a shipping product. It exists to
explore what a softer, less-instrumented people tool could feel
like. There are no accounts or sync; saved people remain on the
device, while the optional Quick Remember note is processed through
the OpenAI API.

Feedback and conversation welcome.
