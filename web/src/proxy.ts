import { NextResponse, type NextRequest } from "next/server";
import { authConfig, verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = new Set([
  "/login",
  "/api/auth/login",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/apple-icon.png"
  ) {
    return NextResponse.next();
  }

  const valid = await verifySessionToken(
    request.cookies.get(authConfig.cookieName)?.value,
    process.env.AUTH_SECRET
  );
  if (valid) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp)$).*)"],
};
