"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/person-card";
import { StayInTouchPicker } from "@/components/stay-in-touch-picker";
import {
  getPerson,
  getLatestEncounter,
  markPersonReviewed,
} from "@/lib/storage";
import { Person, Encounter } from "@/lib/types";

export default function RecallPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const p = getPerson(id);
    if (!p) {
      router.replace("/");
      return;
    }
    // Intentional: localStorage reads must defer past hydration. The
    // following setState calls are how we hand client-only data to
    // the render pass on first mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerson(p);
    setEncounter(getLatestEncounter(id) || null);
    markPersonReviewed(id);
  }, [id, router]);

  if (!person) return null;

  return (
    <AppShell>
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="w-full rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_20px_50px_rgba(55,36,24,0.1)]">
          <Avatar
            name={person.name}
            color={person.color}
            avatarStyle={person.avatarStyle}
            size="lg"
          />
          <h1 className="mt-3 font-serif text-3xl text-[var(--foreground)]">
            {person.name}
          </h1>
          <p className="text-sm text-[var(--muted)]">{person.oneLiner}</p>

          {encounter && (
            <div className="mt-6 space-y-5 text-left">
              {encounter.where && (
                <div className="text-center">
                  <p className="text-xs text-[var(--muted)]">
                    You met at {encounter.where}
                  </p>
                </div>
              )}

              {encounter.talkedAbout && (
                <div>
                  <p className="detail-label text-center">You talked about</p>
                  <p className="text-center text-sm leading-7 text-[var(--foreground)]">
                    {encounter.talkedAbout}
                  </p>
                </div>
              )}

              {encounter.memorableDetail && (
                <div>
                  <p className="detail-label text-center">Remember this</p>
                  <p className="text-center text-sm leading-7 text-[var(--foreground)]">
                    {encounter.memorableDetail}
                  </p>
                </div>
              )}

              {encounter.nextTimeAsk && (
                <div className="rounded-[20px] bg-[var(--accent-soft)] p-5 text-center">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    You could ask
                  </p>
                  <p className="text-pretty font-serif text-2xl leading-9 text-[var(--foreground)]">
                    &ldquo;{encounter.nextTimeAsk}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stay in touch picker — soft, optional */}
        {showPicker && !reminderSet && (
          <div className="w-full rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Remind me to think of {person.name}
            </p>
            <StayInTouchPicker
              personId={person.id}
              personName={person.name}
              onDone={() => {
                setErrorMessage(null);
                setReminderSet(true);
                setShowPicker(false);
              }}
              onSkip={() => setShowPicker(false)}
              onError={setErrorMessage}
            />
          </div>
        )}

        {reminderSet && (
          <p className="text-center text-xs text-[var(--accent-strong)]">
            Set. We&apos;ll quietly nudge you.
          </p>
        )}

        {errorMessage && (
          <p className="text-center text-xs text-[#c47b7b]">{errorMessage}</p>
        )}

        <div className="flex w-full flex-col gap-2">
          {!showPicker && !reminderSet && (
            <button
              onClick={() => setShowPicker(true)}
              className="secondary-button justify-center"
            >
              Remind me later
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="primary-button justify-center"
          >
            Got it, I&apos;m ready
          </button>
        </div>
      </div>
    </AppShell>
  );
}
