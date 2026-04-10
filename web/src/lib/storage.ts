import type { AvatarStyle } from "@/lib/avatar-styles";
import { Person, Encounter, Reminder } from "./types";

const KEYS = {
  people: "rehello_people",
  encounters: "rehello_encounters",
  reminders: "rehello_reminders",
};

const SORT_KEY = "rehello_people_sort";
const ORDER_KEY = "rehello_people_order";
const HIDDEN_SECTIONS_KEY = "rehello_hidden_sections";
const ONBOARDED_KEY = "rehello_onboarded";
const STORAGE_WRITE_ERROR =
  "We couldn't save your changes on this device. Please try again.";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    throw new Error(STORAGE_WRITE_ERROR);
  }
}

function setValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    throw new Error(STORAGE_WRITE_ERROR);
  }
}

function removeValue(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    throw new Error(STORAGE_WRITE_ERROR);
  }
}

function asValidDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getEncounterSortTime(encounter: Pick<Encounter, "date" | "createdAt">) {
  return (
    asValidDate(encounter.date)?.getTime() ??
    asValidDate(encounter.createdAt)?.getTime() ??
    0
  );
}

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}

export function formatDateInputValue(value: string | Date = new Date()): string {
  const date = value instanceof Date ? value : asValidDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function todayDateInputValue(): string {
  return formatDateInputValue(new Date());
}

export function parseDateInputAsLocalDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    throw new Error("Please pick a valid date.");
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    throw new Error("Please pick a valid date.");
  }

  return date;
}

export function parseDateInputAsIso(value: string): string {
  return parseDateInputAsLocalDate(value).toISOString();
}

function isValidPerson(value: unknown): value is Person {
  if (!value || typeof value !== "object") return false;
  const person = value as Partial<Person>;

  return (
    typeof person.id === "string" &&
    typeof person.name === "string" &&
    typeof person.oneLiner === "string" &&
    typeof person.color === "string" &&
    !!asValidDate(person.createdAt) &&
    !!asValidDate(person.updatedAt) &&
    (person.contactInfo === undefined || typeof person.contactInfo === "string") &&
    (person.lastReviewedAt === undefined || !!asValidDate(person.lastReviewedAt))
  );
}

function isValidEncounter(value: unknown): value is Encounter {
  if (!value || typeof value !== "object") return false;
  const encounter = value as Partial<Encounter>;
  const moodValid =
    encounter.mood === undefined ||
    encounter.mood === 1 ||
    encounter.mood === 2 ||
    encounter.mood === 3 ||
    encounter.mood === 4 ||
    encounter.mood === 5;

  return (
    typeof encounter.id === "string" &&
    typeof encounter.personId === "string" &&
    !!asValidDate(encounter.createdAt) &&
    (encounter.where === undefined || typeof encounter.where === "string") &&
    (encounter.context === undefined || typeof encounter.context === "string") &&
    (encounter.date === undefined || !!asValidDate(encounter.date)) &&
    (encounter.impression === undefined ||
      typeof encounter.impression === "string") &&
    (encounter.talkedAbout === undefined ||
      typeof encounter.talkedAbout === "string") &&
    (encounter.memorableDetail === undefined ||
      typeof encounter.memorableDetail === "string") &&
    (encounter.nextTimeAsk === undefined ||
      typeof encounter.nextTimeAsk === "string") &&
    moodValid
  );
}

function isValidReminder(value: unknown): value is Reminder {
  if (!value || typeof value !== "object") return false;
  const reminder = value as Partial<Reminder>;

  return (
    typeof reminder.id === "string" &&
    typeof reminder.personId === "string" &&
    !!asValidDate(reminder.triggerDate) &&
    typeof reminder.dismissed === "boolean" &&
    (reminder.message === undefined || typeof reminder.message === "string")
  );
}

export function getPeople(): Person[] {
  return read<Person>(KEYS.people).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getPerson(id: string): Person | undefined {
  return read<Person>(KEYS.people).find((p) => p.id === id);
}

export function savePerson(person: Person) {
  const all = read<Person>(KEYS.people);
  const idx = all.findIndex((p) => p.id === person.id);
  if (idx >= 0) {
    all[idx] = person;
  } else {
    all.push(person);
  }
  write(KEYS.people, all);
}

export function deletePerson(id: string) {
  write(KEYS.people, read<Person>(KEYS.people).filter((p) => p.id !== id));
  write(
    KEYS.encounters,
    read<Encounter>(KEYS.encounters).filter((e) => e.personId !== id)
  );
  write(
    KEYS.reminders,
    read<Reminder>(KEYS.reminders).filter((r) => r.personId !== id)
  );
  setCustomOrder(getCustomOrder().filter((x) => x !== id));
}

export type PeopleSortMode = "recent" | "alphabetical" | "lastMet" | "custom";

export function getPeopleSortMode(): PeopleSortMode {
  if (typeof window === "undefined") return "recent";
  try {
    const v = localStorage.getItem(SORT_KEY);
    if (v === "alphabetical" || v === "lastMet" || v === "custom") return v;
    return "recent";
  } catch {
    return "recent";
  }
}

export function setPeopleSortMode(mode: PeopleSortMode) {
  if (typeof window === "undefined") return;
  setValue(SORT_KEY, mode);
}

export function getCustomOrder(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCustomOrder(ids: string[]) {
  if (typeof window === "undefined") return;
  setValue(ORDER_KEY, JSON.stringify(ids));
}

export function getSortedPeople(mode?: PeopleSortMode): Person[] {
  const m = mode || getPeopleSortMode();
  const all = read<Person>(KEYS.people);

  if (m === "alphabetical") {
    return [...all].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (m === "lastMet") {
    const withTime = all.map((p) => {
      const enc = getLatestEncounter(p.id);
      const t = enc ? getEncounterSortTime(enc) : 0;
      return { person: p, t };
    });
    return withTime.sort((a, b) => a.t - b.t).map((x) => x.person);
  }

  if (m === "custom") {
    const order = getCustomOrder();
    const idMap = new Map(all.map((p) => [p.id, p]));
    const ordered: Person[] = [];
    order.forEach((id) => {
      const p = idMap.get(id);
      if (p) {
        ordered.push(p);
        idMap.delete(id);
      }
    });
    return [...ordered, ...idMap.values()];
  }

  return [...all].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getHiddenSections(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_SECTIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isSectionHidden(id: string): boolean {
  return getHiddenSections().includes(id);
}

export function hideSection(id: string) {
  if (typeof window === "undefined") return;
  const hidden = getHiddenSections();
  if (!hidden.includes(id)) {
    hidden.push(id);
    setValue(HIDDEN_SECTIONS_KEY, JSON.stringify(hidden));
  }
}

export function showSection(id: string) {
  if (typeof window === "undefined") return;
  const hidden = getHiddenSections().filter((s) => s !== id);
  setValue(HIDDEN_SECTIONS_KEY, JSON.stringify(hidden));
}

export function showAllSections() {
  if (typeof window === "undefined") return;
  removeValue(HIDDEN_SECTIONS_KEY);
}

export function getEncounters(personId?: string): Encounter[] {
  const all = read<Encounter>(KEYS.encounters).sort(
    (a, b) => getEncounterSortTime(b) - getEncounterSortTime(a)
  );
  return personId ? all.filter((e) => e.personId === personId) : all;
}

export function getLatestEncounter(personId: string): Encounter | undefined {
  return getEncounters(personId)[0];
}

export function getLatestEncountersMap(): Map<string, Encounter> {
  const latestByPerson = new Map<string, Encounter>();

  read<Encounter>(KEYS.encounters).forEach((encounter) => {
    const current = latestByPerson.get(encounter.personId);
    if (
      !current ||
      getEncounterSortTime(encounter) > getEncounterSortTime(current)
    ) {
      latestByPerson.set(encounter.personId, encounter);
    }
  });

  return latestByPerson;
}

export function getEncounter(id: string): Encounter | undefined {
  return read<Encounter>(KEYS.encounters).find((e) => e.id === id);
}

export function deleteEncounter(id: string) {
  const all = read<Encounter>(KEYS.encounters);
  const target = all.find((e) => e.id === id);
  write(
    KEYS.encounters,
    all.filter((e) => e.id !== id)
  );

  if (target) {
    const person = getPerson(target.personId);
    if (person) {
      savePerson({ ...person, updatedAt: new Date().toISOString() });
    }
  }
}

export function saveEncounter(encounter: Encounter) {
  const all = read<Encounter>(KEYS.encounters);
  const idx = all.findIndex((e) => e.id === encounter.id);
  if (idx >= 0) {
    all[idx] = encounter;
  } else {
    all.push(encounter);
  }
  write(KEYS.encounters, all);

  const person = getPerson(encounter.personId);
  if (person) {
    savePerson({ ...person, updatedAt: new Date().toISOString() });
  }
}

export function getReminders(): Reminder[] {
  return read<Reminder>(KEYS.reminders)
    .filter((r) => !r.dismissed)
    .sort(
      (a, b) =>
        new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime()
    );
}

export function saveReminder(reminder: Reminder) {
  const all = read<Reminder>(KEYS.reminders);
  const idx = all.findIndex((r) => r.id === reminder.id);
  if (idx >= 0) {
    all[idx] = reminder;
  } else {
    all.push(reminder);
  }
  write(KEYS.reminders, all);
}

export function getDueReminders(): Reminder[] {
  const now = Date.now();
  return getReminders().filter((r) => new Date(r.triggerDate).getTime() <= now);
}

export function getUpcomingReminders(daysAhead = 7): Reminder[] {
  const now = Date.now();
  const cutoff = now + daysAhead * 86400000;
  return getReminders().filter((r) => {
    const t = new Date(r.triggerDate).getTime();
    return t > now && t <= cutoff;
  });
}

export function dismissReminder(id: string) {
  const all = read<Reminder>(KEYS.reminders);
  const reminder = all.find((r) => r.id === id);
  if (reminder) {
    reminder.dismissed = true;
    write(KEYS.reminders, all);
  }
}

export function markPersonReviewed(id: string) {
  const person = getPerson(id);
  if (!person) return;
  savePerson({ ...person, lastReviewedAt: new Date().toISOString() });
}

export function getPeopleWorthReviewing(limit = 3): Person[] {
  const now = Date.now();
  const dayMs = 86400000;
  return getPeople()
    .map((p) => {
      const latest = getLatestEncounter(p.id);
      if (!latest) return null;
      const encAge = now - getEncounterSortTime(latest);
      if (encAge < dayMs) return null;
      const reviewedAge = p.lastReviewedAt
        ? now - new Date(p.lastReviewedAt).getTime()
        : Infinity;
      if (reviewedAge < 7 * dayMs) return null;
      return { person: p, score: reviewedAge };
    })
    .filter((x): x is { person: Person; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.person);
}

export type ExportPayload = {
  version: 1;
  exportedAt: string;
  people: Person[];
  encounters: Encounter[];
  reminders: Reminder[];
};

export function exportData(): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    people: read<Person>(KEYS.people),
    encounters: read<Encounter>(KEYS.encounters),
    reminders: read<Reminder>(KEYS.reminders),
  };
}

export function importData(payload: unknown): {
  ok: boolean;
  message: string;
} {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "Not a valid backup file." };
  }

  const p = payload as Partial<ExportPayload>;
  if (
    p.version !== 1 ||
    !Array.isArray(p.people) ||
    !Array.isArray(p.encounters) ||
    !Array.isArray(p.reminders) ||
    !p.people.every(isValidPerson) ||
    !p.encounters.every(isValidEncounter) ||
    !p.reminders.every(isValidReminder)
  ) {
    return { ok: false, message: "Backup format not recognized." };
  }

  try {
    write(KEYS.people, p.people);
    write(KEYS.encounters, p.encounters);
    write(KEYS.reminders, p.reminders);
    removeValue(SORT_KEY);
    removeValue(ORDER_KEY);
    removeValue(HIDDEN_SECTIONS_KEY);
    return {
      ok: true,
      message: `Restored ${p.people.length} people and ${p.encounters.length} moments.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : STORAGE_WRITE_ERROR,
    };
  }
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  removeValue(KEYS.people);
  removeValue(KEYS.encounters);
  removeValue(KEYS.reminders);
  removeValue(SORT_KEY);
  removeValue(ORDER_KEY);
  removeValue(HIDDEN_SECTIONS_KEY);
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "true";
  } catch {
    return true;
  }
}

export function markOnboarded() {
  setValue(ONBOARDED_KEY, "true");
}

export function resetOnboarding() {
  if (typeof window === "undefined") return;
  removeValue(ONBOARDED_KEY);
}

export function seedDemoData(): boolean {
  return seedIfEmpty();
}

export function seedIfEmpty(): boolean {
  if (read<Person>(KEYS.people).length > 0) return false;

  const now = new Date();
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 86400000).toISOString();
  const daysFromNow = (d: number) =>
    new Date(now.getTime() + d * 86400000).toISOString();

  const people: Person[] = [
    {
      id: "rachel",
      name: "Rachel",
      oneLiner: "Book club friend",
      color: "#d48e61",
      avatarStyle: "cat",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: "sarah",
      name: "Sarah",
      oneLiner: "PM at TechCorp",
      color: "#6c89a8",
      avatarStyle: "star",
      createdAt: daysAgo(14),
      updatedAt: daysAgo(14),
    },
    {
      id: "marcus",
      name: "Marcus",
      oneLiner: "Trail running buddy",
      color: "#5e9e9e",
      avatarStyle: "dog",
      createdAt: daysAgo(21),
      updatedAt: daysAgo(21),
    },
    {
      id: "amy",
      name: "Amy",
      oneLiner: "Google recruiter",
      color: "#72977b",
      avatarStyle: "alien",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
    {
      id: "lin",
      name: "Lin",
      oneLiner: "Bakery owner",
      color: "#c47b7b",
      avatarStyle: "bread",
      createdAt: daysAgo(45),
      updatedAt: daysAgo(45),
    },
  ];

  const encounters: Encounter[] = [
    {
      id: "enc-rachel-1",
      personId: "rachel",
      where: "Local book club",
      context: "Book club meeting",
      date: daysAgo(3),
      impression:
        "Warm and curious. She laughed easily and made the conversation feel relaxed.",
      talkedAbout:
        "Taiwanese cooking, the novel her book club is reading, weekend baking experiments",
      memorableDetail:
        "She has been baking sourdough for almost a year and brought a starter to share at the next cooking meetup.",
      nextTimeAsk:
        "How is the sourdough going? Did your friends actually get hooked on baking too?",
      mood: 5,
      createdAt: daysAgo(3),
    },
    {
      id: "enc-sarah-1",
      personId: "sarah",
      where: "Company happy hour",
      context: "After-work social",
      date: daysAgo(14),
      impression:
        "Sharp thinker, but easy to talk to. She felt thoughtful instead of performative.",
      talkedAbout:
        "Product design books, her switch from engineering into PM, running a small reading group at work",
      memorableDetail:
        "She runs a PM reading group on the first Thursday of each month and just finished a book on design systems.",
      nextTimeAsk:
        "How is the reading group going, and what design book did you pick for this month?",
      mood: 4,
      createdAt: daysAgo(14),
    },
    {
      id: "enc-marcus-1",
      personId: "marcus",
      where: "Saturday morning trail run",
      context: "Trail running meetup",
      date: daysAgo(21),
      impression:
        "Steady and easy company. He kept pace without making it feel like a race.",
      talkedAbout:
        "Trail running routes around Phoenix, training for his first marathon, books about endurance and ultra running",
      memorableDetail:
        "He is training for the Phoenix marathon in November and is reading a book about ultra running by Scott Jurek.",
      nextTimeAsk:
        "How is marathon training going? Any new running routes worth trying this weekend?",
      mood: 4,
      createdAt: daysAgo(21),
    },
    {
      id: "enc-amy-1",
      personId: "amy",
      where: "ASU career fair",
      context: "Career fair",
      date: daysAgo(30),
      impression:
        "Friendly, grounded, and surprisingly attentive in a busy setting.",
      talkedAbout:
        "UX research roles, design portfolios, what recruiters look for in case studies",
      memorableDetail:
        "She said strong design portfolios usually show real user research, not just polished visuals.",
      nextTimeAsk:
        "Is the UX research role still open, and any tips on tightening my design portfolio?",
      mood: 3,
      createdAt: daysAgo(30),
    },
    {
      id: "enc-lin-1",
      personId: "lin",
      where: "Saturday cooking class",
      context: "Cooking class",
      date: daysAgo(45),
      impression:
        "Generous teacher. She handed out tastes of everything before explaining why it worked.",
      talkedAbout:
        "Running her bakery, sourcing local flour, weekend cooking classes for beginners",
      memorableDetail:
        "She runs cooking classes on Saturdays and is writing a small cookbook about Taiwanese family recipes.",
      nextTimeAsk:
        "How is the cookbook coming along? Did the next cooking class fill up?",
      mood: 5,
      createdAt: daysAgo(45),
    },
  ];

  const reminders: Reminder[] = [
    {
      id: "rem-amy-1",
      personId: "amy",
      triggerDate: daysFromNow(1),
      message: "Ask about the UX research role",
      dismissed: false,
    },
    {
      id: "rem-rachel-1",
      personId: "rachel",
      triggerDate: daysFromNow(2),
      message: "Review her card before book club on Saturday",
      dismissed: false,
    },
    {
      id: "rem-marcus-1",
      personId: "marcus",
      triggerDate: daysFromNow(3),
      message: "Confirm Saturday's trail run",
      dismissed: false,
    },
    {
      id: "rem-sarah-1",
      personId: "sarah",
      triggerDate: daysFromNow(4),
      message: "Check in about the PM reading group",
      dismissed: false,
    },
    {
      id: "rem-lin-1",
      personId: "lin",
      triggerDate: daysFromNow(6),
      message: "RSVP for next cooking class",
      dismissed: false,
    },
  ];

  write(KEYS.people, people);
  write(KEYS.encounters, encounters);
  write(KEYS.reminders, reminders);
  return true;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const COLORS = [
  "#d48e61",
  "#6c89a8",
  "#72977b",
  "#c47b7b",
  "#8b7bb5",
  "#b5944f",
  "#5e9e9e",
];
const AVATAR_STYLES: AvatarStyle[] = [
  "tiger",
  "dog",
  "cat",
  "cow",
  "frog",
  "bear",
  "ghost",
  "cloud",
  "mushroom",
  "alien",
  "bread",
  "star",
];

export function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function randomAvatarStyle(): AvatarStyle {
  return AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
}
