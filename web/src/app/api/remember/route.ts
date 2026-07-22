import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { QuickMemoryDraft } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "gpt-5.6-terra";
const MIN_MEMORY_LENGTH = 20;
const MAX_MEMORY_LENGTH = 1200;

const quickMemorySchema = z.object({
  name: z
    .string()
    .max(80)
    .describe("The person's name exactly as written by the user, or an empty string if missing."),
  oneLiner: z
    .string()
    .max(100)
    .describe("A warm 2-6 word relationship or context label, grounded only in the note."),
  where: z
    .string()
    .max(160)
    .describe("Where they met, using only details stated by the user."),
  impression: z
    .string()
    .max(300)
    .describe("How the interaction felt, only when the user explicitly described it."),
  talkedAbout: z
    .string()
    .max(500)
    .describe("A concise summary of the topics they discussed."),
  memorableDetail: z
    .string()
    .max(500)
    .describe("One concrete detail worth remembering, without adding new facts."),
  nextTimeAsk: z
    .string()
    .max(300)
    .describe("One natural follow-up question grounded in the user's note, without quotation marks."),
});

const SYSTEM_PROMPT = `You turn a person's messy post-conversation note into a gentle Rehello recall card.

Rules:
- Use only facts explicitly present in the user's note. Never invent, infer, or embellish details.
- Do not infer sensitive traits, diagnoses, intentions, or personality.
- Preserve names and concrete details exactly when possible.
- Keep the user's language. If the note is Chinese, write the card in Chinese; if it is English, write it in English.
- Use an empty string for anything the user did not provide.
- Keep oneLiner warm and human, never sales-like.
- Make nextTimeAsk sound natural and low-pressure. Do not wrap it in quotation marks.
- Return only the structured card.`;

function noStoreJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function trimDraft(draft: QuickMemoryDraft): QuickMemoryDraft {
  return {
    name: draft.name.trim(),
    oneLiner: draft.oneLiner.trim(),
    where: draft.where.trim(),
    impression: draft.impression.trim(),
    talkedAbout: draft.talkedAbout.trim(),
    memorableDetail: draft.memorableDetail.trim(),
    nextTimeAsk: draft.nextTimeAsk.trim(),
  };
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return noStoreJson(
      { error: "Quick Remember isn't connected yet." },
      503
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > 4_000) {
    return noStoreJson({ error: "That note is a little too long." }, 413);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return noStoreJson({ error: "We couldn't read that note." }, 400);
  }

  const memory =
    payload &&
    typeof payload === "object" &&
    "memory" in payload &&
    typeof payload.memory === "string"
      ? payload.memory.trim()
      : "";

  if (memory.length < MIN_MEMORY_LENGTH) {
    return noStoreJson(
      { error: "Add a little more detail so we have something to shape." },
      400
    );
  }

  if (memory.length > MAX_MEMORY_LENGTH) {
    return noStoreJson(
      { error: `Keep the note under ${MAX_MEMORY_LENGTH} characters.` },
      400
    );
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.parse({
      model: MODEL,
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 1_000,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: memory },
      ],
      text: {
        verbosity: "low",
        format: zodTextFormat(quickMemorySchema, "rehello_memory"),
      },
    });

    if (!response.output_parsed) {
      return noStoreJson(
        { error: "We couldn't shape that memory. Try once more." },
        422
      );
    }

    const draft = trimDraft(response.output_parsed);
    if (!draft.name) {
      return noStoreJson(
        { error: "Add their name to the note, then try again." },
        422
      );
    }

    return noStoreJson({ draft, model: MODEL });
  } catch {
    return noStoreJson(
      { error: "Quick Remember is taking a breather. Try again in a moment." },
      502
    );
  }
}
