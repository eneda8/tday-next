import type { NextAuthConfig } from "next-auth";

// Lightweight auth config that runs on Edge runtime (middleware)
// Does NOT import mongoose, bcrypt, or any Node.js-only modules
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

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

      const protectedRoutes = [
        "/home",
        "/profile",
        "/settings",
        "/posts",
        "/write",
        "/charts",
        "/donate",
      ];

      const isPublicRoute =
        publicRoutes.includes(pathname) ||
        pathname.startsWith("/reset") ||
        pathname.startsWith("/verify");

      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Redirect logged-in users away from login/register
      if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
        return Response.redirect(new URL("/home", nextUrl));
      }

      // Protect authenticated routes
      if (isProtectedRoute && !isLoggedIn) {
        return false; // Redirects to signIn page
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.email = user.email;
        token.isVerified = (user as any).isVerified;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.isVerified = token.isVerified;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },
  providers: [], // Providers added in auth.ts (needs Node.js runtime)
};
