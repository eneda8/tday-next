"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

interface ActionResponse {
  success?: boolean;
  error?: string;
  commentId?: string;
}

/**
 * Add a comment to a post.
 */
export async function addComment(
  postId: string,
  body: string
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    const trimmed = body.trim();
    if (!trimmed) {
      return { error: "Comment cannot be empty" };
    }

    if (trimmed.length > 2000) {
      return { error: "Comment is too long (max 2000 characters)" };
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return { error: "User not found" };
    }

    const post = await Post.findById(postId);
    if (!post) {
      return { error: "Post not found" };
    }

    const comment = new Comment({
      body: trimmed,
      author: user._id,
      post: post._id,
    });

    await comment.save();

    // Add to post's comments array
    post.comments = post.comments || [];
    post.comments.push(comment._id);
    await post.save();

    // Add to user's comments array
    user.comments = user.comments || [];
    user.comments.push(comment._id);
    await user.save();

    return { success: true, commentId: comment._id.toString() };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { error: "Something went wrong." };
  }
}

/**
 * Delete a comment (own comments only).
 */
export async function deleteComment(
  commentId: string
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    await dbConnect();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return { error: "Comment not found" };
    }

    if (comment.author.toString() !== session.user.id) {
      return { error: "Not authorized" };
    }

    // Remove comment ref from the post's comments array
    try {
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: comment._id },
      });
    } catch {
      // Post may have been deleted already
    }

    // Remove comment ref from user's comments array
    try {
      await User.findByIdAndUpdate(session.user.id, {
        $pull: { comments: comment._id },
      });
    } catch {
      // Non-critical
    }

    await comment.deleteOne();

    revalidatePath("/profile");
    revalidatePath("/post");

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { error: "Something went wrong." };
  }
}
