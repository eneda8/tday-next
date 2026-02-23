import type { NextAuthConfig } from "next-auth";

export default {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute =
        nextUrl.pathname.startsWith("/home") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/rate") ||
        nextUrl.pathname.startsWith("/journal") ||
        nextUrl.pathname.startsWith("/settings");

      if (isOnProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
