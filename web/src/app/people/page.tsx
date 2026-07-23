"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GripVertical, SlidersHorizontal } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { AppShell } from "@/components/app-shell";
import { PersonCard } from "@/components/person-card";
import { Icon } from "@/components/icon";
import {
  getSortedPeople,
  getLatestEncounter,
  getPeopleSortMode,
  setPeopleSortMode,
  setCustomOrder,
  type PeopleSortMode,
} from "@/lib/storage";
import { Person, Encounter } from "@/lib/types";

const SORT_OPTIONS: { mode: PeopleSortMode; label: string }[] = [
  { mode: "recent", label: "Aktuell" },
  { mode: "alphabetical", label: "A-Z" },
  { mode: "lastMet", label: "Lange nicht gesehen" },
  { mode: "custom", label: "Eigene Reihenfolge" },
];

const SORT_HINT: Record<PeopleSortMode, string> = {
  recent: "Zuletzt hinzugefügt oder aktualisiert.",
  alphabetical: "Nach Vornamen von A bis Z.",
  lastMet: "Wer am längsten nicht mehr getroffen wurde.",
  custom: "Zum Sortieren ziehen. Neue Personen stehen am Ende.",
};

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [encounters, setEncounters] = useState<Map<string, Encounter>>(
    new Map()
  );
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<PeopleSortMode>("recent");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function refresh(mode: PeopleSortMode) {
    const sorted = getSortedPeople(mode);
    setPeople(sorted);
    const encMap = new Map<string, Encounter>();
    sorted.forEach((p) => {
      const enc = getLatestEncounter(p.id);
      if (enc) encMap.set(p.id, enc);
    });
    setEncounters(encMap);
  }

  useEffect(() => {
    const m = getPeopleSortMode();
    // Intentional client-only hydration: sort mode lives in localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSortMode(m);
    refresh(m);
  }, []);

  function changeSort(mode: PeopleSortMode) {
    try {
      setErrorMessage(null);
      setPeopleSortMode(mode);
      setSortMode(mode);
      refresh(mode);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Die Sortierung konnte nicht gespeichert werden."
      );
    }
  }

  // dnd-kit sensors - pointer for mouse, touch for mobile, keyboard for a11y
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = people.findIndex((p) => p.id === active.id);
    const newIndex = people.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    try {
      setErrorMessage(null);
      const reordered = arrayMove(people, oldIndex, newIndex);
      setPeople(reordered);
      setCustomOrder(reordered.map((p) => p.id));

      if (sortMode !== "custom") {
        setPeopleSortMode("custom");
        setSortMode("custom");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Die Reihenfolge konnte nicht gespeichert werden."
      );
    }
  }

  const filtered = search.trim()
    ? people.filter((p) => {
        const q = search.toLowerCase();
        const enc = encounters.get(p.id);
        return (
          p.name.toLowerCase().includes(q) ||
          p.oneLiner.toLowerCase().includes(q) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          p.notes?.toLowerCase().includes(q) ||
          p.contactInfo?.toLowerCase().includes(q) ||
          enc?.where?.toLowerCase().includes(q) ||
          enc?.talkedAbout?.toLowerCase().includes(q) ||
          enc?.memorableDetail?.toLowerCase().includes(q)
        );
      })
    : people;

  // Drag is only enabled in custom mode AND when not searching
  // (search filtering would make drag indices misleading)
  const dragEnabled = sortMode === "custom" && !search.trim();

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-[var(--foreground)]">
            Menschen
          </h1>
          <Link
            href="/settings"
            aria-label="Einstellungen"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <Icon as={SlidersHorizontal} size={16} flat />
          </Link>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nach Name, Ort, Tag oder Thema suchen …"
          className="text-sm"
        />

        {/* Sort selector */}
        {people.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => {
                const active = sortMode === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    onClick={() => changeSort(opt.mode)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              {SORT_HINT[sortMode]}
              {sortMode === "custom" && search.trim() && (
                <> Suche leeren, um zu sortieren.</>
              )}
            </p>
          </div>
        )}

        {errorMessage && (
          <p className="text-sm text-[#c47b7b]">{errorMessage}</p>
        )}

        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              {people.length === 0 ? (
                <>
                  Noch ist niemand hier.{" "}
                  <Link
                    href="/remember"
                    className="text-[var(--accent-strong)] underline"
                  >
                    Jemanden festhalten
                  </Link>
                  .
                </>
              ) : (
                "Keine Treffer gefunden."
              )}
            </p>
          </div>
        ) : dragEnabled ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filtered.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-3">
                {filtered.map((person) => (
                  <SortablePersonCard
                    key={person.id}
                    person={person}
                    encounter={encounters.get(person.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid gap-3">
            {filtered.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                encounter={encounters.get(person.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

/**
 * Sortable wrapper around PersonCard.
 *
 * The grip handle (left side) is the only drag activator. The rest of the
 * card stays clickable as a Link to the profile, so reordering doesn't
 * collide with navigation.
 */
function SortablePersonCard({
  person,
  encounter,
}: {
  person: Person;
  encounter?: Encounter;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: person.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-2">
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`${person.name} zum Sortieren ziehen`}
        className="flex w-7 shrink-0 cursor-grab items-center justify-center rounded-[14px] border border-dashed border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)] active:cursor-grabbing"
      >
        <Icon as={GripVertical} size={16} flat />
      </button>
      <div className="min-w-0 flex-1">
        <PersonCard person={person} encounter={encounter} />
      </div>
    </div>
  );
}
