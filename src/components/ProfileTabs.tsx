"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { deleteComment } from "@/app/actions/comments";

type Tab = "ratings" | "comments" | "bookmarks";

interface SerializedPost {
  _id: string;
  date: string;
  rating: number;
  body?: string;
  image?: { path: string };
  authorUsername: string;
  authorCountry: string;
  authorGender: string;
  authorAgeGroup: string;
  authorID: string;
  authorAvatar: string;
  comments: number;
  edited: boolean;
  createdAt: string;
}

interface SerializedComment {
  _id: string;
  body: string;
  postId: string;
  postDate: string;
  postRating: number;
  postDeleted?: boolean;
  authorUsername: string;
  authorAvatar: string;
  createdAt: string;
}

interface ProfileTabsProps {
  currentUserId: string;
  posts: SerializedPost[];
  comments: SerializedComment[];
  bookmarks: SerializedPost[];
}

const RATING_COLORS: Record<number, string> = {
  1: "#E74C3C",
  2: "#E67E22",
  3: "#F1C40F",
  4: "#27AE60",
  5: "#2ECC71",
};

export default function ProfileTabs({
  currentUserId,
  posts,
  comments,
  bookmarks,
}: ProfileTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ratings");
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: "ratings", label: "Ratings", icon: "fas fa-star", count: posts.length },
    {
      id: "comments",
      label: "Comments",
      icon: "fas fa-comment",
      count: comments.length,
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: "fas fa-bookmark",
      count: bookmarks.length,
    },
  ];

  const handleDeleteComment = async (commentId: string) => {
    setDeletingComment(commentId);
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        router.refresh();
      } else {
        console.error("Failed to delete comment:", result.error);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeletingComment(null);
      setConfirmDeleteComment(null);
    }
  };

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex border-b border-warm-border/30 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors " +
              (tab === t.id
                ? "border-forest text-forest"
                : "border-transparent text-warm-gray hover:text-warm-brown hover:border-warm-border/50")
            }
          >
            <i className={t.icon + " text-xs"} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {/* ===== Ratings ===== */}
        {tab === "ratings" && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                />
              ))
            ) : (
              <EmptyState
                icon="fas fa-star"
                message="No ratings yet. Rate your day to get started!"
              />
            )}
          </div>
        )}

        {/* ===== Comments ===== */}
        {tab === "comments" && (
          <div className="space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => {
                const ratingColor = RATING_COLORS[comment.postRating] || RATING_COLORS[3];
                return (
                  <div
                    key={comment._id}
                    className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-cream-dark flex-shrink-0">
                        {comment.authorAvatar ? (
                          <img
                            src={
                              comment.authorAvatar.includes("/upload")
                                ? comment.authorAvatar.replace(
                                    "/upload",
                                    "/upload/w_80,h_80,c_fill"
                                  )
                                : comment.authorAvatar
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-warm-gray">
                            <i className="fas fa-user" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Header: name + time + delete */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-warm-brown">
                              {comment.authorUsername}
                            </span>
                            <span className="text-[11px] text-warm-gray">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={() => setConfirmDeleteComment(comment._id)}
                            className="p-1 rounded text-warm-gray/50 hover:text-red-400 transition-colors"
                            title="Delete comment"
                          >
                            <i className="fas fa-trash text-[10px]" />
                          </button>
                        </div>
                        <p className="text-sm text-warm-brown mb-2" style={{ whiteSpace: "pre-line" }}>
                          {comment.body}
                        </p>
                        {/* Link to original post with date + stars (or deleted label) */}
                        {comment.postDeleted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-warm-gray/50 italic">
                            <i className="fas fa-trash-alt text-[10px]" />
                            original post deleted
                          </span>
                        ) : (
                          <Link
                            href={"/post/" + comment.postId}
                            className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-forest transition-colors"
                          >
                            <i className="fas fa-reply fa-flip-horizontal text-[10px]" />
                            <span>{comment.postDate}:</span>
                            <span className="flex gap-px">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                  key={s}
                                  style={{
                                    color:
                                      s <= comment.postRating
                                        ? ratingColor
                                        : "var(--color-warm-border)",
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Delete confirmation inline */}
                    {confirmDeleteComment === comment._id && (
                      <div className="mt-3 pt-3 border-t border-warm-border/20 flex items-center justify-between">
                        <span className="text-xs text-warm-gray">Delete this comment?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDeleteComment(null)}
                            className="px-3 py-1 text-xs text-warm-brown bg-cream-dark rounded-lg hover:bg-warm-border/40 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            disabled={deletingComment === comment._id}
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingComment === comment._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon="fas fa-comment"
                message="No comments yet. Comment on a rating to start a conversation!"
              />
            )}
          </div>
        )}

        {/* ===== Bookmarks ===== */}
        {tab === "bookmarks" && (
          <div className="space-y-4">
            {bookmarks.length > 0 ? (
              bookmarks.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  isBookmarked={true}
                />
              ))
            ) : (
              <EmptyState
                icon="fas fa-bookmark"
                message="No bookmarks yet. Bookmark a rating to save it for later!"
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ===== Helper components ===== */

function EmptyState({
  icon,
  message,
  action,
}: {
  icon: string;
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8 text-center">
      <i className={icon + " text-3xl text-warm-border mb-3 block"} />
      <p className="text-warm-gray mb-3">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest hover:bg-forest-hover text-cream-light text-sm font-medium rounded-xl transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* ===== Date format helper ===== */

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
