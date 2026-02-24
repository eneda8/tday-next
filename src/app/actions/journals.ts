"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Journal from "@/models/Journal";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

interface ActionResponse {
  success?: boolean;
  error?: string;
  journalId?: string;
}

function getToday(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Create a new journal entry.
 */
export async function createJournal(input: {
  title?: string;
  body: string;
}): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    if (!input.body?.trim()) {
      return { error: "Journal body cannot be empty" };
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return { error: "User not found" };
    }

    const journal = new Journal({
      date: getToday(),
      title: input.title?.trim() || "",
      body: input.body.trim(),
      author: user._id,
    });

    await journal.save();

    // Add journal to user's journals array (at the front)
    user.journals = user.journals || [];
    user.journals.unshift(journal._id);
    await user.save();

    revalidatePath("/write");
    revalidatePath("/journal");
    revalidatePath("/profile");

    return { success: true, journalId: journal._id.toString() };
  } catch (error) {
    console.error("Error creating journal:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Update an existing journal entry (own journals only).
 */
export async function updateJournal(
  journalId: string,
  updates: { title?: string; body?: string }
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    await dbConnect();

    const journal = await Journal.findById(journalId);
    if (!journal) {
      return { error: "Journal not found" };
    }

    if (journal.author.toString() !== session.user.id) {
      return { error: "Not authorized" };
    }

    if (updates.title !== undefined) {
      journal.title = updates.title.trim();
    }
    if (updates.body !== undefined) {
      if (!updates.body.trim()) {
        return { error: "Journal body cannot be empty" };
      }
      journal.body = updates.body.trim();
    }

    journal.edited = true;
    await journal.save();

    revalidatePath("/write");
    revalidatePath("/write/" + journalId);
    revalidatePath("/journal");

    return { success: true };
  } catch (error) {
    console.error("Error updating journal:", error);
    return { error: "Something went wrong." };
  }
}

/**
 * Delete a journal entry (own journals only).
 */
export async function deleteJournal(
  journalId: string
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in" };
    }

    await dbConnect();

    const journal = await Journal.findById(journalId);
    if (!journal) {
      return { error: "Journal not found" };
    }

    if (journal.author.toString() !== session.user.id) {
      return { error: "Not authorized" };
    }

    // Remove from user's journals array
    const user = await User.findById(session.user.id);
    if (user) {
      user.journals = (user.journals || []).filter(
        (j: any) => j.toString() !== journalId
      );
      await user.save();
    }

    await journal.deleteOne();

    revalidatePath("/write");
    revalidatePath("/journal");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error deleting journal:", error);
    return { error: "Something went wrong." };
  }
}
