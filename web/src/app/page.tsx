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
  if (h < 5) return "Noch wach?";
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  if (h < 22) return "Guten Abend";
  return "Zeit zum Abschalten";
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
          : "Die Erinnerung konnte nicht aktualisiert werden."
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
          : "Der Bereich konnte nicht ausgeblendet werden."
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
                Bereit, jemanden festzuhalten?
              </h1>
            </div>
            <Link
              href="/settings"
              aria-label="Einstellungen"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <Icon as={SlidersHorizontal} size={16} flat />
            </Link>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
            <p className="text-balance font-serif text-lg leading-7 text-[var(--foreground)]">
              Noch ist hier nichts gespeichert.
            </p>
            <p className="mt-2 text-pretty text-xs leading-6 text-[var(--muted)]">
              Beginne mit einer Person oder öffne die Einführung erneut.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/remember" className="primary-button justify-center text-sm">
                Jemanden merken
              </Link>
              <Link href="/welcome" className="secondary-button justify-center text-sm">
                Einführung
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
                An wen denkst du?
              </h1>
            </div>
            <Link
              href="/settings"
              aria-label="Einstellungen"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <Icon as={SlidersHorizontal} size={16} flat />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/remember" className="primary-button justify-center text-sm">
              Jemanden merken
            </Link>
            <Link href="/prep" className="secondary-button justify-center text-sm">
              Auf Treffen vorbereiten
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
                Heute daran denken
              </h3>
            </div>
            <p className="-mt-1 text-xs text-[var(--muted)]">
              Ruhige Erinnerungen für heute.
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
                      Erledigt
                    </button>
                    <Link
                      href={`/people/${person.id}/recall`}
                      className="text-xs font-semibold text-[var(--accent-strong)]"
                    >
                      Karte öffnen →
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
              aria-label="Diesen Bereich ausblenden"
              className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <Icon as={X} size={14} flat />
            </button>
            <Link
              href={`/people/${featured.id}/recall`}
              className="card block border-[rgba(177,110,70,0.12)] bg-[var(--accent-soft)]"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Vor dem nächsten Treffen ansehen
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
              <h3>Kürzlich hinzugefügt</h3>
              <div className="flex items-center gap-3">
                <Link href="/people" className="text-sm text-[var(--accent-strong)]">
                  Alle ansehen
                </Link>
                <button
                  onClick={() => handleHide(SECTION.recentPeople)}
                  aria-label="Kürzlich hinzugefügt ausblenden"
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
              <h3>Kurz auffrischen</h3>
              <button
                onClick={() => handleHide(SECTION.worthRefresh)}
                aria-label="Kurz auffrischen ausblenden"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
              >
                <Icon as={X} size={14} flat />
              </button>
            </div>
            <p className="-mt-1 text-xs text-[var(--muted)]">
              Diese Menschen hast du länger nicht angesehen.
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
                  Ansehen →
                </span>
              </Link>
            ))}
          </section>
        )}

        {upcomingReminders.length > 0 && !isHidden(SECTION.upcoming) && (
          <section className="space-y-3">
            <div className="section-heading">
              <h3>Diese Woche in Verbindung bleiben</h3>
              <button
                onClick={() => handleHide(SECTION.upcoming)}
                aria-label="Erinnerungen dieser Woche ausblenden"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
              >
                <Icon as={X} size={14} flat />
              </button>
            </div>
            <p className="-mt-1 text-xs text-[var(--muted)]">
              Demnächst fällig.
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
                    {new Date(reminder.triggerDate).toLocaleDateString("de-CH", {
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
