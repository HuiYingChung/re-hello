# re-hello MVP Spec

## Product Summary

`re-hello` is a social memory app for people who meet someone meaningful, then forget the details or struggle to follow up naturally.

This is not a CRM.
This is a lightweight personal memory tool that helps users:

- capture a new connection while memory is fresh
- recall that person before the next meeting
- continue the relationship with a natural prompt

Core promise:

Prepare before. Connect during. Reflect after.

## Target User

Primary MVP target:

- students and early-career professionals in high-volume networking situations
- people who meet many new people in events, career fairs, clubs, meetups, and happy hours
- people who care about remembering others but do not want a sales-like tool

Secondary users after MVP:

- introverts with social fatigue
- people who want warmer, more genuine follow-up support
- bilingual and cross-cultural users

## MVP Goal

Help a user go from:

`I met someone interesting and do not want to forget them`

to:

`I can remember who they are, what mattered, and what to say next`

within 1 to 3 minutes.

## Core User Loop

1. User meets someone.
2. User quickly records the person after the interaction.
3. App turns that memory into a clean person card.
4. Before the next meeting, user opens a recall card.
5. App suggests a natural follow-up angle.

If this loop works well, the product has value.

## MVP Scope

### In Scope

- add a person with guided prompts
- view a list of saved people
- search people by name, tag, place, and topic
- view a person detail page
- show a compact recall card for fast review
- optional reminder / follow-up date
- simple follow-up suggestion based on saved notes

### Out of Scope for V1

- advanced AI coaching
- deep event prep workflows
- calendar integrations
- meetup or Eventbrite integrations
- social energy tracking
- multi-user features
- full voice pipeline
- push notification system beyond a simple reminder model

## Product Principles

- warm, human language
- never sound like sales software
- low friction capture
- fast recall before real-world interaction
- one strong job per screen

## Main Screens

### 1. Home

Purpose:

- give the user a clear next action
- surface who to review and who to follow up with

Sections:

- quick add button
- people to review soon
- recent people
- upcoming reminders

### 2. Add Person

Purpose:

- guide the user through lightweight memory capture

Fields:

- name
- short tag
- where met
- first impression
- what you talked about
- memorable detail
- what to ask next time
- optional reminder date

Rules:

- required: name, where met
- recommended: talked about, next ask
- optional: impression, detail, reminder

### 3. People List

Purpose:

- browse and find saved people later

Features:

- search bar
- sort by recent
- filter by reminder / recently added / tagged

### 4. Person Detail

Purpose:

- show the full saved memory in a readable, warm format

Sections:

- header identity block
- first impression
- talked about
- memorable detail
- next question
- reminder

### 5. Recall Card

Purpose:

- let the user review someone in under 10 seconds before meeting again

Content:

- who they are
- where you met
- key topics
- one memorable detail
- one suggested next question

### 6. Reminders

Purpose:

- show follow-ups in one place

Features:

- simple chronological list
- done / snooze later can be V1.5 if needed

## Suggested Information Architecture

- `/`
- `/people`
- `/people/:id`
- `/people/:id/recall`
- `/add`
- `/reminders`

## Data Model

### Person

- `id`
- `name`
- `tag`
- `whereMet`
- `metAtDate`
- `firstImpression`
- `talkedAbout`
- `memorableDetail`
- `nextAsk`
- `followUpDate`
- `createdAt`
- `updatedAt`

### Optional Derived Fields

- `searchText`
- `daysSinceMet`
- `daysUntilFollowUp`
- `hasReminder`

## AI Usage

AI should support the product, not dominate it.

Best MVP use:

- rewrite raw notes into cleaner phrasing
- generate a concise recall summary
- suggest one natural follow-up question

Avoid in MVP:

- over-automated personality analysis
- fake certainty
- too many generated suggestions

## Recommended Tech Stack

For speed and good UI quality:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui only if used sparingly
- SQLite or Supabase for storage
- Vercel for deployment

If we want the fastest local-first MVP:

- Next.js + local JSON or SQLite first
- then move to Supabase after the core loop is validated

## Recommended Build Order

### Phase 1

- project setup
- global theme and layout
- home page shell
- add person flow
- person detail page
- recall card

### Phase 2

- people list
- search
- reminders page
- persistence

### Phase 3

- AI cleanup / suggestion helpers
- polish states
- onboarding

## Key Risks

### 1. Overbuilding

If we add coaching, event prep, voice, and AI too early, the core value gets blurry.

### 2. Friction

If adding a person takes too long, users will skip it after events.

### 3. Empty recall cards

If optional fields are too often blank, the recall experience will feel weak.

### 4. Wrong tone

If the UI feels like contact management software, the product loses its emotional edge.

## Success Criteria for MVP

- a user can add a person in under 90 seconds
- a user can review a recall card in under 10 seconds
- saved information is enough to trigger a real follow-up
- users describe the app as warm, useful, and not like CRM

## Immediate Next Step

Build a functional product around this exact loop:

`Add Person -> Save Person -> View Detail -> Open Recall Card -> Follow Up`

Everything else is secondary.
