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
