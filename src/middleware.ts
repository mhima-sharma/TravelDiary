import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/explore", "/about", "/contact"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/verify-email", "/reset-password"];
const PROTECTED_PREFIXES = ["/dashboard", "/places/new", "/places/edit"];
const ADMIN_PREFIXES = ["/admin"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthRoute = AUTH_ROUTES.some((r) => nextUrl.pathname.startsWith(r));
  const isProtected = PROTECTED_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));
  const isAdmin = ADMIN_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if ((isProtected || isAdmin) && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
