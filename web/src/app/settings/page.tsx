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
  "recall-preview": "Review before you meet again",
  "recent-people": "Recent people",
  "worth-refresh": "Worth a quick refresh",
  "upcoming": "Stay in touch this week",
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
          : "We couldn't update that setting."
      );
    }
  }

  function handleShowAll() {
    try {
      showAllSections();
      setHidden([]);
      flash("All sections restored.");
    } catch (error) {
      flash(
        error instanceof Error
          ? error.message
          : "We couldn't update those settings."
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
    flash("Backup downloaded.");
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
      setMessage("Couldn't read that file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleLoadDemo() {
    try {
      const seeded = seedDemoData();
      flash(seeded ? "Sample data loaded." : "Sample data only loads when your list is empty.");
      setTimeout(() => router.push("/"), 800);
    } catch (error) {
      flash(
        error instanceof Error
          ? error.message
          : "We couldn't load sample data."
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
          : "We couldn't reset the welcome tour."
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
      setMessage("All data cleared.");
      setConfirmReset(false);
      setTimeout(() => router.push("/welcome"), 800);
    } catch (error) {
      setConfirmReset(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't clear your data."
      );
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--muted)]"
        >
          &larr; Back
        </button>

        <h1 className="font-serif text-2xl text-[var(--foreground)]">
          Settings
        </h1>

        {/* Your data */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Your data
          </h3>
          <p className="text-xs leading-6 text-[var(--muted)]">
            Your saved people and moments live only in this browser. Quick
            Remember sends only the note you submit to OpenAI to shape your
            card. Save a backup so you don&apos;t lose it. Backups are readable
            JSON files, so keep yours somewhere private.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="primary-button w-full justify-center"
            >
              Download backup
            </button>
            <button
              onClick={handleImportClick}
              className="secondary-button w-full justify-center"
            >
              Restore from backup
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
            Try it out
          </h3>
          <p className="text-xs leading-6 text-[var(--muted)]">
            Just exploring? Load a few sample people, or replay the welcome
            tour.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleLoadDemo}
              className="secondary-button w-full justify-center"
            >
              Load sample data
            </button>
            <button
              onClick={handleReplayWelcome}
              className="secondary-button w-full justify-center"
            >
              Replay welcome tour
            </button>
          </div>
        </section>

        {/* Hidden home sections */}
        {hidden.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Hidden home sections
            </h3>
            <p className="text-xs leading-6 text-[var(--muted)]">
              You&apos;ve tucked these away on Home. Bring any of them back.
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
                    Show again
                  </button>
                </div>
              ))}
              {hidden.length > 1 && (
                <button
                  onClick={handleShowAll}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Show all
                </button>
              )}
            </div>
          </section>
        )}

        {/* Start over */}
        <section className="space-y-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Start over
          </h3>
          <p className="text-xs leading-6 text-[var(--muted)]">
            Removes everyone, every moment, every reminder, and resets the
            welcome tour. Can&apos;t be undone.
          </p>
          <button
            onClick={handleReset}
            className={`text-xs font-semibold transition-colors ${
              confirmReset
                ? "text-[#c47b7b]"
                : "text-[var(--muted)] hover:text-[#c47b7b]"
            }`}
          >
            {confirmReset ? "Tap again to wipe everything" : "Clear all data"}
          </button>
        </section>

        {/* About */}
        <section className="space-y-2 pt-2 text-center">
          <Logo size="md" className="block" />
          <p className="text-xs italic text-[var(--muted)]">
            A gentle place for the people you meet.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Version 0.1 · Made with care
          </p>
          <p className="mx-auto max-w-[260px] pt-2 text-xs leading-6 text-[var(--muted)]">
            No accounts. Your people and moments stay in this browser. Only a
            Quick Remember note you choose to shape is sent to OpenAI. Rehello
            also includes Vercel Analytics.
          </p>
        </section>
      </div>
    </AppShell>
  );
}

