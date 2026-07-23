"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Logo } from "@/components/logo";
import {
  exportData,
  importData,
  clearAllData,
  resetOnboarding,
  markOnboarded,
  seedDemoData,
  getHiddenSections,
  showSection,
  showAllSections,
} from "@/lib/storage";

const SECTION_LABELS: Record<string, string> = {
  "recall-preview": "Vor dem nächsten Treffen ansehen",
  "recent-people": "Kürzlich hinzugefügt",
  "worth-refresh": "Kurz auffrischen",
  "upcoming": "Diese Woche in Verbindung bleiben",
};

export default function SettingsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    setHidden(getHiddenSections());
  }, []);

  function handleShow(id: string) {
    try {
      showSection(id);
      setHidden(getHiddenSections());
    } catch (error) {
      flash(
        error instanceof Error
          ? error.message
          : "Die Einstellung konnte nicht aktualisiert werden."
      );
    }
  }

  function handleShowAll() {
    try {
      showAllSections();
      setHidden([]);
      flash("Alle Bereiche sind wieder sichtbar.");
    } catch (error) {
      flash(
        error instanceof Error
          ? error.message
          : "Die Einstellungen konnten nicht aktualisiert werden."
      );
    }
  }

  function flash(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2400);
  }

  function handleExport() {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `rehello-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Sicherung heruntergeladen.");
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = importData(json);
      setMessage(result.message);
      if (result.ok) {
        markOnboarded();
        setTimeout(() => router.push("/"), 1200);
      }
    } catch {
      setMessage("Die Datei konnte nicht gelesen werden.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleLoadDemo() {
    try {
      const seeded = seedDemoData();
      flash(
        seeded
          ? "Beispieldaten geladen."
          : "Beispieldaten können nur in eine leere Liste geladen werden."
      );
      setTimeout(() => router.push("/"), 800);
    } catch (error) {
      flash(
        error instanceof Error
          ? error.message
          : "Die Beispieldaten konnten nicht geladen werden."
      );
    }
  }

  function handleReplayWelcome() {
    try {
      router.push("/welcome?replay=1");
    } catch (error) {
      flash(
        error instanceof Error
          ? error.message
          : "Die Einführung konnte nicht geöffnet werden."
      );
    }
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    try {
      clearAllData();
      resetOnboarding();
      setMessage("Alle Daten wurden gelöscht.");
      setConfirmReset(false);
      setTimeout(() => router.push("/welcome"), 800);
    } catch (error) {
      setConfirmReset(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Daten konnten nicht gelöscht werden."
      );
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--muted)]"
        >
          &larr; Zurück
        </button>

        <h1 className="font-serif text-2xl text-[var(--foreground)]">
          Einstellungen
        </h1>

        {/* Your data */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Deine Daten
          </h3>
          <p className="text-xs leading-6 text-[var(--muted)]">
            Deine Menschen, Momente und Erinnerungen werden in deiner privaten
            PostgreSQL-Datenbank gespeichert und lokal gespiegelt. Die
            JSON-Sicherung hält dich unabhängig von Vercel und Neon. Ein
            OpenAI-Schlüssel wird nur für eine ausdrücklich gewählte
            Strukturierung verwendet und nicht gespeichert.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="primary-button w-full justify-center"
            >
              JSON-Sicherung herunterladen
            </button>
            <button
              onClick={handleImportClick}
              className="secondary-button w-full justify-center"
            >
              JSON-Sicherung wiederherstellen
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {message && (
            <p className="rounded-[14px] bg-[var(--accent-soft)] px-4 py-3 text-xs text-[var(--accent-strong)]">
              {message}
            </p>
          )}
        </section>

        {/* Try it out */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Ausprobieren
          </h3>
          <p className="text-xs leading-6 text-[var(--muted)]">
            Lade einige Beispielpersonen oder öffne die Einführung erneut.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleLoadDemo}
              className="secondary-button w-full justify-center"
            >
              Beispieldaten laden
            </button>
            <button
              onClick={handleReplayWelcome}
              className="secondary-button w-full justify-center"
            >
              Einführung erneut ansehen
            </button>
          </div>
        </section>

        {/* Hidden home sections */}
        {hidden.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Ausgeblendete Startbereiche
            </h3>
            <p className="text-xs leading-6 text-[var(--muted)]">
              Diese Bereiche kannst du jederzeit wieder einblenden.
            </p>
            <div className="space-y-2">
              {hidden.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                >
                  <span className="text-sm text-[var(--foreground)]">
                    {SECTION_LABELS[id] || id}
                  </span>
                  <button
                    onClick={() => handleShow(id)}
                    className="text-xs font-semibold text-[var(--accent-strong)]"
                  >
                    Wieder anzeigen
                  </button>
                </div>
              ))}
              {hidden.length > 1 && (
                <button
                  onClick={handleShowAll}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Alle anzeigen
                </button>
              )}
            </div>
          </section>
        )}

        {/* Start over */}
        <section className="space-y-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Neu beginnen
          </h3>
          <p className="text-xs leading-6 text-[var(--muted)]">
            Entfernt alle Menschen, Momente und Erinnerungen. Dies kann nicht
            rückgängig gemacht werden.
          </p>
          <button
            onClick={handleReset}
            className={`text-xs font-semibold transition-colors ${
              confirmReset
                ? "text-[#c47b7b]"
                : "text-[var(--muted)] hover:text-[#c47b7b]"
            }`}
          >
            {confirmReset
              ? "Zum Löschen nochmals tippen"
              : "Alle Daten löschen"}
          </button>
        </section>

        <button
          onClick={handleLogout}
          className="secondary-button w-full justify-center"
        >
          Abmelden
        </button>

        {/* About */}
        <section className="space-y-2 pt-2 text-center">
          <Logo size="md" className="block" />
          <p className="text-xs italic text-[var(--muted)]">
            Ein ruhiger Ort für die Menschen in deinem Leben.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Private Version · Helloagain
          </p>
          <p className="mx-auto max-w-[260px] pt-2 text-xs leading-6 text-[var(--muted)]">
            Passwortgeschützt, ohne Analyse-Skripte. Deine Daten bleiben als
            lesbare JSON-Datei exportierbar.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
