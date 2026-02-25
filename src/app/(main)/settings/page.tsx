import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const serializedUser = {
    username: String(user.username || ""),
    email: String(user.email || ""),
    avatar: String(user.avatar?.path || ""),
    coverPhoto: String(user.coverPhoto?.path || ""),
    coverPhotoPosition: String(user.coverPhoto?.position || ""),
    coverColor: String(user.coverColor || "#343a40"),
    bio: String(user.bio || ""),
    country: String(user.country?.name || ""),
    ageGroup: String(user.ageGroup || ""),
    gender: String(user.gender || ""),
    memberSince: user.createdAt
      ? new Date(user.createdAt).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "UTC",
        })
      : "",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <SettingsForm user={serializedUser} />
    </div>
  );
}
