import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { getToday } from "@/lib/postHelpers";
import AllChartsContent from "./AllChartsContent";

export default async function AllChartsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const today = getToday();
  const userCount = await User.countDocuments();

  return (
    <AllChartsContent
      today={today}
      userGender={user.gender || ""}
      userCount={userCount}
    />
  );
}
