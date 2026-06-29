import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/verify-email", "/reset-password"];
const PROTECTED_PREFIXES = ["/dashboard", "/places/new", "/places/edit"];
const ADMIN_PREFIXES = ["/admin"];

// Auth route rate limits: keyed by IP + path
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/login":            { limit: 10, windowMs: 15 * 60 * 1000 },   // 10 per 15 min
  "/register":         { limit: 5,  windowMs: 60 * 60 * 1000 },   // 5 per hour
  "/forgot-password":  { limit: 5,  windowMs: 15 * 60 * 1000 },   // 5 per 15 min
  "/reset-password":   { limit: 5,  windowMs: 15 * 60 * 1000 },   // 5 per 15 min
};

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options":           "DENY",
  "X-Content-Type-Options":    "nosniff",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=(self), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function addSecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function middleware(req: NextRequest) {
  const { nextUrl, method } = req;
  const ip = getIp(req);

  // Rate-limit POST submissions to auth routes
  if (method === "POST") {
    for (const [path, cfg] of Object.entries(RATE_LIMITS)) {
      if (nextUrl.pathname.startsWith(path)) {
        const result = rateLimit(`${ip}:${path}`, cfg.limit, cfg.windowMs);
        if (!result.allowed) {
          const res = NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          );
          res.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
          return addSecurityHeaders(res);
        }
        break;
      }
    }
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  const isAuthRoute = AUTH_ROUTES.some((r) => nextUrl.pathname.startsWith(r));
  const isProtected = PROTECTED_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));
  const isAdmin = ADMIN_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));

  if (isAuthRoute && isLoggedIn) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/dashboard", nextUrl)));
  }

  if ((isProtected || isAdmin) && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (isAdmin && token?.role !== "ADMIN") {
    return addSecurityHeaders(NextResponse.redirect(new URL("/", nextUrl)));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
