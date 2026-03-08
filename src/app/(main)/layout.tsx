import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Navbar from "@/components/Navbar";
import {
  checkAndResetPostedToday,
  checkAndResetStreak,
} from "@/lib/postHelpers";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let postedToday = false;

  try {
    const session = await auth();
    if (session?.user?.id) {
      await dbConnect();
      await checkAndResetPostedToday(session.user.id);
      await checkAndResetStreak(session.user.id);
      const user = await User.findById(session.user.id)
        .select("postedToday")
        .lean();
      if (user) {
        postedToday = Boolean(user.postedToday);
      }
    }
  } catch (err) {
    console.error("Layout auth check error:", err);
  }

  return (
    <div className="min-h-screen paper-bg">
      <Navbar postedToday={postedToday} />
      <main className="pb-20 md:pb-0">{children}</main>
    </div>
  );
}
