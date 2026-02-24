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

  // Validate ObjectId format
  if (!journalId.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  const journal = await Journal.findById(journalId).lean();

  if (!journal) {
    notFound();
  }

  // Authorization — only the author can view their journal
  if ((journal as any).author.toString() !== session.user.id) {
    redirect("/home");
  }

  // Serialize for client component
  const serialized = {
    _id: String((journal as any)._id),
    date: String((journal as any).date || ""),
    title: (journal as any).title ? String((journal as any).title) : "",
    body: String((journal as any).body || ""),
    edited: Boolean((journal as any).edited),
    createdAt: (journal as any).createdAt
      ? new Date((journal as any).createdAt).toISOString()
      : "",
    updatedAt: (journal as any).updatedAt
      ? new Date((journal as any).updatedAt).toISOString()
      : "",
  };

  return <JournalView journal={serialized} />;
}
