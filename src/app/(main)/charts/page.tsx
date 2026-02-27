import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import { redirect } from "next/navigation";
import { getToday } from "@/lib/postHelpers";
import TodaysChartsContent from "./TodaysChartsContent";

export default async function TodaysChartsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const today = getToday();
  const postCount = await Post.countDocuments({ date: today });

  return (
    <TodaysChartsContent
      today={today}
      userCountry={user.country?.name || ""}
      userGender={user.gender || ""}
      userAgeGroup={user.ageGroup || ""}
      postCount={postCount}
    />
  );
}
