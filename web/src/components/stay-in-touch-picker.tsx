"use client";

/**
 * StayInTouchPicker
 *
 * A small, friendly UI for setting a "stay in touch" reminder. Used in:
 *   - the /remember flow (after mood, before Done)
 *   - the recall card (Got it + Remind me later)
 *   - the person profile page (Stay in touch section)
 *
 * The reminder is intentionally framed as a soft promise to *think of*
 * someone again, not a task to "follow up" with them. That language
 * matters for socially anxious users — we're not adding work, we're
 * adding a safety net so people don't quietly drift away.
 */

import { useState } from "react";
import {
  generateId,
  parseDateInputAsLocalDate,
  saveReminder,
  todayDateInputValue,
} from "@/lib/storage";

const PRESETS: { label: string; days: number }[] = [
  { label: "In a week", days: 7 },
  { label: "In 2 weeks", days: 14 },
  { label: "In a month", days: 30 },
];

export function StayInTouchPicker({
  personId,
  personName,
  onDone,
  onSkip,
  onError,
  skipLabel = "Not now",
  compact = false,
}: {
  personId: string;
  personName: string;
  onDone: () => void;
  onSkip?: () => void;
  onError?: (message: string) => void;
  skipLabel?: string;
  compact?: boolean;
}) {
  const [customDate, setCustomDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  function commit(triggerDate: Date) {
    try {
      saveReminder({
        id: generateId(),
        personId,
        triggerDate: triggerDate.toISOString(),
        message: `Think of ${personName}`,
        dismissed: false,
      });
      onDone();
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "We couldn't save that reminder."
      );
    }
  }

  function pickPreset(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    commit(d);
  }

  function pickCustom() {
    if (!customDate) return;
    try {
      commit(parseDateInputAsLocalDate(customDate));
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Please pick a valid date."
      );
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            onClick={() => pickPreset(p.days)}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom((s) => !s)}
          className="rounded-full border border-dashed border-[var(--border)] bg-transparent px-4 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          Pick a date
        </button>
      </div>

      {showCustom && (
        <div className="flex gap-2">
          <input
            type="date"
            value={customDate}
            min={todayDateInputValue()}
            onChange={(e) => setCustomDate(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={pickCustom}
            disabled={!customDate}
            className="primary-button text-xs disabled:opacity-40"
          >
            Set
          </button>
        </div>
      )}

      {onSkip && (
        <div className="pt-1">
          <button
            onClick={onSkip}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {skipLabel}
          </button>
        </div>
      )}
    </div>
  );
}
