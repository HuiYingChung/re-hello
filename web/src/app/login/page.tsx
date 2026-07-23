"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Anmeldung fehlgeschlagen.");
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") ? next : "/");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Anmeldung fehlgeschlagen."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-stage">
      <div className="phone-shell">
        <div className="phone-status">
          <div className="phone-notch" />
        </div>
        <main className="flex min-h-0 flex-1 flex-col justify-center px-7 py-10">
          <div className="space-y-7">
            <Logo size="lg" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Deine private Version
              </p>
              <h1 className="mt-2 font-serif text-3xl text-[var(--foreground)]">
                Willkommen zurück
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Deine Erinnerungen werden dauerhaft in deiner eigenen
                PostgreSQL-Datenbank gespeichert.
              </p>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <label htmlFor="password" className="detail-label">
                Persönliches Passwort
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
              {error && <p className="text-sm text-[#c47b7b]">{error}</p>}
              <button
                type="submit"
                disabled={loading || !password}
                className="primary-button w-full justify-center disabled:opacity-50"
              >
                {loading ? "Wird geöffnet …" : "Private App öffnen"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
