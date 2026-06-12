import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER_COOKIE_NAME = "imd-user-id";

// Public routes that don't require authentication
const publicRoutes = ["/", "/api/auth/login", "/api/auth/logout", "/api/users"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Allow API routes for cron jobs
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  // Check for user cookie
  const userId = request.cookies.get(USER_COOKIE_NAME)?.value;

  if (!userId) {
    // Redirect to login page
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
