"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  PartyPopper,
  Briefcase,
  BookOpen,
  Coffee,
  Star,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/person-card";
import { Icon } from "@/components/icon";
import { getPeople, getLatestEncounter, getEncounters } from "@/lib/storage";
import { Person, Encounter } from "@/lib/types";

// Event types
// Picking the event type up front lets us suggest starters that actually
// fit the room. A coffee 1:1 needs different openers than a work mixer.

type EventType = "social" | "work" | "learning" | "casual";

const EVENT_TYPES: {
  id: EventType;
  label: string;
  hint: string;
  starterHeading: string;
  icon: LucideIcon;
}[] = [
  {
    id: "social",
    label: "Social mixer",
    hint: "Party, gathering, hangout",
    starterHeading: "For social mixers",
    icon: PartyPopper,
  },
  {
    id: "work",
    label: "Work or networking",
    hint: "Meeting, conference, professional mixer",
    starterHeading: "For work events",
    icon: Briefcase,
  },
  {
    id: "learning",
    label: "Class or hobby group",
    hint: "Workshop, club, course",
    starterHeading: "For class or club settings",
    icon: BookOpen,
  },
  {
    id: "casual",
    label: "Just coffee",
    hint: "1:1 or a friend of a friend",
    starterHeading: "For coffee chats",
    icon: Coffee,
  },
];

const STARTER_POOL: Record<EventType, string[]> = {
  social: [
    "What brought you here today?",
    "Have you been to one of these before?",
    "How do you know the host?",
    "Anyone you were hoping to run into?",
    "What's been the best part of your day?",
    "Where did you come in from?",
    "What's something you're looking forward to this week?",
  ],
  work: [
    "What are you working on these days?",
    "How did you get into this line of work?",
    "What's been keeping you busy lately?",
    "What's something you're excited about at work right now?",
    "How long have you been in this field?",
    "What brought you to this event in particular?",
    "What's a part of your job most people wouldn't guess?",
  ],
  learning: [
    "How did you get into this?",
    "Are you new to it, or been doing it a while?",
    "What got you started?",
    "Have you tried other groups or classes like this?",
    "What's been the hardest part so far?",
    "Anything you've learned recently that surprised you?",
    "Whose work in this space do you find interesting?",
  ],
  casual: [
    "What have you been up to lately?",
    "What's been making you laugh this week?",
    "Read or watched anything good recently?",
    "How's your week been treating you?",
    "What are you looking forward to?",
    "Anything new on your mind these days?",
    "What's the last thing that genuinely surprised you?",
  ],
};

const encouragements = [
  "One genuine conversation is worth more than ten business cards.",
  "You don't have to be the most social person in the room. Just be present.",
  "It's okay to leave early. Showing up is already enough.",
  "You already know more than you think. Trust yourself.",
];

// History mining
// Scan the user's own past encounters for recurring topics. If a word
// appears in talkedAbout / memorableDetail across at least 2 different
// encounters, it counts as a "theme" the user often talks about.
//
// This is intentionally lightweight - no NLP, no LLM, no network. Just
// word frequency with a stop-word filter. Good enough to surface the
// real patterns ("books", "running", "ramen") without pretending to be
// smarter than it is.

const STOP_WORDS = new Set([
  // articles, prepositions, conjunctions
  "the","a","an","and","or","but","of","to","in","on","at","for","with","by",
  "from","up","about","into","through","during","before","after","above","below",
  // forms of be / have / do
  "is","are","was","were","be","been","being","have","has","had","do","does","did",
  // pronouns / possessives
  "her","his","their","our","my","your","its","this","that","these","those",
  "you","he","she","it","we","they","me","him","them","us","i",
  // common qualifiers
  "as","not","no","so","if","then","than","too","very","just","also","both",
  // wh-words
  "what","how","when","where","why","which","who","whom",
  // determiners
  "more","most","some","any","all","each","every","other","another",
  // generic adjectives / adverbs
  "favorite","first","one","new","old","good","great","really","much","many",
  "small","large","big","little","next","last","real","whole","still","even",
  // modal / cognitive verbs
  "would","could","should","will","might","like","want","need","know","think",
  // very generic nouns
  "people","person","time","things","thing","stuff","way","kind","sort","lot",
  "year","years","month","months","week","weeks","day","days","hour","hours",
  // reporting verbs (used a lot in encounter notes)
  "talked","told","said","asked","mentioned","felt","seemed","made","make",
  // calendar / time-of-day context noise
  "morning","afternoon","evening","night","today","tomorrow","yesterday",
  "weekend","weekday","monday","tuesday","wednesday","thursday","friday",
  "saturday","sunday",
  // pronoun-ish leftovers
  "everyone","everything","anyone","anything","nothing","something","someone",
]);

function extractTopics(encounters: Encounter[], limit = 5): string[] {
  const counts = new Map<string, number>();
  // Only count each word ONCE per encounter, so a single chatty entry
  // can't dominate the top topics.
  encounters.forEach((e) => {
    const text = `${e.talkedAbout || ""} ${e.memorableDetail || ""}`.toLowerCase();
    const words = text.match(/[a-z]{4,}/g) || [];
    const seen = new Set<string>();
    words.forEach((w) => {
      if (STOP_WORDS.has(w) || seen.has(w)) return;
      seen.add(w);
      counts.set(w, (counts.get(w) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .filter(([, c]) => c >= 2) // must appear in at least 2 different encounters
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function PrepPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=event type, 1=faces, 2=starters, 3=encouragement
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [people, setPeople] = useState<{ person: Person; encounter: Encounter }[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const allPeople = getPeople();
    const withEnc = allPeople
      .map((p) => {
        const enc = getLatestEncounter(p.id);
        return enc ? { person: p, encounter: enc } : null;
      })
      .filter(Boolean) as { person: Person; encounter: Encounter }[];
    // Intentional client-only hydration from localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeople(withEnc);

    // Mine topics from ALL encounters, not just latest, so we get a
    // fuller picture of what this user actually talks about.
    setTopics(extractTopics(getEncounters()));
  }, []);

  // Pick 3 fresh starters whenever the step lands on the starters screen
  // and an event type is set. Wrapped in useMemo so a re-render of the
  // same step doesn't reshuffle while the user is reading.
  const starters = useMemo(() => {
    if (!eventType) return [];
    return pickRandom(STARTER_POOL[eventType], 3);
  }, [eventType, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pick one encouragement per session-start. Lazy useState init keeps the
  // impure Math.random call out of the render path so React 19's purity
  // checker stays happy, and guarantees a stable string across re-renders.
  const [encouragement] = useState(
    () => encouragements[Math.floor(Math.random() * encouragements.length)]
  );

  const starterHeading =
    EVENT_TYPES.find((e) => e.id === eventType)?.starterHeading ||
    "For new people";

  return (
    <AppShell>
      <div className="space-y-6 py-4">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i <= step ? "bg-[var(--accent)]" : "bg-[var(--surface-alt)]"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Pick event type */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-[var(--muted)]">
                Let&apos;s get you ready
              </p>
              <h1 className="text-balance font-serif text-2xl text-[var(--foreground)]">
                What kind of room are you walking into?
              </h1>
            </div>
            <div className="space-y-3">
              {EVENT_TYPES.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setEventType(ev.id);
                    setStep(1);
                  }}
                  className={`flex w-full items-center gap-4 rounded-[20px] border px-5 py-4 text-left transition-colors ${
                    eventType === ev.id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon as={ev.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--foreground)]">
                      {ev.label}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      {ev.hint}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Familiar faces */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-serif text-2xl text-[var(--foreground)]">
                Anyone you might see?
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tap to review their recall card
              </p>
            </div>
            {people.length > 0 ? (
              <div className="space-y-3">
                {people.slice(0, 5).map(({ person, encounter }) => (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}/recall`}
                    className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                  >
                    <Avatar
                      name={person.name}
                      color={person.color}
                      avatarStyle={person.avatarStyle}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {person.name}
                      </p>
                      {encounter.nextTimeAsk && (
                        <p className="truncate text-xs text-[var(--muted)]">
                          Ask: {encounter.nextTimeAsk}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No one saved yet. That&apos;s okay â€” you&apos;ll meet someone
                great today.
              </p>
            )}
            <button
              onClick={() => setStep(2)}
              className="primary-button w-full justify-center"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Conversation starters */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-serif text-2xl text-[var(--foreground)]">
                Conversation starters
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                A few ideas, just in case
              </p>
            </div>

            {/* Personalized starters from saved people */}
            {people.filter((p) => p.encounter.nextTimeAsk).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  For people you know
                </p>
                {people
                  .filter((p) => p.encounter.nextTimeAsk)
                  .slice(0, 3)
                  .map(({ person, encounter }) => (
                    <div
                      key={person.id}
                      className="rounded-[16px] bg-[var(--accent-soft)] px-4 py-3"
                    >
                      <p className="text-xs font-medium text-[var(--accent-strong)]">
                        {person.name}
                      </p>
                      <p className="mt-1 text-sm text-[var(--foreground)]">
                        &ldquo;{encounter.nextTimeAsk}&rdquo;
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {/* Themes mined from the user's own past conversations */}
            {topics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Things you often talk about
                </p>
                <div className="rounded-[16px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                    These come up a lot in your past conversations. If you
                    don&apos;t know what to ask, it&apos;s safe ground.
                  </p>
                </div>
              </div>
            )}

            {/* Generic starters â€” randomized, filtered by event type */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {starterHeading}
              </p>
              {starters.map((s, i) => (
                <div
                  key={i}
                  className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                >
                  <p className="text-sm text-[var(--foreground)]">
                    &ldquo;{s}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              className="primary-button w-full justify-center"
            >
              Almost ready
            </button>
          </div>
        )}

        {/* Step 3: Encouragement */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-8 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Icon as={Star} size={32} />
            </div>
            <p className="text-balance font-serif text-2xl leading-9 text-[var(--foreground)]">
              {encouragement}
            </p>
            <button
              onClick={() => router.push("/")}
              className="primary-button"
            >
              I&apos;m ready
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}



