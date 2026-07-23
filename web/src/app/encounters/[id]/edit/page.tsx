"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  formatDateInputValue,
  getEncounter,
  parseDateInputAsIso,
  saveEncounter,
  todayDateInputValue,
  deleteEncounter,
} from "@/lib/storage";
import { Encounter } from "@/lib/types";
import { Mood, type MoodValue } from "@/components/mood";

const MOOD_VALUES: MoodValue[] = [1, 2, 3, 4, 5];

export default function EditEncounterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const e = getEncounter(id);
    if (!e) {
      router.replace("/");
      return;
    }
    // Intentional: localStorage is client-only, so we have to defer the
    // initial load to an effect to avoid SSR/hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEncounter(e);
  }, [id, router]);

  if (!encounter) return null;

  function update<K extends keyof Encounter>(key: K, value: Encounter[K]) {
    setEncounter((e) => (e ? { ...e, [key]: value } : e));
  }

  function save() {
    if (!encounter) return;
    try {
      setErrorMessage(null);
      saveEncounter(encounter);
      router.push(`/people/${encounter.personId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dieser Moment konnte nicht gespeichert werden."
      );
    }
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    const personId = encounter!.personId;
    try {
      setErrorMessage(null);
      deleteEncounter(encounter!.id);
      router.push(`/people/${personId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dieser Moment konnte nicht gelöscht werden."
      );
    }
  }

  return (
    <AppShell>
      <div className="space-y-5 py-2">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--muted)]"
        >
          &larr; Abbrechen
        </button>

        <h1 className="font-serif text-2xl text-[var(--foreground)]">
          Diesen Moment bearbeiten
        </h1>

        <Field label="Wann">
          <input
            type="date"
            value={encounter.date ? formatDateInputValue(encounter.date) : ""}
            max={todayDateInputValue()}
            onChange={(e) => {
              const v = e.target.value;
              try {
                setErrorMessage(null);
                update("date", v ? parseDateInputAsIso(v) : undefined);
              } catch (error) {
                setErrorMessage(
                  error instanceof Error
                    ? error.message
                    : "Bitte wähle ein gültiges Datum."
                );
              }
            }}
          />
        </Field>

        <Field label="Wo">
          <input
            value={encounter.where || ""}
            onChange={(e) => update("where", e.target.value)}
            placeholder="Wo ihr euch getroffen habt"
          />
        </Field>

        <Field label="Wie es sich anfühlte">
          <textarea
            value={encounter.impression || ""}
            onChange={(e) => update("impression", e.target.value)}
            placeholder="Was ist dir aufgefallen?"
            rows={3}
          />
        </Field>

        <Field label="Worüber ihr gesprochen habt">
          <textarea
            value={encounter.talkedAbout || ""}
            onChange={(e) => update("talkedAbout", e.target.value)}
            placeholder="Themen, Geschichten und alles, woran du dich erinnerst …"
            rows={3}
          />
        </Field>

        <Field label="Was du dir merken möchtest">
          <textarea
            value={encounter.memorableDetail || ""}
            onChange={(e) => update("memorableDetail", e.target.value)}
            placeholder="Ein Detail, das du behalten möchtest"
            rows={3}
          />
        </Field>

        <Field label="Beim nächsten Mal könntest du fragen">
          <textarea
            value={encounter.nextTimeAsk || ""}
            onChange={(e) => update("nextTimeAsk", e.target.value)}
            placeholder="Eine natürliche Frage zum späteren Anknüpfen"
            rows={3}
          />
        </Field>

        <Field label="Gefühl">
          <div className="flex justify-between gap-2">
            {MOOD_VALUES.map((value) => (
              <button
                key={value}
                onClick={() =>
                  update("mood", encounter.mood === value ? undefined : value)
                }
                className={`flex-1 rounded-2xl border p-3 transition-all ${
                  encounter.mood === value
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <Mood value={value} size="md" />
              </button>
            ))}
          </div>
        </Field>

        <button onClick={save} className="primary-button w-full justify-center">
          Änderungen speichern
        </button>

        {errorMessage && (
          <p className="text-sm text-[#c47b7b]">{errorMessage}</p>
        )}

        <div className="pt-4 text-center">
          <button
            onClick={handleDelete}
            className="text-xs text-[var(--muted)] transition-colors hover:text-[#c47b7b]"
          >
            {confirmDelete
              ? "Zum Löschen nochmals tippen"
              : "Diesen Moment löschen"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      {children}
    </div>
  );
}
