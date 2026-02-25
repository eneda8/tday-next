"use client";

import { useState } from "react";
import Link from "next/link";
import { markAllRead, markOneRead } from "@/app/actions/notifications";

interface NotificationItem {
  _id: string;
  type: string;
  fromUsername: string;
  postId: string | null;
  postDate: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsList({
  notifications: initial,
}: {
  notifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState(initial);
  const hasUnread = notifications.some((n) => !n.read);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markOneRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-warm-border/30 bg-white p-12 text-center shadow-card">
        <i className="fas fa-bell-slash text-3xl text-warm-gray/40" />
        <p className="mt-3 text-sm text-warm-gray">No notifications yet</p>
        <p className="mt-1 text-xs text-warm-gray/70">
          When someone comments on your posts, you&apos;ll see it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {hasUnread && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest/10 transition-colors"
          >
            <i className="fas fa-check-double mr-1" />
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notif) => (
          <Link
            key={notif._id}
            href={notif.postId ? `/post/${notif.postId}` : "#"}
            onClick={() => handleClick(notif)}
            className={
              "flex items-start gap-3 rounded-xl border p-4 transition-all hover:shadow-card " +
              (notif.read
                ? "border-warm-border/20 bg-white"
                : "border-forest/20 bg-forest/5")
            }
          >
            {/* Unread indicator */}
            <div className="mt-1 flex-shrink-0">
              {!notif.read ? (
                <span className="block h-2 w-2 rounded-full bg-forest" />
              ) : (
                <span className="block h-2 w-2 rounded-full bg-warm-border/40" />
              )}
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/10 text-forest">
                <i className="fas fa-comment text-sm" />
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className={"text-sm text-warm-brown " + (!notif.read ? "font-semibold" : "")}>
                <span className="text-forest">@{notif.fromUsername}</span>{" "}
                commented on your post
              </p>
              <p className="mt-1 text-sm text-warm-gray line-clamp-2">
                &ldquo;{notif.message}&rdquo;
              </p>
              <p className="mt-1.5 text-xs text-warm-gray/60">
                {timeAgo(notif.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
