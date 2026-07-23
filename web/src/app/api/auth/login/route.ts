import { NextResponse } from "next/server";
import {
  authConfig,
  createSessionToken,
  passwordsMatch,
} from "@/lib/auth";

export async function POST(request: Request) {
  const configuredPassword = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!configuredPassword || !secret) {
    return Response.json(
      { error: "Die private Anmeldung ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!(await passwordsMatch(password, configuredPassword))) {
    return Response.json({ error: "Das Passwort stimmt nicht." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: authConfig.cookieName,
    value: await createSessionToken(secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: authConfig.cookieMaxAge,
  });
  return response;
}
