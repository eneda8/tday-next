"use server";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
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

/**
 * Validates email format using a basic regex pattern
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates username: 3-16 characters, alphanumeric + underscore only
 */
function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
  return usernameRegex.test(username);
}

/**
 * Validates password: 8-20 chars, at least one number, one uppercase, one special char
 */
function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > 20) {
    return false;
  }
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return hasNumber && hasUppercase && hasSpecialChar;
}

/**
 * Server action to register a new user
 */
export async function registerUser(
  input: RegisterUserInput
): Promise<ActionResponse> {
  try {
    // Validate inputs
    if (!isValidUsername(input.username)) {
      return {
        error:
          "Username must be 3-16 characters, alphanumeric and underscore only",
      };
    }

    if (!isValidEmail(input.email)) {
      return { error: "Invalid email format" };
    }

    if (!isValidPassword(input.password)) {
      return {
        error:
          "Password must be 8-20 characters with at least one number, one uppercase letter, and one special character",
      };
    }

    if (!input.ageGroup || !input.gender || !input.countryName) {
      return { error: "Missing required fields" };
    }

    // Connect to database
    await dbConnect();

    // Check if username already exists (case-insensitive)
    const existingUsername = await User.findOne({
      username: { $regex: `^${input.username}$`, $options: "i" },
    });

    if (existingUsername) {
      return { error: "Username already taken" };
    }

    // Check if email already exists (case-insensitive)
    const existingEmail = await User.findOne({
      email: { $regex: `^${input.email}$`, $options: "i" },
    });

    if (existingEmail) {
      return { error: "Email already registered" };
    }

    // Hash password with bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Generate email verification token
    const verifyEmailToken = crypto.randomBytes(20).toString("hex");
    const verifyTokenExpires = Date.now() + 3600000; // 1 hour from now

    // Create user document
    const newUser = new User({
      username: input.username,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      ageGroup: input.ageGroup,
      gender: input.gender.toLowerCase(),
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
        path: "https://res.cloudinary.com/dw3o86f8j/image/upload/v1634179812/t%27day/avatars/defaultAvatar2_qyqc9t.png",
        filename: "t'day/avatars/defaultAvatar2_qyqc9t.png",
      },
    });

    // Save user to database
    await newUser.save();

    return { success: true };
  } catch (error) {
    console.error("Error in registerUser:", error);

    // Return a plain object with error message
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "An unexpected error occurred during registration" };
  }
}
