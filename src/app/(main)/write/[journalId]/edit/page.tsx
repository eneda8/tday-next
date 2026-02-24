import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Journal from "@/models/Journal";
import { redirect, notFound } from "next/navigation";
import JournalEditForm from "@/components/JournalEditForm";

interface EditPageProps {
  params: Promise<{ journalId: string }>;
}

export default async function JournalEditPage({ params }: EditPageProps) {
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
    title: journal.title ? String(journal.title) : "",
    body: String(journal.body || ""),
  };

  return <JournalEditForm journal={serialized} />;
}
