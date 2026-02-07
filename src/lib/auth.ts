import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

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
  ...authConfig,
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

          const user = await User.findOne({
            username: { $regex: `^${credentials.username}$`, $options: "i" },
          }).select("+password");

          if (!user) {
            throw new Error("Invalid username or password");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid username or password");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            avatar: user.avatar?.path || undefined,
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
});
