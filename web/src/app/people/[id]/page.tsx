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
import { downloadReminderCalendar } from "@/lib/calendar";

const RELATIONSHIP_LABELS: Record<
  NonNullable<Person["relationship"]>,
  string
> = {
  family: "Familie",
  friend: "Freundschaft",
  professional: "Beruflich",
  acquaintance: "Bekanntschaft",
  other: "Andere",
};

const REPEAT_LABELS: Record<Exclude<NonNullable<Reminder["repeat"]>, "none">, string> = {
  monthly: "monatlich",
  quarterly: "vierteljährlich",
  yearly: "jährlich",
};

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
  const [editContactInfo, setEditContactInfo] = useState("");
  const [editRelationship, setEditRelationship] =
    useState<Person["relationship"]>();
  const [editTags, setEditTags] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editNotes, setEditNotes] = useState("");
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
    setEditContactInfo(person!.contactInfo || "");
    setEditRelationship(person!.relationship);
    setEditTags(person!.tags?.join(", ") || "");
    setEditBirthday(person!.birthday || "");
    setEditNotes(person!.notes || "");
    setEditing(true);
  }

  function saveEdit() {
    try {
      setErrorMessage(null);
      const birthday = editBirthday.trim();
      if (
        birthday &&
        !/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(birthday)
      ) {
        setErrorMessage("Bitte gib den Geburtstag als MM-TT ein.");
        return;
      }
      savePerson({
        ...person!,
        name: editName.trim() || person!.name,
        oneLiner: editOneLiner.trim(),
        contactInfo: editContactInfo.trim() || undefined,
        relationship: editRelationship,
        tags:
          editTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 30) || undefined,
        birthday: birthday || undefined,
        notes: editNotes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
      refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Das Profil konnte nicht gespeichert werden."
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
          : "Die Person konnte nicht entfernt werden."
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
          &larr; Zurück
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
                  placeholder="Ein kurzer Merksatz"
                  className="text-sm"
                />
                <select
                  value={editRelationship || ""}
                  onChange={(event) =>
                    setEditRelationship(
                      (event.target.value || undefined) as Person["relationship"]
                    )
                  }
                  className="text-sm"
                  aria-label="Beziehung"
                >
                  <option value="">Beziehung wählen</option>
                  {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  value={editTags}
                  onChange={(event) => setEditTags(event.target.value)}
                  placeholder="Tags, mit Komma getrennt"
                  className="text-sm"
                />
                <input
                  value={editBirthday}
                  onChange={(event) => setEditBirthday(event.target.value)}
                  placeholder="Geburtstag, z. B. 05-21"
                  pattern="(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])"
                  className="text-sm"
                />
                <input
                  value={editContactInfo}
                  onChange={(event) => setEditContactInfo(event.target.value)}
                  placeholder="Kontakt, z. B. Telefon oder E-Mail"
                  className="text-sm"
                />
                <textarea
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  placeholder="Allgemeine Notizen"
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="primary-button text-xs">
                    Speichern
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-xs text-[var(--muted)]"
                  >
                    Abbrechen
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
                  {person.oneLiner || "Antippen, um Details zu ergänzen"}
                </p>
              </button>
            )}
          </div>
        </div>

        {!editing ? (
          <p className="-mt-2 pl-1 text-[10px] text-[var(--muted)]/60">
            Avatar ändern
          </p>
        ) : null}

        {showAvatarPicker ? (
          <section className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="detail-label">Avatar</p>
                <p className="text-xs leading-6 text-[var(--muted)]">
                  Wähle einen kleinen Begleiter für {person.name} oder behalte den
                  Buchstaben.
                </p>
              </div>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs text-[var(--muted)]"
              >
                Schliessen
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

        {!editing &&
          (person.relationship ||
            person.tags?.length ||
            person.birthday ||
            person.contactInfo ||
            person.notes) && (
            <section className="space-y-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap gap-2">
                {person.relationship && (
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-strong)]">
                    {RELATIONSHIP_LABELS[person.relationship]}
                  </span>
                )}
                {person.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {person.birthday && (
                <p className="text-sm text-[var(--muted)]">
                  Geburtstag: {person.birthday}
                </p>
              )}
              {person.contactInfo && (
                <p className="break-words text-sm text-[var(--muted)]">
                  Kontakt: {person.contactInfo}
                </p>
              )}
              {person.notes && (
                <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">
                  {person.notes}
                </p>
              )}
            </section>
          )}

        {/* Aggregate mood insight */}
        {avgMood && moodsLogged.length >= 1 && (
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--muted)]">
            <Mood value={avgMood as MoodValue} size="md" className="mr-2 align-middle" />
            Nach Treffen mit {person.name} fühlst du dich meistens{" "}
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
              Beim nächsten Mal könntest du fragen
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
            Karte ansehen
          </Link>
          <Link
            href={`/remember?personId=${person.id}`}
            className="secondary-button justify-center text-sm"
          >
            + Neuer Moment
          </Link>
        </div>

        {errorMessage && (
          <p className="text-sm text-[#c47b7b]">{errorMessage}</p>
        )}

        {/* Stay in touch */}
        <section className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface-alt)] p-5">
          <div>
            <h3 className="font-serif text-lg text-[var(--foreground)]">
              In Verbindung bleiben
            </h3>
            <p className="mt-1 text-pretty text-xs leading-6 text-[var(--muted)]">
              Lege eine ruhige Erinnerung fest, wann du wieder an {person.name}{" "}
              denken möchtest. Sie wartet hier auf dich, ohne Push-Nachricht.
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
                      {new Date(r.triggerDate).toLocaleDateString("de-CH", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {r.repeat && r.repeat !== "none"
                        ? ` · ${REPEAT_LABELS[r.repeat]}`
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadReminderCalendar(r, person)}
                    className="text-xs text-[var(--accent-strong)]"
                  >
                    Kalender
                  </button>
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
                            : "Die Erinnerung konnte nicht aktualisiert werden."
                        );
                      }
                    }}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Erledigt
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
              skipLabel="Abbrechen"
            />
          ) : (
            <button
              onClick={() => setShowReminderPicker(true)}
              className="primary-button w-full justify-center text-sm"
            >
              {reminders.length > 0
                ? "Weitere Erinnerung"
                : "Später erinnern"}
            </button>
          )}
        </section>

        {/* Encounters timeline */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Momente</h3>
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
                    {new Date(enc.date).toLocaleDateString("de-CH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>

              {enc.impression && (
                <div>
                  <p className="detail-label text-[10px]">Eindruck</p>
                  <p className="text-sm leading-7 text-[var(--foreground)]">
                    {enc.impression}
                  </p>
                </div>
              )}

              {enc.talkedAbout && (
                <div>
                  <p className="detail-label text-[10px]">Gesprächsthemen</p>
                  <p className="text-sm leading-7 text-[var(--foreground)]">
                    {enc.talkedAbout}
                  </p>
                </div>
              )}

              {enc.memorableDetail && (
                <div>
                  <p className="detail-label text-[10px]">Merken</p>
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
            {confirmDelete
              ? "Zum Bestätigen nochmals tippen"
              : "Diese Person entfernen"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}


