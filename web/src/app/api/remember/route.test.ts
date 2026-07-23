import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OPENAI_API_KEY_HEADER } from "@/lib/remember-api";

const openaiMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  parse: vi.fn(),
}));

vi.mock("openai", async () => {
  const actual = await vi.importActual<typeof import("openai")>("openai");

  return {
    ...actual,
    default: class MockOpenAI {
      responses = { parse: openaiMocks.parse };

      constructor(options: { apiKey: string }) {
        openaiMocks.constructor(options);
      }
    },
  };
});

import { POST } from "./route";

const note =
  "I met Maya at the neighborhood book club and we talked about sourdough.";
const userApiKey = "visitor-test-key-that-is-long-enough";
const draft = {
  name: "Maya",
  oneLiner: "Book club friend",
  where: "the neighborhood book club",
  impression: "",
  talkedAbout: "Sourdough",
  memorableDetail: "",
  nextTimeAsk: "How is the sourdough going?",
};

function makeRequest({
  key = userApiKey,
  memory = note,
  origin = "https://rehello.example",
}: {
  key?: string | null;
  memory?: string;
  origin?: string | null;
} = {}) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (key !== null) headers.set(OPENAI_API_KEY_HEADER, key);
  if (origin !== null) headers.set("Origin", origin);

  return new Request("https://rehello.example/api/remember", {
    method: "POST",
    headers,
    body: JSON.stringify({ memory }),
  });
}

describe("POST /api/remember", () => {
  const originalOwnerKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalOwnerKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOwnerKey;
    }
  });

  it("ignores an owner environment key and requires a visitor key", async () => {
    process.env.OPENAI_API_KEY = "owner-key-must-never-be-used";

    const response = await POST(makeRequest({ key: null }));
    const body = await response.text();

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).not.toContain(process.env.OPENAI_API_KEY);
    expect(openaiMocks.constructor).not.toHaveBeenCalled();
    expect(openaiMocks.parse).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin browser request before using the key", async () => {
    const response = await POST(
      makeRequest({ origin: "https://attacker.example" })
    );

    expect(response.status).toBe(403);
    expect(openaiMocks.constructor).not.toHaveBeenCalled();
  });

  it("validates the note before creating an OpenAI client", async () => {
    const response = await POST(makeRequest({ memory: "Too short" }));

    expect(response.status).toBe(400);
    expect(openaiMocks.constructor).not.toHaveBeenCalled();
  });

  it("uses the visitor key with structured output and no provider storage", async () => {
    openaiMocks.parse.mockResolvedValue({ output_parsed: draft });

    const response = await POST(makeRequest());
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(openaiMocks.constructor).toHaveBeenCalledWith({
      apiKey: userApiKey,
    });
    expect(openaiMocks.parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.6-terra",
        store: false,
        text: expect.objectContaining({
          format: expect.anything(),
        }),
      })
    );
    expect(body).not.toContain(userApiKey);
    expect(JSON.parse(body)).toEqual({
      draft,
      model: "gpt-5.6-terra",
    });
  });

  it.each([
    [401, "OpenAI rejected that key. Check it and try again."],
    [403, "That key doesn't have permission to use this model."],
    [429, "OpenAI says this project is rate-limited or out of API credit."],
    [500, "Quick Remember is taking a breather. Try again in a moment."],
  ])("maps provider status %s without exposing provider details", async (status, message) => {
    openaiMocks.parse.mockRejectedValue({
      status,
      message: `provider detail containing ${userApiKey}`,
    });

    const response = await POST(makeRequest());
    const body = await response.text();

    expect(response.status).toBe(status === 500 ? 502 : status);
    expect(JSON.parse(body)).toEqual({ error: message });
    expect(body).not.toContain(userApiKey);
    expect(body).not.toContain("provider detail");
  });
});
