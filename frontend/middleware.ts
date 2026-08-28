import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const PUBLIC_PATHS = ["/login", "/signup"];
const PUBLIC_PREFIXES = ["/invitations/"];
const SHIORI_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidShioriId(id: string): boolean {
  return SHIORI_ID_RE.test(id);
}

/** 未ログイン時の returnUrl（モック ID itinerary-1 等を除外） */
function loginReturnUrl(pathname: string): string {
  const match = pathname.match(/^\/itineraries\/([^/]+)/);
  if (match && !isValidShioriId(match[1])) {
    return "/itineraries";
  }
  return pathname;
}

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith("/itineraries") || pathname.startsWith("/settings");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.has(AUTH_COOKIE_NAME);

  if (isProtectedPath(pathname) && !hasAuth) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("returnUrl", loginReturnUrl(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (hasAuth && (pathname === "/login" || pathname === "/signup")) {
    const listUrl = request.nextUrl.clone();
    listUrl.pathname = "/itineraries";
    listUrl.search = "";
    return NextResponse.redirect(listUrl);
  }

  if (pathname === "/" && hasAuth) {
    const listUrl = request.nextUrl.clone();
    listUrl.pathname = "/itineraries";
    return NextResponse.redirect(listUrl);
  }

  if (pathname === "/" && !hasAuth) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/settings/:path*",
    "/itineraries/:path*",
    "/invitations/:path*",
  ],
};
