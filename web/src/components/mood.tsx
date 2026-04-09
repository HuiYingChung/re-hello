/**
 * Centralized mood representation.
 *
 * Currently renders an emoji glyph so the visual stays consistent with
 * how the mood was first introduced. When custom hand-drawn PNGs are ready,
 * swap the EMOJI map for an Image-based asset map and the rest of the app
 * keeps working with no changes.
 *
 * Optional future swap example:
 *
 *   const ASSETS: Record<MoodValue, string> = {
 *     1: "/icons/mood/mood-1.png",
 *     ...
 *   };
 *   <Image src={ASSETS[value]} alt={LABEL[value]} width={size} height={size} />
 */

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export const MOOD_EMOJI: Record<MoodValue, string> = {
  1: "😣",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export const MOOD_LABEL: Record<MoodValue, string> = {
  1: "drained",
  2: "off",
  3: "okay",
  4: "good",
  5: "lifted",
};

export type MoodSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<MoodSize, string> = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Mood({
  value,
  size = "md",
  className = "",
}: {
  value: MoodValue;
  size?: MoodSize;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={MOOD_LABEL[value]}
      title={MOOD_LABEL[value]}
      className={`${SIZE_CLASS[size]} ${className}`}
    >
      {MOOD_EMOJI[value]}
    </span>
  );
}
