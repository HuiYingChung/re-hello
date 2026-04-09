import type { AvatarStyle } from "@/lib/avatar-styles";

/**
 * PixelAvatar — 12x12 pixel-art creatures.
 *
 * Each grid is exactly 12 cells wide and 12 cells tall. The key goal is
 * that every creature has a DISTINCTIVE SILHOUETTE so it stays readable
 * at 22px on People cards, not just by color but by shape:
 *
 *   - tiger    small rounded ears + stripes + cream muzzle
 *   - cat      tall pointed triangle ears
 *   - dog      long floppy ears wrapping the sides of the head
 *   - cow      two short horns + dark patches
 *   - frog     two eye bumps ON TOP of the head
 *   - bear     small round corner ears + beige muzzle
 *   - ghost    wavy scalloped bottom
 *   - cloud    bumpy top outline
 *   - mushroom red cap with spots + stem
 *   - alien    two antennae + narrow head
 *   - bread    oval loaf with score marks
 *   - star     five-point star outline
 *
 * Palette tokens ("a", "b", etc.) are local to each creature, with "."
 * meaning "transparent". The module does a strict width check on load
 * so a typo in any row fails immediately rather than silently rendering
 * a misaligned grid.
 */

type PixelAvatarDef = {
  palette: Record<string, string>;
  rows: string[];
};

const GRID = 12;

const DARK = "#2f241c";

const defs: Record<AvatarStyle, PixelAvatarDef> = {
  // Orange with dark stripes, small rounded ears, cream muzzle, pink nose.
  tiger: {
    palette: {
      a: "#f3a23d",
      b: DARK,
      c: "#fde5b7",
      p: "#f3b6c4",
    },
    rows: [
      "..a......a..",
      ".aba....aba.",
      ".aaaaaaaaaa.",
      "aaaaaaaaaaaa",
      "abaaaaaaaaba",
      "aaaaaaaaaaaa",
      "aabbaaaabbaa",
      "aaaaaaaaaaaa",
      "aaccccccccaa",
      ".accppppcca.",
      "..aaccccaa..",
      "...aaaaaa...",
    ],
  },

  // Purple with TALL pointed triangle ears — the key tell vs tiger.
  cat: {
    palette: {
      a: "#8c77cf",
      b: DARK,
      p: "#f2b4ca",
    },
    rows: [
      ".a........a.",
      ".aa......aa.",
      ".aaa....aaa.",
      ".aaaaaaaaaa.",
      "aaaaaaaaaaaa",
      "aaaaaaaaaaaa",
      "aabbaaaabbaa",
      "aaaaaaaaaaaa",
      "aaaappppaaaa",
      "aaaaabbaaaaa",
      ".aaaaaaaaaa.",
      "..aaaaaaaa..",
    ],
  },

  // Brown with two clearly separated floppy ears sticking UP from the top
  // of the head. Darker brown (d) = ears so they read as their own shape.
  dog: {
    palette: {
      a: "#b77d52",
      b: DARK,
      c: "#f6ead9",
      d: "#6c4731",
    },
    rows: [
      ".dd......dd.",
      ".dddd..dddd.",
      ".dddaaaaddd.",
      "ddaaaaaaaadd",
      "daaaaaaaaaad",
      "daabbaaabbad",
      "daaaaaaaaaad",
      "aaaccccccaaa",
      ".aaccbbccaa.",
      ".aaaaaaaaaa.",
      "..aaaaaaaa..",
      "...aaaaaa...",
    ],
  },

  // White with dark face patches, CURVED horns sitting in the middle-top of
  // the head (curling inward), AND pink ears poking out from the SIDES of
  // the head one row below the horn bases — so the ears and horns occupy
  // different columns and never visually merge.
  cow: {
    palette: {
      a: "#fffaf3",
      b: DARK,
      c: "#f0b7c7",
      d: "#ccb28d",
    },
    rows: [
      "...dd..dd...",
      "...dd..dd...",
      "..ddd..ddd..",
      ".aaaaaaaaaa.",
      "caaaaaaaaaac",
      "aaaaaaaaaaaa",
      "aabbbaabbbaa",
      "aaaaaaaaaaaa",
      "aabbaaaabbaa",
      "aaccccccccaa",
      ".accbbbbcca.",
      "...aaaaaa...",
    ],
  },

  // Green with two bulging eye bumps ON TOP of the head. Very distinctive.
  frog: {
    palette: {
      a: "#79bf62",
      b: DARK,
      c: "#f7fbef",
    },
    rows: [
      "..cc....cc..",
      ".cccc..cccc.",
      ".cbcc..ccbc.",
      ".aaaaaaaaaa.",
      "aaaaaaaaaaaa",
      "aaaaaaaaaaaa",
      "aaaaaaaaaaaa",
      "aaaaaaaaaaaa",
      ".abbbbbbbba.",
      ".aaaaaaaaaa.",
      "..aaaaaaaa..",
      "...aaaaaa...",
    ],
  },

  // Brown with small round corner ears on top + beige muzzle with pink nose.
  bear: {
    palette: {
      a: "#916648",
      b: DARK,
      c: "#f2dcc1",
      p: "#efb4a5",
    },
    rows: [
      "............",
      ".aa......aa.",
      "aaaaaaaaaaaa",
      "aaaaaaaaaaaa",
      "aabbaaaabbaa",
      "aaaaaaaaaaaa",
      "aaaccccccaaa",
      "aaccppppccaa",
      "aaccccccccaa",
      ".acccccccca.",
      "..aaccccaa..",
      "...aaaaaa...",
    ],
  },

  // Classic cartoon ghost: round dome head filling most of the grid, big
  // centered eyes, and a symmetric 3-scallop wavy hem at the very bottom.
  // Wide body (cols 1-10) so it doesn't look cramped.
  ghost: {
    palette: {
      a: "#fbfbff",
      b: DARK,
    },
    rows: [
      "............",
      "...aaaaaa...",
      "..aaaaaaaa..",
      ".aaaaaaaaaa.",
      ".aaaaaaaaaa.",
      ".aaaaaaaaaa.",
      ".aabbaabbaa.",
      ".aaaaaaaaaa.",
      ".aaaaaaaaaa.",
      ".aaaaaaaaaa.",
      ".aaaaaaaaaa.",
      ".aa.aaaa.aa.",
    ],
  },

  // Classic cartoon cloud: three puffy bumps on top at different heights,
  // wide rounded rectangular body, smooth rounded bottom. Two small
  // raindrops fall from underneath so at a glance "weather cloud" reads
  // immediately, distinguishing it from ghost at every level.
  cloud: {
    palette: {
      a: "#f8fbff",
      b: DARK,
      d: "#9ecae6",
    },
    rows: [
      "...aa.aaa...",
      "..aaaaaaaa..",
      ".aaaaaaaaaa.",
      "aaaaaaaaaaaa",
      "aaaaaaaaaaaa",
      "aabbaaaabbaa",
      "aaaaaaaaaaaa",
      "aaaaaaaaaaaa",
      ".aaaaaaaaaa.",
      "..aaaaaaaa..",
      "...d....d...",
      "...d....d...",
    ],
  },

  // Red dome cap with white spots + beige stem. Face lives on the cap.
  mushroom: {
    palette: {
      a: "#da655d",
      b: "#fff4e8",
      c: DARK,
      d: "#e9d0a8",
    },
    rows: [
      "...aaaaaa...",
      ".aaaaaaaaaa.",
      "aaabbaabbaaa",
      "aaaaaaaaaaaa",
      "aaccaaaaccaa",
      "aaaaaaaaaaaa",
      ".aaaaaaaaaa.",
      "..bbbbbbbb..",
      "..bbbbbbbb..",
      "..bbbbbbbb..",
      "..bbbbbbbb..",
      "............",
    ],
  },

  // Narrow head with two long antennae on top + big almond eyes.
  alien: {
    palette: {
      a: "#a8cf71",
      b: DARK,
      c: "#2f241c",
      d: "#799d4b",
    },
    rows: [
      ".d........d.",
      "..d......d..",
      "..d......d..",
      "...aaaaaa...",
      "..aaaaaaaa..",
      ".aaaaaaaaaa.",
      "aaccaaaaccaa",
      "aaccaaaaccaa",
      "aaaaaaaaaaaa",
      ".aaaaaaaaaa.",
      "..aaaaaaaa..",
      "...aaaaaa...",
    ],
  },

  // Oval loaf with score marks and a shy face on the inside.
  bread: {
    palette: {
      a: "#ca8b45",
      b: "#f0d3a7",
      c: "#fff4e2",
      d: DARK,
    },
    rows: [
      "............",
      "...aaaaaa...",
      ".aaaaaaaaaa.",
      "aaabbbbbbaaa",
      "abbbbbbbbbba",
      "abbccbbccbba",
      "abbcdbbdcbba",
      "abbbbddbbbba",
      "abbbbbbbbbba",
      "aaaaaaaaaaaa",
      ".aaaaaaaaaa.",
      "..aaaaaaaa..",
    ],
  },

  // Five-point star outline with a shy face in the middle and two leg points
  // at the bottom — immediately reads as "star" because of the outline shape.
  star: {
    palette: {
      a: "#f5cc4b",
      b: DARK,
      c: "#fff2b1",
    },
    rows: [
      ".....aa.....",
      "....aaaa....",
      "...aaaaaa...",
      "aaaaaaaaaaaa",
      ".aaaaaaaaaa.",
      "..abbaabba..",
      "..aaaaaaaa..",
      "..aaabbaaa..",
      "..aaaaaaaa..",
      ".aaaa..aaaa.",
      ".aaa....aaa.",
      ".aa......aa.",
    ],
  },
};

// Strict width check: every grid must be exactly 12x12. This catches row
// typos (like a stray space or missing char) on module load instead of
// producing a silently misaligned render.
(function assertGrids() {
  for (const [style, def] of Object.entries(defs)) {
    if (def.rows.length !== GRID) {
      throw new Error(
        `[pixel-avatar] ${style} has ${def.rows.length} rows, expected ${GRID}`
      );
    }
    def.rows.forEach((row, i) => {
      if (row.length !== GRID) {
        throw new Error(
          `[pixel-avatar] ${style} row ${i} is ${row.length} wide, expected ${GRID}: "${row}"`
        );
      }
    });
  }
})();

export function PixelAvatar({
  style,
  size = 28,
}: {
  style: AvatarStyle;
  size?: number;
}) {
  const def = defs[style];
  const cell = size / GRID;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      // crispEdges keeps pixel art from getting fuzzy antialiased borders
      // between neighboring rects at non-integer cell sizes (22/12, 28/12…).
      style={{ shapeRendering: "crispEdges" }}
    >
      {def.rows.flatMap((row, y) =>
        row.split("").map((token, x) => {
          if (token === ".") return null;
          const fill = def.palette[token];
          if (!fill) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={fill}
            />
          );
        })
      )}
    </svg>
  );
}
