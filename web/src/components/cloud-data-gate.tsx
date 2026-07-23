"use client";

import { ReactNode, useEffect, useState } from "react";
import type { ExportPayload } from "@/lib/storage";
import { exportData, replaceCoreData } from "@/lib/storage";

const CHANGE_EVENT = "rehello-local-data-changed";
let initialization: Promise<void> | null = null;
let pending: ExportPayload | null = null;
let flushing = false;
let timer: number | null = null;

function hasRecords(payload: ExportPayload) {
  return (
    payload.people.length > 0 ||
    payload.encounters.length > 0 ||
    payload.reminders.length > 0
  );
}

async function upload(payload: ExportPayload) {
  const response = await fetch("/api/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
  if (!response.ok) throw new Error("Cloud-Speicherung fehlgeschlagen.");
}

async function flush() {
  if (flushing) return;
  flushing = true;
  try {
    while (pending) {
      const current = pending;
      pending = null;
      await upload(current);
    }
  } finally {
    flushing = false;
  }
}

function queue(payload: ExportPayload) {
  pending = payload;
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    void flush();
  }, 180);
}

async function initialize() {
  const response = await fetch("/api/data", { cache: "no-store" });
  if (!response.ok) throw new Error("Die Datenbank konnte nicht geladen werden.");
  const body = (await response.json()) as { data?: ExportPayload | null };
  const local = exportData();

  if (body.data && hasRecords(body.data)) {
    replaceCoreData(body.data);
  } else if (hasRecords(local)) {
    await upload(local);
  }
}

export function CloudDataGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    initialization ??= initialize();
    initialization.then(
      () => setStatus("ready"),
      () => setStatus("error")
    );

    const handleChange = () => queue(exportData());
    window.addEventListener(CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CHANGE_EVENT, handleChange);
  }, []);

  if (status === "loading") {
    return (
      <div className="app-stage">
        <div className="phone-shell flex items-center justify-center px-8 text-center">
          <p className="text-sm text-[var(--muted)]">Erinnerungen werden geladen …</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="app-stage">
        <div className="phone-shell flex items-center justify-center px-8 text-center">
          <div>
            <h1 className="font-serif text-2xl">Datenbank nicht erreichbar</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Prüfe die Neon-Verbindung und lade die Seite danach erneut.
              Lokale Änderungen wurden nicht verworfen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export const cloudDataChangeEvent = CHANGE_EVENT;
