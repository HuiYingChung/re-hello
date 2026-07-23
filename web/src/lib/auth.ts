const SESSION_COOKIE = "rehello_session";
const SESSION_DAYS = 30;

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decode(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function getHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(secret: string, now = Date.now()) {
  const expiresAt = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(expiresAt);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getHmacKey(secret),
    new TextEncoder().encode(payload)
  );
  return `${payload}.${encode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now()
) {
  if (!token || !secret) return false;
  const [payload, signature, extra] = token.split(".");
  const expiresAt = Number(payload);
  if (
    !payload ||
    !signature ||
    extra ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= now
  ) {
    return false;
  }

  try {
    return crypto.subtle.verify(
      "HMAC",
      await getHmacKey(secret),
      decode(signature),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}

export async function passwordsMatch(actual: string, expected: string) {
  const encoder = new TextEncoder();
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(actual)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);

  const actualBytes = new Uint8Array(actualHash);
  const expectedBytes = new Uint8Array(expectedHash);
  if (actualBytes.length !== expectedBytes.length) return false;

  let difference = 0;
  for (let index = 0; index < actualBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

export const authConfig = {
  cookieName: SESSION_COOKIE,
  cookieMaxAge: SESSION_DAYS * 24 * 60 * 60,
};
