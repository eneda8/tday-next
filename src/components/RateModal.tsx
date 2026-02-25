"use client";

import { useState, useRef } from "react";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageData(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsPosting(true);
    setError("");
    try {
      let result;
      if (imageData) {
        const formData = new FormData();
        formData.set("rating", String(rating));
        formData.set("body", body.trim());
        formData.set("image", imageData);
        result = await createPost(formData);
      } else {
        result = await createPost({
          rating,
          body: body.trim() || undefined,
        });
      }

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
        className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
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
            className="w-full px-3 py-2 text-sm border border-warm-border/40 rounded-lg mb-3 resize-none bg-cream-light text-warm-brown placeholder-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-forest/30"
            rows={3}
          />

          {/* Image upload */}
          <div className="mb-4">
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-times text-xs" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-warm-border/50 rounded-lg text-sm text-warm-gray hover:text-forest hover:border-forest/40 transition-colors"
              >
                <i className="fas fa-image text-xs" />
                Add a photo
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

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
