"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

interface CreatePostInput {
  rating: number;
  body?: string;
}

interface ActionResponse {
  success?: boolean;
  error?: string;
  postId?: string;
}

function getToday(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Create a new daily rating post.
 */
export async function createPost(
  input: CreatePostInput
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    if (!input.rating || input.rating < 1 || input.rating > 5) {
      return { error: "Rating must be between 1 and 5" };
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return { error: "User not found" };
    }

    const today = getToday();

    // Check if already posted today
    if (user.postedToday && user.todaysPost) {
      return {
        error: "You've already rated your day today! Come back tomorrow.",
      };
    }

    const post = new Post({
      date: today,
      rating: input.rating,
      body: input.body || "",
      author: user._id,
      authorUsername: user.username,
      authorCountry: user.country?.name || "",
      authorGender: user.gender || "",
      authorAgeGroup: user.ageGroup || "",
      authorID: user._id.toString(),
    });

    await post.save();

    // Update user stats
    user.posts = user.posts || [];
    user.posts.push(post._id);
    user.postedToday = true;
    user.todaysPost = post._id.toString();
    user.postStreak = (user.postStreak || 0) + 1;

    // Recalculate average
    const allPosts = await Post.find({ author: user._id });
    const totalRating = allPosts.reduce(
      (sum: number, p: any) => sum + p.rating,
      0
    );
    user.average =
      allPosts.length > 0
        ? Math.round((totalRating / allPosts.length) * 10) / 10
        : 0;

    await user.save();
    revalidatePath("/home");

    return { success: true, postId: post._id.toString() };
  } catch (error) {
    console.error("Error creating post:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Delete a post (own posts only, within 24 hours).
 */
export async function deletePost(postId: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    await dbConnect();

    const post = await Post.findById(postId);
    if (!post) {
      return { error: "Post not found" };
    }

    // Check ownership
    if (post.author.toString() !== session.user.id) {
      return { error: "Not authorized" };
    }

    // Check if within 24 hours
    const hoursSince =
      (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
    if (hoursSince > 24) {
      return { error: "Can only delete posts within 24 hours" };
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return { error: "User not found" };
    }

    const today = getToday();
    const isTodays = post.date === today;

    // Remove post reference from user
    user.posts = (user.posts || []).filter(
      (p: any) => p.toString() !== postId
    );

    if (isTodays) {
      user.postedToday = false;
      user.todaysPost = "";
      user.postStreak = Math.max(0, (user.postStreak || 1) - 1);
    }

    // Recalculate average
    await post.deleteOne();
    const remaining = await Post.find({ author: user._id });
    const total = remaining.reduce(
      (sum: number, p: any) => sum + p.rating,
      0
    );
    user.average =
      remaining.length > 0
        ? Math.round((total / remaining.length) * 10) / 10
        : 0;

    await user.save();
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { error: "Something went wrong." };
  }
}

/**
 * Update a post (own posts only, within 24 hours).
 */
export async function updatePost(
  postId: string,
  updates: { rating?: number; body?: string }
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    await dbConnect();

    const post = await Post.findById(postId);
    if (!post) {
      return { error: "Post not found" };
    }

    if (post.author.toString() !== session.user.id) {
      return { error: "Not authorized" };
    }

    const hoursSince =
      (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
    if (hoursSince > 24) {
      return { error: "Can only edit posts within 24 hours" };
    }

    if (updates.rating !== undefined) {
      if (updates.rating < 1 || updates.rating > 5) {
        return { error: "Rating must be between 1 and 5" };
      }
      post.rating = updates.rating;
    }

    if (updates.body !== undefined) {
      post.body = updates.body;
    }

    post.edited = true;
    await post.save();

    // Recalculate average if rating changed
    if (updates.rating !== undefined) {
      const user = await User.findById(session.user.id);
      if (user) {
        const allPosts = await Post.find({ author: user._id });
        const total = allPosts.reduce(
          (sum: number, p: any) => sum + p.rating,
          0
        );
        user.average =
          allPosts.length > 0
            ? Math.round((total / allPosts.length) * 10) / 10
            : 0;
        await user.save();
      }
    }

    revalidatePath("/home");
    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { error: "Something went wrong." };
  }
}
