"use server";

import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "@/lib/email";

export async function requestPasswordReset(email: string) {
  try {
    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to avoid email enumeration
    if (!user) {
      return { success: true };
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, token, user.username);

    return { success: true };
  } catch (err) {
    console.error("Password reset request error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(token: string, password: string, confirm: string) {
  try {
    if (password !== confirm) {
      return { error: "Passwords do not match." };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    await dbConnect();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { error: "Password reset token is invalid or has expired." };
    }

    // Hash new password using PBKDF2 (same as registration)
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 25000, 512, "sha256")
      .toString("hex");

    user.hash = hash;
    user.salt = salt;
    user.resetPasswordToken = undefined as any;
    user.resetPasswordExpires = undefined as any;
    await user.save();

    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.username);

    return { success: true };
  } catch (err) {
    console.error("Password reset error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function validateResetToken(token: string) {
  try {
    await dbConnect();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    return { valid: !!user };
  } catch {
    return { valid: false };
  }
}
