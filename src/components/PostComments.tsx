"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment, deleteComment } from "@/app/actions/comments";
import { toggleBookmark } from "@/app/actions/posts";
import { countryNameToEmoji } from "@/lib/utils";

interface CommentData {
  _id: string;
  body: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string;
  authorCountry: string;
  createdAt: string;
}

interface PostCommentsProps {
  postId: string;
  comments: CommentData[];
  currentUserId: string;
  currentUserAvatar: string;
  currentUsername: string;
  isBookmarked: boolean;
}

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

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function PostComments({
  postId,
  comments,
  currentUserId,
  currentUserAvatar,
  currentUsername,
  isBookmarked: initialBookmarked,
}: PostCommentsProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarking, setBookmarking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const result = await addComment(postId, trimmed);
      if (result.error) {
        console.error(result.error);
      } else {
        setBody("");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId);
      if (result.error) {
        console.error(result.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
    setDeleteConfirm(null);
  };

  const handleBookmark = async () => {
    if (bookmarking) return;
    setBookmarking(true);
    setBookmarked(!bookmarked);
    try {
      const result = await toggleBookmark(postId);
      if (result.error) {
        setBookmarked(bookmarked);
        console.error(result.error);
      }
    } catch (err) {
      setBookmarked(bookmarked);
      console.error("Bookmark failed:", err);
    } finally {
      setBookmarking(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center gap-5 px-5 py-3 border-t border-warm-border/20 text-warm-gray">
        {/* Copy link */}
        <div className="relative">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs hover:text-forest transition-colors"
            title="Copy link"
          >
            <i className="fas fa-link text-[10px]" />
            <span>Share</span>
          </button>
          {copied && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded bg-warm-brown px-2 py-1 text-[10px] text-cream-light whitespace-nowrap">
              Copied!
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={
            "flex items-center gap-1.5 text-xs transition-colors " +
            (bookmarked ? "text-gold" : "hover:text-gold")
          }
          title={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <i className={bookmarked ? "fas fa-bookmark" : "far fa-bookmark"} />
          <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
        </button>
      </div>

      {/* Comment input */}
      <div className="px-5 py-4 border-t border-warm-border/20">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-cream-dark mt-0.5">
            <img
              src={currentUserAvatar}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 bg-cream-light border border-warm-border/30 rounded-full px-4 py-2 text-sm text-warm-brown placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest/30"
              disabled={submitting}
            />
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || submitting}
              className="px-4 py-2 bg-forest text-cream-light text-sm font-medium rounded-full hover:bg-forest-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <i className="fas fa-spinner fa-spin" />
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="border-t border-warm-border/20">
        {comments.length > 0 ? (
          <div className="divide-y divide-warm-border/15">
            {comments.map((comment) => {
              const isOwnComment = comment.authorId === currentUserId;
              const flag = countryNameToEmoji(comment.authorCountry);

              return (
                <div key={comment._id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-cream-dark mt-0.5">
                      <img
                        src={comment.authorAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-warm-brown">
                          {isOwnComment
                            ? comment.authorUsername
                            : "Anonymous"}
                        </span>
                        {flag && <span className="text-sm">{flag}</span>}
                        <span className="text-[11px] text-warm-gray">
                          {formatDate(comment.createdAt)}
                        </span>
                        <span className="text-[11px] text-warm-gray/60">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-warm-brown-light leading-relaxed whitespace-pre-line">
                        {comment.body}
                      </p>

                      {/* Delete button for own comments */}
                      {isOwnComment && (
                        <div className="mt-2">
                          {deleteConfirm === comment._id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-warm-gray">
                                Delete this comment?
                              </span>
                              <button
                                onClick={() => handleDelete(comment._id)}
                                className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-[11px] text-warm-gray hover:text-warm-brown"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(comment._id)}
                              className="text-[11px] text-warm-gray hover:text-red-500 transition-colors"
                            >
                              <i className="far fa-trash-alt mr-1" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <i className="far fa-comment-dots text-2xl text-warm-border mb-2 block" />
            <p className="text-sm text-warm-gray">
              Nothing here yet... Say something nice!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
