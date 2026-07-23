"use client";

import { useState } from "react";
import Link from "next/link";
import { Person, Encounter } from "@/lib/types";
import type { AvatarStyle } from "@/lib/avatar-styles";
import { PixelAvatar } from "@/components/pixel-avatar";

export function Avatar({
  name,
  color,
  avatarStyle,
  size = "md",
}: {
  name: string;
  color: string;
  avatarStyle?: AvatarStyle;
  size?: "sm" | "md" | "lg";
}) {
  const letter = name.charAt(0).toUpperCase();
  const sizeClass =
    size === "sm"
      ? "h-10 w-10 text-base"
      : size === "lg"
        ? "h-16 w-16 text-2xl"
        : "h-12 w-12 text-lg";

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full font-serif font-semibold shrink-0`}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {avatarStyle ? (
        <PixelAvatar
          style={avatarStyle}
          size={size === "sm" ? 22 : size === "lg" ? 38 : 28}
        />
      ) : (
        letter
      )}
    </div>
  );
}

export function PersonCard({
  person,
  encounter,
}: {
  person: Person;
  encounter?: Encounter;
}) {
  // Snapshot "now" once at first render so the card doesn't shift its
  // "Xd ago" label if the parent re-renders mid-session. Lazy useState
  // initializer is the React 19-blessed way to call an impure function.
  const [now] = useState(() => Date.now());
  const daysAgo = Math.floor(
    (now - new Date(person.updatedAt).getTime()) / 86400000
  );

  return (
    <Link
      href={`/people/${person.id}`}
      className="card block transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <Avatar
          name={person.name}
          color={person.color}
          avatarStyle={person.avatarStyle}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {person.name}
            </h2>
            <span className="text-sm text-[var(--muted)]">
              {person.oneLiner}
            </span>
          </div>
          {encounter?.where && (
            <p className="text-sm text-[var(--muted)]">
              Met at {encounter.where}
            </p>
          )}
          {encounter?.talkedAbout && (
            <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
              {encounter.talkedAbout}
            </p>
          )}
        </div>
        <div className="whitespace-nowrap text-xs font-medium text-[var(--muted)]">
          {daysAgo === 0 ? "Heute" : `vor ${daysAgo} T.`}
        </div>
      </div>
    </Link>
  );
}
