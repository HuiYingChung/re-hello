"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AvatarPicker } from "@/components/avatar-picker";
import { Avatar } from "@/components/person-card";
import {
  getPerson,
  getEncounters,
  deletePerson,
  savePerson,
  getReminders,
  dismissReminder,
  randomAvatarStyle,
} from "@/lib/storage";
import { Person, Encounter, Reminder } from "@/lib/types";
import { Mood, MOOD_LABEL, type MoodValue } from "@/components/mood";
import { StayInTouchPicker } from "@/components/stay-in-touch-picker";

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOneLiner, setEditOneLiner] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function refresh() {
    const p = getPerson(id);
    if (!p) {
      router.replace("/people");
      return;
    }
    setPerson(p);
    setEncounters(getEncounters(id));
    setReminders(getReminders().filter((r) => r.personId === id));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!person) return null;

  const latest = encounters[0];

  const moodsLogged = encounters.filter((e) => e.mood);
  const avgMood =
    moodsLogged.length > 0
      ? Math.round(
          moodsLogged.reduce((sum, e) => sum + (e.mood || 0), 0) /
            moodsLogged.length
        )
      : null;

  function startEdit() {
    setEditName(person!.name);
    setEditOneLiner(person!.oneLiner);
    setEditing(true);
  }

  function saveEdit() {
    try {
      setErrorMessage(null);
      savePerson({
        ...person!,
        name: editName.trim() || person!.name,
        oneLiner: editOneLiner.trim(),
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
      refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't save this profile."
      );
    }
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      setErrorMessage(null);
      deletePerson(person!.id);
      router.push("/people");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't remove this person."
      );
    }
  }


  return (
    <AppShell>
      <div className="space-y-5">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--muted)]"
        >
          &larr; Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAvatarPicker((value) => !value)}
            className={`group relative shrink-0 rounded-full p-1 transition-all hover:scale-[1.03] ${
              showAvatarPicker ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]" : "hover:bg-[var(--surface-alt)]"
            }`}
            aria-label={`Change ${person.name}'s avatar`}
          >
            <Avatar
              name={person.name}
              color={person.color}
              avatarStyle={person.avatarStyle}
              size="lg"
            />
          </button>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                  className="text-base"
                />
                <input
                  value={editOneLiner}
                  onChange={(e) => setEditOneLiner(e.target.value)}
                  placeholder="One line about them"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="primary-button text-xs">
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-xs text-[var(--muted)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="block w-full text-left"
              >
                <h1 className="font-serif text-2xl text-[var(--foreground)]">
                  {person.name}
                </h1>
                <p className="text-sm text-[var(--muted)]">
                  {person.oneLiner || "Tap to add a one-liner"}
                </p>
              </button>
            )}
          </div>
        </div>

        {!editing ? (
          <p className="-mt-2 pl-1 text-[10px] text-[var(--muted)]/60">
            Change avatar
          </p>
        ) : null}

        {showAvatarPicker ? (
          <section className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="detail-label">Avatar</p>
                <p className="text-xs leading-6 text-[var(--muted)]">
                  Pick a tiny pixel companion for {person.name}, or keep the letter.
                </p>
              </div>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs text-[var(--muted)]"
              >
                Close
              </button>
            </div>
            <AvatarPicker
              value={person.avatarStyle}
              name={person.name}
              color={person.color}
              onChange={(avatarStyle) => {
                savePerson({
                  ...person,
                  avatarStyle,
                  updatedAt: new Date().toISOString(),
                });
                refresh();
              }}
              onRandom={() => {
                savePerson({
                  ...person,
                  avatarStyle: randomAvatarStyle(),
                  updatedAt: new Date().toISOString(),
                });
                refresh();
              }}
            />
          </section>
        ) : null}

        {/* Aggregate mood insight */}
        {avgMood && moodsLogged.length >= 1 && (
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--muted)]">
            <Mood value={avgMood as MoodValue} size="md" className="mr-2 align-middle" />
            After meeting {person.name}, you usually feel{" "}
            <span className="font-medium text-[var(--foreground)]">
              {MOOD_LABEL[avgMood as MoodValue]}
            </span>
            .
          </div>
        )}

        {/* Next time ask - most prominent */}
        {latest?.nextTimeAsk && (
          <div className="rounded-[24px] bg-[var(--accent-soft)] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Next time, you could ask
            </p>
            <p className="text-pretty font-serif text-xl leading-8 text-[var(--foreground)]">
              &ldquo;{latest.nextTimeAsk}&rdquo;
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/people/${person.id}/recall`}
            className="primary-button justify-center text-sm"
          >
            Review card
          </Link>
          <Link
            href={`/remember?personId=${person.id}`}
            className="secondary-button justify-center text-sm"
          >
            + New moment
          </Link>
        </div>

        {errorMessage && (
          <p className="text-sm text-[#c47b7b]">{errorMessage}</p>
        )}

        {/* Stay in touch */}
        <section className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface-alt)] p-5">
          <div>
            <h3 className="font-serif text-lg text-[var(--foreground)]">
              Stay in touch
            </h3>
            <p className="mt-1 text-pretty text-xs leading-6 text-[var(--muted)]">
              Set a quiet nudge for when you want to think of {person.name}{" "}
              again. It&apos;ll be waiting here in Rehello &mdash; no push
              notifications, no pressure.
            </p>
          </div>

          {reminders.length > 0 && (
            <div className="space-y-2">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--foreground)]">
                      {r.message}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(r.triggerDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      try {
                        setErrorMessage(null);
                        dismissReminder(r.id);
                        refresh();
                      } catch (error) {
                        setErrorMessage(
                          error instanceof Error
                            ? error.message
                            : "We couldn't update that reminder."
                        );
                      }
                    }}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Done
                  </button>
                </div>
              ))}
            </div>
          )}

          {showReminderPicker ? (
            <StayInTouchPicker
              personId={person.id}
              personName={person.name}
              onDone={() => {
                setShowReminderPicker(false);
                setErrorMessage(null);
                refresh();
              }}
              onSkip={() => setShowReminderPicker(false)}
              onError={setErrorMessage}
              skipLabel="Cancel"
            />
          ) : (
            <button
              onClick={() => setShowReminderPicker(true)}
              className="primary-button w-full justify-center text-sm"
            >
              {reminders.length > 0 ? "Add another nudge" : "Remind me later"}
            </button>
          )}
        </section>

        {/* Encounters timeline */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Moments</h3>
          {encounters.map((enc) => (
            <Link
              key={enc.id}
              href={`/encounters/${enc.id}/edit`}
              className="card block space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {enc.mood && <Mood value={enc.mood} size="sm" />}
                  {enc.where && (
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {enc.where}
                    </p>
                  )}
                </div>
                {enc.date && (
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(enc.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>

              {enc.impression && (
                <div>
                  <p className="detail-label text-[10px]">First impression</p>
                  <p className="text-sm leading-7 text-[var(--foreground)]">
                    {enc.impression}
                  </p>
                </div>
              )}

              {enc.talkedAbout && (
                <div>
                  <p className="detail-label text-[10px]">Talked about</p>
                  <p className="text-sm leading-7 text-[var(--foreground)]">
                    {enc.talkedAbout}
                  </p>
                </div>
              )}

              {enc.memorableDetail && (
                <div>
                  <p className="detail-label text-[10px]">Remember this</p>
                  <p className="text-sm leading-7 text-[var(--foreground)]">
                    {enc.memorableDetail}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </section>

        {/* Delete */}
        <div className="pt-4 text-center">
          <button
            onClick={handleDelete}
            className="text-xs text-[var(--muted)] transition-colors hover:text-[#c47b7b]"
          >
            {confirmDelete ? "Tap again to confirm" : "Remove this person"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}




