import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";

/**
 * Get today's date string in the format used by the DB: "Feb 23, 2026"
 */
export function getToday(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get yesterday's date string in the same format.
 */
export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if user posted today and update their postedToday flag.
 * Mirrors the original setPostedToday middleware.
 */
export async function checkAndResetPostedToday(userId: string) {
  await dbConnect();
  const today = getToday();
  const user = await User.findById(userId);
  if (!user) return null;

  const todaysPost = await Post.findOne({ author: userId, date: today });
  if (todaysPost) {
    user.postedToday = true;
    user.todaysPost = todaysPost._id.toString();
  } else {
    user.postedToday = false;
    user.todaysPost = "";
  }
  await user.save();
  return user;
}

/**
 * Reset post streak if user didn't post yesterday.
 * Mirrors the original resetPostStreak middleware.
 */
export async function checkAndResetStreak(userId: string) {
  await dbConnect();
  const yesterday = getYesterday();
  const user = await User.findById(userId);
  if (!user) return;

  const yesterdayPost = await Post.findOne({ author: userId, date: yesterday });
  if (!yesterdayPost) {
    // Didn't post yesterday
    if (user.postedToday) {
      user.postStreak = 1; // Fresh start
    } else {
      user.postStreak = 0; // No streak
    }
    await user.save();
  }
  // If posted yesterday, streak is already correct from createPost
}

/**
 * Recalculate the user's average rating.
 */
export async function recalculateAverage(userId: string) {
  await dbConnect();
  const objectId = new mongoose.Types.ObjectId(userId);
  const result = await Post.aggregate([
    { $match: { author: objectId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  const avg =
    result.length > 0 ? parseFloat(result[0].avgRating.toFixed(2)) : 0;
  await User.updateOne({ _id: userId }, { $set: { average: avg } });
}
