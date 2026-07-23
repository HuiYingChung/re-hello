import type { QuickMemoryDraft } from "@/lib/types";

export const QUICK_MEMORY_EXAMPLE =
  "I met Maya at the neighborhood book club. We talked about Taiwanese cooking and her sourdough experiments. She said she might bring starter next time. It felt easy and warm.";

export const QUICK_MEMORY_EXAMPLE_DRAFT: QuickMemoryDraft = {
  name: "Maya",
  oneLiner: "Book club friend",
  where: "the neighborhood book club",
  impression: "It felt easy and warm.",
  talkedAbout: "Taiwanese cooking and her sourdough experiments.",
  memorableDetail: "She might bring sourdough starter next time.",
  nextTimeAsk: "How are the sourdough experiments going?",
};
