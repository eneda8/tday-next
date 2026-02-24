"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost, updatePost, toggleBookmark } from "@/app/actions/posts";
import { countryNameToEmoji } from "@/lib/utils";

interface PostCardProps {
  post: {
    _id: string;
    date: string;
    rating: number;
    body?: string;
    image?: { path: string };
    authorUsername: string;
    authorCountry?: string;
    authorGender?: string;
    authorAgeGroup?: string;
    authorID: string;
    authorAvatar?: string;
    comments: number;
    edited?: boolean;
    createdAt: string;
  };
  currentUserId: string;
  isBookmarked?: boolean;
}

const RATING_COLORS: Record<number, string> = {
  1: "#E74C3C",
  2: "#E67E22",
  3: "#F1C40F",
  4: "#27AE60",
  5: "#2ECC71",
};

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dw3o86f8j/image/upload/v1634179812/t%27day/avatars/defaultAvatar2_qyqc9t.png";

/** Check if the post date is today (same-day edit window) */
function isSameDay(postDate: string): boolean {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return postDate === today;
}

export default function PostCard({ post, currentUserId, isBookmarked: initialBookmarked = false }: PostCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(post.rating);
  const [editBody, setEditBody] = useState(post.body || "");
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarking, setBookmarking] = useState(false);

  const isOwn = currentUserId === post.authorID;
  const canEdit = isOwn && isSameDay(post.date);
  const flag = countryNameToEmoji(post.authorCountry || "");
  const ratingColor = RATING_COLORS[post.rating] || RATING_COLORS[3];

  const avatarUrl = post.authorAvatar
    ? post.authorAvatar.includes("/upload")
      ? post.authorAvatar.replace("/upload", "/upload/w_80,h_80,c_fill")
      : post.authorAvatar
    : DEFAULT_AVATAR;

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updatePost(post._id, { rating: editRating, body: editBody });
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to edit:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.origin + "/post/" + post._id;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // ========== EDIT MODE ==========
  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-5 mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-warm-brown mb-2">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEditRating(s)}
                className="text-xl transition-transform hover:scale-110"
                style={{
                  color:
                    s <= editRating
                      ? RATING_COLORS[editRating]
                      : "var(--color-warm-border)",
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={editBody}
          onChange={(e) => setEditBody(e.target.value)}
          className="w-full border border-warm-border/40 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-forest/30 bg-cream-light text-warm-brown"
          rows={4}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-forest text-cream-light text-sm rounded-lg hover:bg-forest-hover transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-cream-dark text-warm-brown text-sm rounded-lg hover:bg-warm-border/40 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ========== NORMAL VIEW ==========
  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-4 sm:p-5">
      {/* Header: avatar, name, flag, date + stars */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-cream-dark">
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            {/* Name line */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-warm-brown">
                {isOwn ? post.authorUsername : "Anonymous"}
              </span>
              {flag && (
                <span className="text-lg" title={post.authorCountry}>
                  {flag}
                </span>
              )}
            </div>

            {/* Date + star rating + demographics */}
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-xs text-warm-gray">
                {post.date}:
              </span>
              <span className="flex gap-px">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="text-xs"
                    style={{
                      color:
                        s <= post.rating
                          ? ratingColor
                          : "var(--color-warm-border)",
                    }}
                  >
                    ★
                  </span>
                ))}
              </span>
              {post.edited && (
                <>
                  <span className="text-warm-border">·</span>
                  <span className="text-[11px] text-warm-gray italic">edited</span>
                </>
              )}
              {(post.authorGender || post.authorAgeGroup) && (
                <>
                  <span className="text-warm-border">·</span>
                  {post.authorGender && (
                    <span className="text-[11px] text-warm-gray/70">
                      {post.authorGender.charAt(0).toUpperCase() +
                        post.authorGender.slice(1)}
                    </span>
                  )}
                  {post.authorGender && post.authorAgeGroup && (
                    <span className="text-warm-border">·</span>
                  )}
                  {post.authorAgeGroup && (
                    <span className="text-[11px] text-warm-gray/70">
                      {post.authorAgeGroup}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options menu */}
        {canEdit && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full text-warm-gray hover:text-warm-brown hover:bg-cream-dark/50 transition-colors"
              title="Options"
            >
              <i className="fas fa-ellipsis-h text-xs" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-32 rounded-lg border border-warm-border/40 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-warm-brown hover:bg-cream-light transition-colors"
                  >
                    <i className="fas fa-edit text-xs text-warm-gray" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <i className="fas fa-trash text-xs" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Body text */}
      {post.body && (
        <p className="mb-3 text-sm leading-relaxed text-warm-brown-light whitespace-pre-line">
          {post.body}
        </p>
      )}

      {/* Post image */}
      {post.image?.path && (
        <div className="mb-3 -mx-4 sm:-mx-5 overflow-hidden">
          <img
            src={post.image.path.replace("/upload", "/upload/w_600,c_fill")}
            alt="Post image"
            className="w-full object-cover"
            style={{ maxHeight: "320px" }}
          />
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-warm-border/20 text-warm-gray text-xs">
        {/* Comments */}
        <Link
          href={"/post/" + post._id}
          className="flex items-center gap-1.5 hover:text-forest transition-colors"
        >
          <i className="far fa-comment" />
          <span>{post.comments || 0}</span>
        </Link>

        {/* Copy link */}
        <div className="relative">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 hover:text-forest transition-colors"
            title="Copy link"
          >
            <i className="fas fa-link text-[10px]" />
          </button>
          {copied && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded bg-warm-brown px-2 py-1 text-[10px] text-cream-light whitespace-nowrap">
              Copied!
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={async () => {
            if (bookmarking) return;
            setBookmarking(true);
            // Optimistic update
            setBookmarked(!bookmarked);
            try {
              const result = await toggleBookmark(post._id);
              if (result.error) {
                // Revert on error
                setBookmarked(bookmarked);
                console.error(result.error);
              }
            } catch (err) {
              setBookmarked(bookmarked);
              console.error("Bookmark failed:", err);
            } finally {
              setBookmarking(false);
            }
          }}
          className={
            "flex items-center gap-1.5 transition-colors " +
            (bookmarked ? "text-gold" : "hover:text-gold")
          }
          title={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <i className={bookmarked ? "fas fa-bookmark" : "far fa-bookmark"} />
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-warm-brown mb-2">
              Delete Post?
            </h3>
            <p className="text-sm text-warm-gray mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-cream-dark text-warm-brown text-sm rounded-lg hover:bg-warm-border/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
