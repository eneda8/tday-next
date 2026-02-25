"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";

export async function getUnreadCount(): Promise<number> {
  try {
    const session = await auth();
    if (!session?.user?.id) return 0;

    await dbConnect();
    return await Notification.countDocuments({
      recipient: session.user.id,
      read: false,
    });
  } catch {
    return 0;
  }
}

export async function getNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    await dbConnect();
    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return notifications.map((n: any) => ({
      _id: String(n._id),
      type: String(n.type),
      fromUsername: String(n.fromUsername),
      postId: n.post ? String(n.post) : null,
      postDate: n.postDate ? String(n.postDate) : null,
      message: String(n.message),
      read: Boolean(n.read),
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : "",
    }));
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
}

export async function markAllRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    await dbConnect();
    await Notification.updateMany(
      { recipient: session.user.id, read: false },
      { $set: { read: true } }
    );
  } catch (err) {
    console.error("Error marking notifications read:", err);
  }
}

export async function markOneRead(notificationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    await dbConnect();
    await Notification.updateOne(
      { _id: notificationId, recipient: session.user.id },
      { $set: { read: true } }
    );
  } catch (err) {
    console.error("Error marking notification read:", err);
  }
}
