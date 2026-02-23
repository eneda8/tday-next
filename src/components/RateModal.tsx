"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/posts";
import { useRouter } from "next/navigation";

interface RateModalProps {
  onClose: () => void;
}

const FACE_ICONS = [
  { value: 1, icon: "fa-face-sad-cry", color: "#E74C3C" },
  { value: 2, icon: "fa-face-frown", color: "#E67E22" },
  { value: 3, icon: "fa-face-meh", color: "#F1C40F" },
  { value: 4, icon: "fa-face-smile", color: "#27AE60" },
  { value: 5, icon: "fa-face-grin-stars", color: "#2ECC71" },
];

export default function RateModal({ onClose }: RateModalProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsPosting(true);
    setError("");
    try {
      const result = await createPost({
        rating,
        body: body.trim() || undefined,
      });
      if (result.success) {
        router.refresh();
        onClose();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-warm-brown">
            Rate Your Day
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-warm-gray hover:text-warm-brown rounded-full hover:bg-cream-dark/50 transition-colors"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Face icons for rating */}
          <p className="text-sm text-warm-gray mb-3">How&apos;s your day?</p>
          <div className="flex justify-between gap-2 mb-4">
            {FACE_ICONS.map((face) => (
              <button
                key={face.value}
                type="button"
                onClick={() => setRating(face.value)}
                className={
                  "flex-1 py-3 rounded-xl transition-all " +
                  (rating === face.value
                    ? "bg-cream-light ring-2 ring-forest scale-110"
                    : "hover:bg-cream-light hover:scale-105")
                }
              >
                <i
                  className={"fa-solid " + face.icon}
                  style={{
                    color: rating === face.value ? face.color : "#8B7E6F",
                    fontSize: "1.75rem",
                  }}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="text-center mb-3 text-sm font-medium text-forest">
              {rating}/5
            </div>
          )}

          {/* Body text */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Jot down your thoughts (optional)..."
            className="w-full px-3 py-2 text-sm border border-warm-border/40 rounded-lg mb-4 resize-none bg-cream-light text-warm-brown placeholder-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-forest/30"
            rows={3}
          />

          {/* Error message */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-cream-dark text-warm-brown text-sm font-medium rounded-lg hover:bg-warm-border/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPosting || rating === 0}
              className="flex-1 py-2 bg-forest text-cream-light text-sm font-medium rounded-lg hover:bg-forest-hover disabled:bg-cream-dark disabled:text-warm-gray transition-colors"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
