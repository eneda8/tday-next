"use server";

import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("=== Email (SendGrid not configured) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", html);
    console.log("========================================");
    return;
  }

  const sgMail = (await import("@sendgrid/mail")).default;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL || "no-reply@tday.co",
    subject,
    html,
  });
}

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

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset/${token}`;

    await sendEmail(
      user.email,
      "Reset Password Link",
      `<p>You are receiving this because you (or someone else) have requested to reset the password for your t'day account.</p>
      <p>Please click on the following link, or paste it into your browser to complete the process:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    );

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
    await sendEmail(
      user.email,
      "Your password was changed",
      `<p>This is a confirmation that the password for your t'day account (<strong>${user.email}</strong>) has just been changed.</p>
      <p>If you did not make this change, please contact us immediately at support@tday.co.</p>`
    );

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
