import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import NotificationsList from "./NotificationsList";

export const metadata = {
  title: "Notifications — t'day",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  const notifications = await Notification.find({ recipient: session.user.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const serialized = notifications.map((n: any) => ({
    _id: String(n._id),
    type: String(n.type),
    fromUsername: String(n.fromUsername),
    postId: n.post ? String(n.post) : null,
    postDate: n.postDate ? String(n.postDate) : null,
    message: String(n.message),
    read: Boolean(n.read),
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : "",
  }));

  const unreadCount = serialized.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-warm-brown">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-warm-gray">
              {unreadCount} unread
            </p>
          )}
        </div>
      </div>

      <NotificationsList notifications={serialized} />
    </div>
  );
}
