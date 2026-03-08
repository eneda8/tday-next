"use server";

import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

export async function resendVerificationEmail(email: string) {
  try {
    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to avoid email enumeration
    if (!user) {
      return { success: true };
    }

    if (user.isVerified) {
      return { success: true };
    }

    // Generate new token
    const token = crypto.randomBytes(20).toString("hex");
    user.verifyEmailToken = token;
    user.verifyTokenExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendVerificationEmail(user.email, token, user.username);

    return { success: true };
  } catch (err) {
    console.error("Resend verification error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
