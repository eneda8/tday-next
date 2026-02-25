import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Journal from "@/models/Journal";
import { redirect } from "next/navigation";
import JournalList from "@/components/JournalList";

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  // Fetch journals — do NOT use .lean(), decryption needs Mongoose docs
  let journals: any[] = [];
  try {
    if (user.journals && user.journals.length > 0) {
      const rawJournals = await Journal.find({ _id: { $in: user.journals } })
        .sort({ createdAt: -1 });
      journals = rawJournals.map((j) => j.toObject());
    }
  } catch (err) {
    console.error("Error fetching journals:", err);
  }

  const serializedJournals = journals.map((j: any) => ({
    _id: String(j._id),
    date: String(j.date || ""),
    title: j.title ? String(j.title) : "",
    body: String(j.body || ""),
    edited: Boolean(j.edited),
    createdAt: j.createdAt
      ? new Date(j.createdAt).toISOString()
      : new Date().toISOString(),
  }));

  return (
    <div className="paper-bg min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-warm-brown mb-1">
            <i className="fas fa-book-open text-forest/60 mr-2" />
            My Journal
          </h1>
          <p className="text-xs text-warm-gray font-mono">
            <i className="fas fa-lock text-[10px] mr-1" />
            Private &amp; encrypted — only you can read these.
          </p>
        </div>

        <JournalList journals={serializedJournals} />
      </div>
    </div>
  );
}
