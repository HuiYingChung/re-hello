/**
 * Thin wrapper around Lucide icons that applies the .icon-handdrawn
 * treatment globally (rounded strokes + slight rotation for warmth).
 *
 * Usage:
 *   <Icon as={Home} size={20} />
 *   <Icon as={Sprout} size={32} flat />
 *
 * The `flat` prop opts out of the rotation, useful for icons inside
 * tight UI like nav pills.
 */

import type { LucideIcon } from "lucide-react";

export function Icon({
  as: Component,
  size = 20,
  className = "",
  flat = false,
  strokeWidth,
  "aria-label": ariaLabel,
}: {
  as: LucideIcon;
  size?: number;
  className?: string;
  flat?: boolean;
  strokeWidth?: number;
  "aria-label"?: string;
}) {
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth ?? 1.9}
      className={`${flat ? "icon-handdrawn-flat" : "icon-handdrawn"} ${className}`}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  );
}
