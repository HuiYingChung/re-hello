import type { AvatarStyle } from "@/lib/avatar-styles";

export type Person = {
  id: string;
  name: string;
  oneLiner: string; // e.g. "Book club friend", "Google recruiter"
  color: string;
  avatarStyle?: AvatarStyle;
  contactInfo?: string; // free-form: phone, IG, email, whatever
  relationship?: "family" | "friend" | "professional" | "acquaintance" | "other";
  tags?: string[];
  birthday?: string; // MM-DD
  notes?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  lastReviewedAt?: string; // last time the user opened the recall card
};

export type Encounter = {
  id: string;
  personId: string;
  where?: string;
  context?: string; // e.g. "career fair", "book club", "coffee"
  date?: string; // ISO date or human-readable
  impression?: string;
  talkedAbout?: string;
  memorableDetail?: string;
  nextTimeAsk?: string; // the most important field
  mood?: 1 | 2 | 3 | 4 | 5; // how the user felt after this interaction
  createdAt: string;
};

export type Reminder = {
  id: string;
  personId: string;
  triggerDate: string; // ISO date
  message?: string;
  dismissed: boolean;
  repeat?: "none" | "monthly" | "quarterly" | "yearly";
};

export type QuickMemoryDraft = {
  name: string;
  oneLiner: string;
  where: string;
  impression: string;
  talkedAbout: string;
  memorableDetail: string;
  nextTimeAsk: string;
};
