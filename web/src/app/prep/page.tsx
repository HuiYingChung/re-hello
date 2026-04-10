"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  PartyPopper,
  Briefcase,
  BookOpen,
  Coffee,
  ChevronLeft,
  Star,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/person-card";
import { Icon } from "@/components/icon";
import { getPeople, getLatestEncounter, getEncounters } from "@/lib/storage";
import { Person, Encounter } from "@/lib/types";

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

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","at","for","with","by",
  "from","up","about","into","through","during","before","after","above","below",
  "is","are","was","were","be","been","being","have","has","had","do","does","did",
  "her","his","their","our","my","your","its","this","that","these","those",
  "you","he","she","it","we","they","me","him","them","us","i",
  "as","not","no","so","if","then","than","too","very","just","also","both",
  "what","how","when","where","why","which","who","whom",
  "more","most","some","any","all","each","every","other","another",
  "favorite","first","one","new","old","good","great","really","much","many",
  "small","large","big","little","next","last","real","whole","still","even",
  "would","could","should","will","might","like","want","need","know","think",
  "people","person","time","things","thing","stuff","way","kind","sort","lot",
  "year","years","month","months","week","weeks","day","days","hour","hours",
  "talked","told","said","asked","mentioned","felt","seemed","made","make",
  "morning","afternoon","evening","night","today","tomorrow","yesterday",
  "weekend","weekday","monday","tuesday","wednesday","thursday","friday",
  "saturday","sunday",
  "everyone","everything","anyone","anything","nothing","something","someone",
]);

function extractTopics(encounters: Encounter[], limit = 5): string[] {
  const counts = new Map<string, number>();
  encounters.forEach((encounter) => {
    const text = `${encounter.talkedAbout || ""} ${encounter.memorableDetail || ""}`.toLowerCase();
    const words = text.match(/[a-z]{4,}/g) || [];
    const seen = new Set<string>();
    words.forEach((word) => {
      if (STOP_WORDS.has(word) || seen.has(word)) return;
      seen.add(word);
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function isEventType(value: string | null): value is EventType {
  return value === "social" || value === "work" || value === "learning" || value === "casual";
}

function clampStep(value: string | null, hasEventType: boolean): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return 0;
  if (parsed < 0) return 0;
  if (!hasEventType) return 0;
  return Math.min(parsed, 3);
}

function PrepFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventTypeParam = searchParams.get("eventType");
  const initialEventType: EventType | null = isEventType(eventTypeParam)
    ? eventTypeParam
    : null;
  const [step, setStep] = useState(() =>
    clampStep(searchParams.get("step"), initialEventType !== null)
  );
  const [eventType, setEventType] = useState<EventType | null>(initialEventType);
  const [people, setPeople] = useState<{ person: Person; encounter: Encounter }[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const allPeople = getPeople();
    const withEnc = allPeople
      .map((person) => {
        const encounter = getLatestEncounter(person.id);
        return encounter ? { person, encounter } : null;
      })
      .filter(Boolean) as { person: Person; encounter: Encounter }[];

    setPeople(withEnc);
    setTopics(extractTopics(getEncounters()));
  }, []);

  useEffect(() => {
    const nextEventTypeParam = searchParams.get("eventType");
    const nextEventType: EventType | null = isEventType(nextEventTypeParam)
      ? nextEventTypeParam
      : null;
    const nextStep = clampStep(searchParams.get("step"), nextEventType !== null);

    setEventType((current) => (current === nextEventType ? current : nextEventType));
    setStep((current) => (current === nextStep ? current : nextStep));
  }, [searchParams]);

  const starters = useMemo(() => {
    if (!eventType) return [];
    return pickRandom(STARTER_POOL[eventType], 3);
  }, [eventType, step]);

  const [encouragement] = useState(
    () => encouragements[Math.floor(Math.random() * encouragements.length)]
  );

  const starterHeading =
    EVENT_TYPES.find((item) => item.id === eventType)?.starterHeading || "For new people";

  function goToStep(nextStep: number, nextEventType = eventType) {
    const params = new URLSearchParams();

    if (nextEventType) {
      params.set("eventType", nextEventType);
      params.set("step", String(Math.min(Math.max(nextStep, 0), 3)));
    }

    const href = params.toString() ? `/prep?${params.toString()}` : "/prep";
    setEventType(nextEventType);
    setStep(nextEventType ? Math.min(Math.max(nextStep, 0), 3) : 0);
    router.replace(href, { scroll: false });
  }

  function goBack() {
    if (step === 0) {
      router.push("/");
      return;
    }
    goToStep(step - 1);
  }

  const canJumpToStep = (targetStep: number) => {
    if (targetStep === 0) return true;
    if (!eventType) return false;
    return targetStep <= step;
  };

  return (
    <AppShell>
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <Icon as={ChevronLeft} size={14} flat />
            <span>{step === 0 ? "Home" : "Back"}</span>
          </button>
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((index) => {
              const isActive = index === step;
              const isAvailable = canJumpToStep(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => isAvailable && goToStep(index)}
                  disabled={!isAvailable}
                  aria-label={`Go to step ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-[var(--accent)]"
                      : index < step
                        ? "bg-[var(--accent)]/55"
                        : "bg-[var(--surface-alt)]"
                  } ${isAvailable ? "cursor-pointer" : "cursor-default opacity-70"}`}
                />
              );
            })}
          </div>
          <div className="w-12" />
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-[var(--muted)]">Let&apos;s get you ready</p>
              <h1 className="text-balance font-serif text-2xl text-[var(--foreground)]">
                What kind of room are you walking into?
              </h1>
            </div>
            <div className="space-y-3">
              {EVENT_TYPES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToStep(1, item.id)}
                  className={`flex w-full items-center gap-4 rounded-[20px] border px-5 py-4 text-left transition-colors ${
                    eventType === item.id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon as={item.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--foreground)]">
                      {item.label}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">{item.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-serif text-2xl text-[var(--foreground)]">Anyone you might see?</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tap to review their recall card, then come right back here.
              </p>
            </div>
            {people.length > 0 ? (
              <div className="space-y-3">
                {people.slice(0, 5).map(({ person, encounter }) => {
                  const params = new URLSearchParams({ step: "1" });
                  if (eventType) params.set("eventType", eventType);
                  const returnTo = `/prep?${params.toString()}`;

                  return (
                    <Link
                      key={person.id}
                      href={`/people/${person.id}/recall?returnTo=${encodeURIComponent(returnTo)}`}
                      className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                    >
                      <Avatar
                        name={person.name}
                        color={person.color}
                        avatarStyle={person.avatarStyle}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{person.name}</p>
                        {encounter.nextTimeAsk && (
                          <p className="truncate text-xs text-[var(--muted)]">Ask: {encounter.nextTimeAsk}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No one saved yet. That&apos;s okay - you&apos;ll meet someone great today.
              </p>
            )}
            <button onClick={() => goToStep(2)} className="primary-button w-full justify-center">
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-serif text-2xl text-[var(--foreground)]">Conversation starters</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">A few ideas, just in case</p>
            </div>

            {people.filter((item) => item.encounter.nextTimeAsk).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  For people you know
                </p>
                {people
                  .filter((item) => item.encounter.nextTimeAsk)
                  .slice(0, 3)
                  .map(({ person, encounter }) => (
                    <div
                      key={person.id}
                      className="rounded-[16px] bg-[var(--accent-soft)] px-4 py-3"
                    >
                      <p className="text-xs font-medium text-[var(--accent-strong)]">{person.name}</p>
                      <p className="mt-1 text-sm text-[var(--foreground)]">&ldquo;{encounter.nextTimeAsk}&rdquo;</p>
                    </div>
                  ))}
              </div>
            )}

            {topics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Things you often talk about
                </p>
                <div className="rounded-[16px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                    These come up a lot in your past conversations. If you don&apos;t know what to ask, it&apos;s safe ground.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {starterHeading}
              </p>
              {starters.map((starter, index) => (
                <div
                  key={index}
                  className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                >
                  <p className="text-sm text-[var(--foreground)]">&ldquo;{starter}&rdquo;</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => goToStep(1)} className="secondary-button justify-center">
                Review people again
              </button>
              <button onClick={() => goToStep(3)} className="primary-button w-full justify-center">
                Almost ready
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-8 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Icon as={Star} size={32} />
            </div>
            <p className="text-balance font-serif text-2xl leading-9 text-[var(--foreground)]">
              {encouragement}
            </p>
            <div className="flex w-full flex-col gap-2">
              <button onClick={() => goToStep(2)} className="secondary-button justify-center">
                Back to starters
              </button>
              <button onClick={() => router.push("/")} className="primary-button justify-center">
                I&apos;m ready
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function PrepPage() {
  return (
    <Suspense fallback={null}>
      <PrepFlow />
    </Suspense>
  );
}
