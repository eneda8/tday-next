import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen paper-bg">
      <Navbar user={{
        username: user.username || "",
        avatar: user.avatar,
        postedToday: user.postedToday || false,
        todaysPost: user.todaysPost || "",
        isVerified: user.isVerified || false,
      }} />
      <main>{children}</main>
    </div>
  );
}
