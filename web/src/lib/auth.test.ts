import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  passwordsMatch,
  verifySessionToken,
} from "@/lib/auth";

describe("private session", () => {
  it("accepts a signed, unexpired token", async () => {
    const now = Date.UTC(2026, 6, 23);
    const token = await createSessionToken("a long test secret", now);

    await expect(
      verifySessionToken(token, "a long test secret", now + 1_000)
    ).resolves.toBe(true);
  });

  it("rejects expired, modified, and wrongly signed tokens", async () => {
    const now = Date.UTC(2026, 6, 23);
    const token = await createSessionToken("correct secret", now);

    await expect(
      verifySessionToken(token, "correct secret", now + 31 * 24 * 60 * 60 * 1000)
    ).resolves.toBe(false);
    await expect(
      verifySessionToken(`${token}x`, "correct secret", now)
    ).resolves.toBe(false);
    await expect(
      verifySessionToken(token, "wrong secret", now)
    ).resolves.toBe(false);
  });
});

describe("password comparison", () => {
  it("only accepts an exact password", async () => {
    await expect(passwordsMatch("private-passphrase", "private-passphrase")).resolves.toBe(
      true
    );
    await expect(passwordsMatch("Private-passphrase", "private-passphrase")).resolves.toBe(
      false
    );
  });
});
