import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Routes that require authentication but are exempt from project check
const authOnlyRoutes = ["/onboarding"];

// Public routes where authenticated users may stay (e.g. completing email verification or password reset from email link)
const publicRoutesAllowWhenAuthenticated = ["/auth/verify-email", "/auth/reset-password"];

// Routes that should be skipped by middleware
const skipRoutes = ["/api", "/_next", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, Next.js internals, and static files
  if (skipRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Check if route is auth-only (requires auth but exempt from other checks)
  const isAuthOnlyRoute = authOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Get tokens from cookies
  const accessToken = request.cookies.get("betracked_access_token")?.value;
  const refreshToken = request.cookies.get("betracked_refresh_token")?.value;
  const hasToken = !!(accessToken || refreshToken);

  // Redirect unauthenticated users to login
  if (!isPublicRoute && !isAuthOnlyRoute && !hasToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect unauthenticated users from auth-only routes to login
  if (isAuthOnlyRoute && !hasToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages, unless they're on verify-email or reset-password (flow may require token from email)
  const canStayWhenAuthenticated = publicRoutesAllowWhenAuthenticated.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  if (isPublicRoute && hasToken && !canStayWhenAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
