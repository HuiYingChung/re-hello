"use client";

import Link from "next/link";
import { useReducer, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar, PersonCard } from "@/components/person-card";
import { Icon } from "@/components/icon";
import {
  getSortedPeople,
  getLatestEncountersMap,
  getDueReminders,
  getUpcomingReminders,
  dismissReminder,
  getPeopleWorthReviewing,
  getHiddenSections,
  hideSection,
} from "@/lib/storage";
import { Person, Encounter, Reminder } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";

function computeGreeting(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Winding down";
}

const SECTION = {
  recallPreview: "recall-preview",
  recentPeople: "recent-people",
  worthRefresh: "worth-refresh",
  upcoming: "upcoming",
} as const;

export default function HomePage() {
  const hydrated = useHydrated();
  const [, refresh] = useReducer((version: number) => version + 1, 0);
  const [actionError, setActionError] = useState<string | null>(null);
  const greeting = hydrated ? computeGreeting(new Date()) : null;
  const people: Person[] = hydrated ? getSortedPeople() : [];
  const encounters: Map<string, Encounter> = hydrated
    ? getLatestEncountersMap()
    : new Map();
  const dueReminders: Reminder[] = hydrated ? getDueReminders() : [];
  const upcomingReminders: Reminder[] = hydrated
    ? getUpcomingReminders(7)
    : [];
  const worthReviewing: Person[] = hydrated
    ? getPeopleWorthReviewing(3)
    : [];
  const hidden = hydrated ? getHiddenSections() : [];

  function handleDismiss(id: string) {
    try {
      setActionError(null);
      dismissReminder(id);
      refresh();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "We couldn't update that reminder."
      );
    }
  }

  function handleHide(id: string) {
    try {
      setActionError(null);
      hideSection(id);
      refresh();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "We couldn't update that section."
      );
    }
  }

  const isHidden = (id: string) => hidden.includes(id);

  const featured = [...people]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .find((p) => encounters.get(p.id)?.nextTimeAsk);
  const featuredEnc = featured ? encounters.get(featured.id) : undefined;

  if (people.length === 0) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-[var(--muted)]">{greeting ?? "\u00A0"}</p>
              <h1 className="text-balance font-serif text-[1.75rem] leading-tight text-[var(--foreground)]">
                Ready for someone new?
              </h1>
            </div>
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <Icon as={SlidersHorizontal} size={16} flat />
            </Link>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
            <p className="text-balance font-serif text-lg leading-7 text-[var(--foreground)]">
              Nothing saved here yet.
            </p>
            <p className="mt-2 text-pretty text-xs leading-6 text-[var(--muted)]">
              Start with one person, or replay the welcome tour if you want a fresh start.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/remember" className="primary-button justify-center text-sm">
                Remember someone
              </Link>
              <Link href="/welcome" className="secondary-button justify-center text-sm">
                Replay tour
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-[var(--muted)]">{greeting ?? "\u00A0"}</p>
              <h1 className="text-balance font-serif text-[1.75rem] leading-tight text-[var(--foreground)]">
                Who&apos;s on your mind?
              </h1>
            </div>
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <Icon as={SlidersHorizontal} size={16} flat />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/remember" className="primary-button justify-center text-sm">
              Remember someone
            </Link>
            <Link href="/prep" className="secondary-button justify-center text-sm">
              Prep for an event
            </Link>
          </div>
        </section>

        {actionError && (
          <p className="text-sm text-[#c47b7b]">{actionError}</p>
        )}

        {dueReminders.length > 0 && (
          <section className="space-y-3">
            <div className="section-heading">
              <h3 className="text-base font-semibold text-[var(--accent-strong)]">
                Reach out today
              </h3>
            </div>
            <p className="-mt-1 text-xs text-[var(--muted)]">
              Gentle nudges for today.
            </p>
            {dueReminders.map((reminder) => {
              const person = people.find((item) => item.id === reminder.personId);
              if (!person) return null;
              return (
                <div
                  key={reminder.id}
                  className="rounded-[20px] border border-[rgba(177,110,70,0.18)] bg-[var(--accent-soft)] p-4"
                >
                  <Link
                    href={`/people/${person.id}`}
                    className="flex items-center gap-3"
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
                      <p className="text-sm leading-6 text-[var(--foreground)]">
                        {reminder.message}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-3 flex justify-end gap-3">
                    <button
                      onClick={() => handleDismiss(reminder.id)}
                      className="text-xs text-[var(--muted)]"
                    >
                      Dismiss
                    </button>
                    <Link
                      href={`/people/${person.id}/recall`}
                      className="text-xs font-semibold text-[var(--accent-strong)]"
                    >
                      Open recall →
                    </Link>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {featured && featuredEnc?.nextTimeAsk && !isHidden(SECTION.recallPreview) && (
          <section className="relative">
            <button
              onClick={() => handleHide(SECTION.recallPreview)}
              aria-label="Hide this section"
              className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <Icon as={X} size={14} flat />
            </button>
            <Link
              href={`/people/${featured.id}/recall`}
              className="card block border-[rgba(177,110,70,0.12)] bg-[var(--accent-soft)]"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Review before you meet again
              </p>
              <div className="mb-3 flex items-center gap-3">
                <Avatar
                  name={featured.name}
                  color={featured.color}
                  avatarStyle={featured.avatarStyle}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {featured.name}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {featured.oneLiner}
                  </p>
                </div>
              </div>
              <p className="font-serif text-lg leading-8 text-[var(--foreground)]">
                &ldquo;{featuredEnc.nextTimeAsk}&rdquo;
              </p>
            </Link>
          </section>
        )}

        {people.length > 0 && !isHidden(SECTION.recentPeople) && (
          <section className="space-y-3">
            <div className="section-heading">
              <h3>Recent people</h3>
              <div className="flex items-center gap-3">
                <Link href="/people" className="text-sm text-[var(--accent-strong)]">
                  See all
                </Link>
                <button
                  onClick={() => handleHide(SECTION.recentPeople)}
                  aria-label="Hide Recent people"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                >
                  <Icon as={X} size={14} flat />
                </button>
              </div>
            </div>
            {people.slice(0, 3).map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                encounter={encounters.get(person.id)}
              />
            ))}
          </section>
        )}

        {worthReviewing.length > 0 && !isHidden(SECTION.worthRefresh) && (
          <section className="space-y-3">
            <div className="section-heading">
              <h3>Worth a quick refresh</h3>
              <button
                onClick={() => handleHide(SECTION.worthRefresh)}
                aria-label="Hide Worth a quick refresh"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
              >
                <Icon as={X} size={14} flat />
              </button>
            </div>
            <p className="-mt-1 text-xs text-[var(--muted)]">
              You haven&apos;t looked at these in a while.
            </p>
            {worthReviewing.map((person) => (
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
                  <p className="text-xs text-[var(--muted)]">
                    {person.oneLiner}
                  </p>
                </div>
                <span className="text-xs text-[var(--accent-strong)]">
                  Refresh →
                </span>
              </Link>
            ))}
          </section>
        )}

        {upcomingReminders.length > 0 && !isHidden(SECTION.upcoming) && (
          <section className="space-y-3">
            <div className="section-heading">
              <h3>Stay in touch this week</h3>
              <button
                onClick={() => handleHide(SECTION.upcoming)}
                aria-label="Hide Stay in touch this week"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
              >
                <Icon as={X} size={14} flat />
              </button>
            </div>
            <p className="-mt-1 text-xs text-[var(--muted)]">
              Coming up soon.
            </p>
            {upcomingReminders.map((reminder) => {
              const person = people.find((item) => item.id === reminder.personId);
              if (!person) return null;
              return (
                <Link
                  key={reminder.id}
                  href={`/people/${person.id}`}
                  className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3"
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
                    <p className="text-sm text-[var(--muted)]">
                      {reminder.message}
                    </p>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    {new Date(reminder.triggerDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
