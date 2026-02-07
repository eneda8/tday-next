import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Type declarations for extended session and token
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      isVerified: boolean;
      avatar?: string;
    };
  }

  interface User {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    avatar?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        try {
          await dbConnect();

          // Find user by username (case-insensitive)
          const user = await User.findOne({
            username: { $regex: `^${credentials.username}$`, $options: "i" },
          });

          if (!user) {
            throw new Error("Invalid username or password");
          }

          // Compare password with bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid username or password");
          }

          // Check if user is verified
          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            avatar: user.avatar || undefined,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
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
});
