import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Journal from "@/models/Journal";
import { redirect, notFound } from "next/navigation";
import JournalView from "@/components/JournalView";

interface JournalPageProps {
  params: Promise<{ journalId: string }>;
}

export default async function JournalViewPage({ params }: JournalPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  const { journalId } = await params;

  if (!journalId.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  // Do NOT use .lean() — decryption plugin requires Mongoose documents
  const journal = await Journal.findById(journalId);

  if (!journal) {
    notFound();
  }

  if (journal.author.toString() !== session.user.id) {
    redirect("/home");
  }

  const serialized = {
    _id: String(journal._id),
    date: String(journal.date || ""),
    title: journal.title ? String(journal.title) : "",
    body: String(journal.body || ""),
    edited: Boolean(journal.edited),
    createdAt: journal.createdAt
      ? new Date(journal.createdAt).toISOString()
      : "",
    updatedAt: journal.updatedAt
      ? new Date(journal.updatedAt).toISOString()
      : "",
  };

  return <JournalView journal={serialized} />;
}
