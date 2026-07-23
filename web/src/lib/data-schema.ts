import { z } from "zod";

const isoDate = z.string().datetime();

export const personSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  oneLiner: z.string().max(500),
  color: z.string().max(30),
  avatarStyle: z.string().max(30).optional(),
  contactInfo: z.string().max(2000).optional(),
  relationship: z
    .enum(["family", "friend", "professional", "acquaintance", "other"])
    .optional(),
  tags: z.array(z.string().min(1).max(80)).max(30).optional(),
  birthday: z
    .string()
    .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .optional(),
  notes: z.string().max(10000).optional(),
  createdAt: isoDate,
  updatedAt: isoDate,
  lastReviewedAt: isoDate.optional(),
});

export const encounterSchema = z.object({
  id: z.string().min(1).max(100),
  personId: z.string().min(1).max(100),
  where: z.string().max(1000).optional(),
  context: z.string().max(1000).optional(),
  date: isoDate.optional(),
  impression: z.string().max(10000).optional(),
  talkedAbout: z.string().max(10000).optional(),
  memorableDetail: z.string().max(10000).optional(),
  nextTimeAsk: z.string().max(10000).optional(),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  createdAt: isoDate,
});

export const reminderSchema = z.object({
  id: z.string().min(1).max(100),
  personId: z.string().min(1).max(100),
  triggerDate: isoDate,
  message: z.string().max(2000).optional(),
  dismissed: z.boolean(),
  repeat: z.enum(["none", "monthly", "quarterly", "yearly"]).optional(),
});

export const exportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: isoDate,
  people: z.array(personSchema).max(10000),
  encounters: z.array(encounterSchema).max(50000),
  reminders: z.array(reminderSchema).max(50000),
});

export type StoredPayload = z.infer<typeof exportPayloadSchema>;
