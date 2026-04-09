nn# Rehello

> A gentle place for the people you meet.

Rehello is a personal social memory web app for introverts and the
socially anxious. It helps you capture someone right after you meet
them, refresh your memory before you see them again, and stay in
touch — without the pressure of a CRM.

This repo is the working portfolio build: a fully client-side
Next.js app with no backend, no accounts, and no tracking.

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
| **Remember flow** | Multi-step capture: name → context → details → mood → stay in touch. Each step is one decision. |
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
- **localStorage** for everything (no backend, no auth, no network)

The whole app is statically prerendered where possible. Anything
that depends on local data hydrates on the client.

It is also a **PWA** — installable to home screen, standalone
display mode, themed splash, and a serif-monogram icon.

---

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. On first load you can choose to seed
sample data from Settings — it creates five people with
intentionally overlapping conversation themes so the topic miner
in Prep has something interesting to surface.

```bash
npm run build   # production build
npm run lint    # eslint
```

---

## Project structure

```
src/
├── app/                    # Next.js routes
│   ├── page.tsx            # Home
│   ├── people/             # People list, profile, recall
│   ├── remember/           # Capture flow
│   ├── prep/               # Pre-event helper
│   ├── settings/           # Sort, hidden sections, data tools
│   ├── welcome/            # First-run intro
│   ├── icon.svg            # Favicon + PWA source
│   └── manifest.ts         # PWA manifest
├── components/             # Shared UI (StayInTouchPicker, Logo, …)
└── lib/
    └── storage.ts          # All localStorage reads/writes + types
```

All persistence flows through `src/lib/storage.ts`. There are no
other places that touch `localStorage` directly, which keeps the
data shape easy to evolve.

---

## Status

This is a portfolio project, not a shipping product. It exists to
explore what a softer, less-instrumented people tool could feel
like. There is no backend, no sync, and no plan to add one — the
honesty of "everything stays on this device" is part of the point.

Feedback and conversation welcome.
