import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/terms",
  "/privacy",
  "/cookies",
  "/contact",
  "/forgot-password",
  "/verify",
];

// Routes that require authentication
const protectedRoutes = [
  "/home",
  "/profile",
  "/settings",
  "/posts",
  "/write",
  "/charts",
  "/donate",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow all API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if the route is public or matches a reset/verify path
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/reset") ||
    pathname.startsWith("/verify");

  // Get the session
  const session = await auth();

  // If accessing a protected route without a session, redirect to login
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing a public auth route (login/register) while authenticated, redirect to home
  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
