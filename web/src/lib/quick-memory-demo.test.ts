import { describe, expect, it } from "vitest";
import {
  QUICK_MEMORY_EXAMPLE,
  QUICK_MEMORY_EXAMPLE_DRAFT,
} from "./quick-memory-demo";

describe("Quick Remember demo fixture", () => {
  it("ships a complete, deterministic card without needing an API response", () => {
    expect(QUICK_MEMORY_EXAMPLE).toContain("Maya");
    expect(QUICK_MEMORY_EXAMPLE_DRAFT).toEqual({
      name: "Maya",
      oneLiner: "Book club friend",
      where: "the neighborhood book club",
      impression: "It felt easy and warm.",
      talkedAbout: "Taiwanese cooking and her sourdough experiments.",
      memorableDetail: "She might bring sourdough starter next time.",
      nextTimeAsk: "How are the sourdough experiments going?",
    });
  });
});
