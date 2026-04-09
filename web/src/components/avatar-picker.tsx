"use client";

import { Check, Shuffle } from "lucide-react";
import { Icon } from "@/components/icon";
import { Avatar } from "@/components/person-card";
import { AVATAR_OPTIONS, type AvatarStyle } from "@/lib/avatar-styles";

export function AvatarPicker({
  value,
  name,
  color,
  onChange,
  onRandom,
  allowSkip = true,
  compact = false,
}: {
  value?: AvatarStyle;
  name: string;
  color: string;
  onChange: (value?: AvatarStyle) => void;
  onRandom?: () => void;
  allowSkip?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="grid grid-cols-3 gap-3">
        {AVATAR_OPTIONS.map((option) => {
          const isActive = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`relative flex flex-col items-center gap-2 rounded-[20px] border px-2 py-3 transition-all ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_2px_rgba(212,142,97,0.14)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-alt)]"
              }`}
              aria-pressed={isActive}
            >
              {isActive ? (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm">
                  <Icon as={Check} size={11} flat />
                </span>
              ) : null}
              <Avatar
                name={name}
                color={color}
                avatarStyle={option.id}
                size="sm"
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {onRandom ? (
          <button
            type="button"
            onClick={onRandom}
            className="secondary-button gap-2 text-xs"
          >
            <Icon as={Shuffle} size={14} flat />
            Random
          </button>
        ) : null}
        {allowSkip ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              !value
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            }`}
          >
            Just the letter
          </button>
        ) : null}
      </div>
    </div>
  );
}
