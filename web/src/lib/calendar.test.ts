import { describe, expect, it } from "vitest";
import { createReminderCalendar } from "@/lib/calendar";

describe("createReminderCalendar", () => {
  it("creates a recurring all-day calendar event", () => {
    const calendar = createReminderCalendar(
      {
        id: "reminder-1",
        personId: "person-1",
        triggerDate: "2026-08-15T00:00:00.000Z",
        message: "Anna, Kaffee?",
        dismissed: false,
        repeat: "quarterly",
      },
      {
        id: "person-1",
        name: "Anna",
        oneLiner: "",
        color: "#fff",
        createdAt: "2026-07-23T00:00:00.000Z",
        updatedAt: "2026-07-23T00:00:00.000Z",
      }
    );

    expect(calendar).toContain("DTSTART;VALUE=DATE:20260815");
    expect(calendar).toContain("RRULE:FREQ=MONTHLY;INTERVAL=3");
    expect(calendar).toContain("SUMMARY:Anna\\, Kaffee?");
  });
});
