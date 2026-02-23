"use server";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";

interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  ageGroup: string;
  gender: string;
  countryName: string;
  countryCode: string;
  defaultTimezone: string;
  timezone: string;
}

interface ActionResponse {
  success?: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
  return usernameRegex.test(username);
}

function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > 20) return false;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasNumber && hasUppercase && hasSpecialChar;
}

export async function registerUser(
  input: RegisterUserInput
): Promise<ActionResponse> {
  try {
    if (!isValidUsername(input.username)) {
      return { error: "Username must be 3-16 characters, alphanumeric and underscore only" };
    }
    if (!isValidEmail(input.email)) {
      return { error: "Invalid email format" };
    }
    if (!isValidPassword(input.password)) {
      return { error: "Password must be 8-20 characters with at least one number, one uppercase letter, and one special character" };
    }
    if (!input.ageGroup || !input.gender || !input.countryName) {
      return { error: "Missing required fields" };
    }

    await dbConnect();

    const existingUsername = await User.findOne({
      username: input.username.toLowerCase(),
    });
    if (existingUsername) {
      return { error: "Username already taken" };
    }

    const existingEmail = await User.findOne({
      email: input.email.toLowerCase(),
    });
    if (existingEmail) {
      return { error: "Email already registered" };
    }

    // Hash password using pbkdf2 (passport-local-mongoose compatible)
    const { hash, salt } = User.hashPassword(input.password);

    const verifyEmailToken = crypto.randomBytes(20).toString("hex");
    const verifyTokenExpires = Date.now() + 3600000;

    const newUser = new User({
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      hash,
      salt,
      ageGroup: input.ageGroup,
      gender: input.gender,
      country: {
        name: input.countryName,
        flag: `/images/flags/${input.countryCode}.png`,
      },
      timezone: input.timezone,
      defaultTimezone: input.defaultTimezone,
      termsAgreement: true,
      isVerified: false,
      verifyEmailToken,
      verifyTokenExpires,
      avatar: {
        path: "https://res.cloudinary.com/dufbsxmjt/image/upload/v1596386694/t%27day/avatars/defaultAvatar2_qyqc9t.png",
        filename: "t'day/avatars/defaultAvatar2_qyqc9t.png",
      },
    });

    await newUser.save();
    return { success: true };
  } catch (error) {
    console.error("Error in registerUser:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unexpected error occurred during registration" };
  }
}
