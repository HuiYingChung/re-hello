import { cookies } from "next/headers";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { exportPayloadSchema } from "@/lib/data-schema";
import { loadState, saveState } from "@/lib/database";

async function isAuthorized() {
  const cookieStore = await cookies();
  return verifySessionToken(
    cookieStore.get(authConfig.cookieName)?.value,
    process.env.AUTH_SECRET
  );
}

export async function GET() {
  if (!(await isAuthorized())) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  try {
    return Response.json(
      { data: await loadState() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { error: "Die Datenbank ist noch nicht erreichbar." },
      { status: 503 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const result = exportPayloadSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Das Datenformat wurde nicht erkannt." },
      { status: 400 }
    );
  }

  try {
    await saveState(result.data);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Die Änderungen konnten nicht gespeichert werden." },
      { status: 503 }
    );
  }
}
