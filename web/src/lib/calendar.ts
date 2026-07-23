import type { Person, Reminder } from "@/lib/types";

function escapeIcs(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function toDateValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

const REPEAT_RULES: Record<NonNullable<Reminder["repeat"]>, string | undefined> = {
  none: undefined,
  monthly: "FREQ=MONTHLY",
  quarterly: "FREQ=MONTHLY;INTERVAL=3",
  yearly: "FREQ=YEARLY",
};

export function createReminderCalendar(reminder: Reminder, person: Person) {
  const date = toDateValue(reminder.triggerDate);
  const rule = reminder.repeat ? REPEAT_RULES[reminder.repeat] : undefined;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Helloagain//Private Reminder//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(reminder.id)}@helloagain`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${date}`,
    `SUMMARY:${escapeIcs(reminder.message || `An ${person.name} denken`)}`,
    `DESCRIPTION:${escapeIcs(`Eine persönliche Erinnerung aus Helloagain für ${person.name}.`)}`,
  ];

  if (rule) lines.push(`RRULE:${rule}`);
  lines.push("END:VEVENT", "END:VCALENDAR", "");
  return lines.join("\r\n");
}

export function downloadReminderCalendar(reminder: Reminder, person: Person) {
  const blob = new Blob([createReminderCalendar(reminder, person)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `helloagain-${person.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
