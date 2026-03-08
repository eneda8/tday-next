"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Journal from "@/models/Journal";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import {
  settingsProfileSchema,
  settingsAccountSchema,
  changePasswordSchema,
} from "@/lib/validations";
import { sendAccountDeletedEmail } from "@/lib/email";
import { countries } from "@/lib/countries";

interface ActionResponse {
  success?: boolean;
  error?: string;
}

// Lazy import — cloudinary.ts throws if env vars are missing,
// so we only load it when an image operation actually needs it.
async function getCloudinary() {
  const { default: cloudinary } = await import("@/lib/cloudinary");
  return cloudinary;
}

// ─── Profile (bio, coverColor, avatar, coverPhoto) ─────────────────

export async function updateProfile(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return { error: "User not found" };

  const bio = formData.get("bio") as string | null;
  const coverColor = formData.get("coverColor") as string | null;
  const avatarFile = formData.get("avatar") as File | null;
  const coverPhotoFile = formData.get("coverPhoto") as File | null;
  const removeCoverPhoto = formData.get("removeCoverPhoto") === "true";
  const coverPhotoPosition = formData.get("coverPhotoPosition") as string | null;

  // Validate text fields
  const parsed = settingsProfileSchema.safeParse({ bio: bio || "", coverColor: coverColor || undefined });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    if (parsed.data.bio !== undefined) user.bio = parsed.data.bio;
    if (parsed.data.coverColor) user.coverColor = parsed.data.coverColor;

    // Avatar upload
    if (avatarFile && avatarFile.size > 0) {
      const cl = await getCloudinary();
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${avatarFile.type};base64,${buffer.toString("base64")}`;

      // Delete old avatar if it has a filename
      if (user.avatar?.filename) {
        try { await cl.uploader.destroy(user.avatar.filename); } catch {}
      }

      const result = await cl.uploader.upload(base64, {
        folder: "t'day",
        resource_type: "auto",
      });
      user.avatar = { path: result.secure_url, filename: result.public_id };
    }

    // Remove cover photo
    if (removeCoverPhoto) {
      if (user.coverPhoto?.filename) {
        const cl = await getCloudinary();
        try { await cl.uploader.destroy(user.coverPhoto.filename); } catch {}
      }
      user.set("coverPhoto", null);
    }
    // Cover photo upload (new photo)
    else if (coverPhotoFile && coverPhotoFile.size > 0) {
      const cl = await getCloudinary();
      const bytes = await coverPhotoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${coverPhotoFile.type};base64,${buffer.toString("base64")}`;

      if (user.coverPhoto?.filename) {
        try { await cl.uploader.destroy(user.coverPhoto.filename); } catch {}
      }

      const result = await cl.uploader.upload(base64, {
        folder: "t'day",
        resource_type: "auto",
      });
      user.coverPhoto = { path: result.secure_url, filename: result.public_id };
    }
    // Cover photo position update (existing photo)
    else if (coverPhotoPosition && user.coverPhoto?.path) {
      user.set("coverPhoto", {
        path: user.coverPhoto.path,
        filename: user.coverPhoto.filename,
        position: coverPhotoPosition,
      });
    }

    await user.save();
    revalidatePath("/profile");
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("updateProfile error:", err);
    return { error: "Failed to update profile" };
  }
}

// ─── Account (username, email, country) ─────────────────────────────

export async function updateAccount(input: {
  username?: string;
  email?: string;
  countryName?: string;
}): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = settingsAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return { error: "User not found" };

  try {
    const { username, email, countryName } = parsed.data;

    // Username change
    if (username && username.toLowerCase() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) return { error: "Username is already taken" };
      const newUsername = username.toLowerCase();
      user.username = newUsername;
      // Update denormalized username on all posts
      await Post.updateMany(
        { author: user._id },
        { $set: { authorUsername: newUsername } }
      );
    }

    // Email change
    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return { error: "Email is already in use" };
      user.email = email.toLowerCase();
    }

    // Country change
    if (countryName && countryName !== user.country?.name) {
      const countryObj = countries.find((c) => c.name === countryName);
      user.country = {
        name: countryName,
        flag: countryObj?.code || "",
      };
      // Update denormalized country on all posts
      await Post.updateMany(
        { author: user._id },
        { $set: { authorCountry: countryName } }
      );
    }

    await user.save();
    revalidatePath("/profile");
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("updateAccount error:", err);
    return { error: "Failed to update account" };
  }
}

// ─── Password ───────────────────────────────────────────────────────

export async function changePassword(input: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return { error: "User not found" };

  try {
    // Verify old password
    const oldHash = crypto
      .pbkdf2Sync(parsed.data.oldPassword, user.salt, 25000, 512, "sha256")
      .toString("hex");
    if (oldHash !== user.hash) {
      return { error: "Current password is incorrect" };
    }

    // Set new password
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto
      .pbkdf2Sync(parsed.data.newPassword, salt, 25000, 512, "sha256")
      .toString("hex");
    user.hash = hash;
    user.salt = salt;
    await user.save();

    return { success: true };
  } catch (err) {
    console.error("changePassword error:", err);
    return { error: "Failed to change password" };
  }
}

// ─── Delete Account ─────────────────────────────────────────────────

export async function deleteAccount(input: {
  password: string;
}): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return { error: "User not found" };

  try {
    // Verify password
    const hash = crypto
      .pbkdf2Sync(input.password, user.salt, 25000, 512, "sha256")
      .toString("hex");
    if (hash !== user.hash) {
      return { error: "Password is incorrect" };
    }

    // Send farewell email before deleting (we still have their info)
    await sendAccountDeletedEmail(user.email, user.username);

    // Delete all user data
    await Post.deleteMany({ author: user._id });
    await Comment.deleteMany({ author: user._id });
    await Journal.deleteMany({ author: user._id });
    await User.deleteOne({ _id: user._id });

    return { success: true };
  } catch (err) {
    console.error("deleteAccount error:", err);
    return { error: "Failed to delete account" };
  }
}
