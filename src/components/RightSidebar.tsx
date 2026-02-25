"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/posts";
import { countryNameToEmoji } from "@/lib/utils";

interface RightSidebarProps {
  user: {
    _id: string;
    username: string;
    avatar: string;
    country: string;
    coverColor: string;
    coverPhoto: string;
    coverPhotoPosition?: string;
    postedToday: boolean;
    todaysPost: string;
    totalPosts: number;
    totalComments: number;
    postStreak: number;
    average: number;
  };
  todaysPostData: {
    _id: string;
    rating: number;
    body?: string;
  } | null;
}

const CHARTS_BASE =
  "https://charts.mongodb.com/charts-todai-fevei/embed/charts";

const FACE_ICONS = [
  { value: 1, icon: "fa-face-sad-cry", color: "#E74C3C" },
  { value: 2, icon: "fa-face-frown", color: "#E67E22" },
  { value: 3, icon: "fa-face-meh", color: "#F1C40F" },
  { value: 4, icon: "fa-face-smile", color: "#27AE60" },
  { value: 5, icon: "fa-face-grin-stars", color: "#2ECC71" },
];

const RATING_COLORS: Record<number, string> = {
  1: "#E74C3C",
  2: "#E67E22",
  3: "#F1C40F",
  4: "#27AE60",
  5: "#2ECC71",
};

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dw3o86f8j/image/upload/v1634179812/t%27day/avatars/defaultAvatar2_qyqc9t.png";

export default function RightSidebar({
  user,
  todaysPostData,
}: RightSidebarProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [newPostId, setNewPostId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const flag = countryNameToEmoji(user.country);

  const avatarUrl = user.avatar
    ? user.avatar.includes("/upload")
      ? user.avatar.replace("/upload", "/upload/w_200,h_200,c_fill")
      : user.avatar
    : DEFAULT_AVATAR;

  const coverBg = user.coverPhoto
    ? { backgroundImage: "url(" + user.coverPhoto + ")", backgroundSize: "cover" as const, backgroundPosition: user.coverPhotoPosition || "center" }
    : { backgroundColor: user.coverColor || "#2D5F3F" };

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
      if (result.success && result.postId) {
        setNewPostId(result.postId);
        setPosted(true);
        setRating(0);
        setBody("");
        setTimeout(() => {
          setPosted(false);
          setNewPostId(null);
        }, 5000);
        router.refresh();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Something went wrong.");
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ===== Profile Card — whole thing links to /profile ===== */}
      <Link href="/profile" className="block bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover */}
        <div className="h-20" style={coverBg} />

        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="flex justify-center -mt-8 mb-2">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-16 h-16 rounded-full border-[3px] border-white object-cover shadow-card"
            />
          </div>

          {/* Name */}
          <div className="text-center mb-3">
            <h3 className="font-semibold text-warm-brown text-sm flex items-center justify-center gap-1.5">
              {user.username}
            </h3>
            <div className="text-xs text-warm-gray flex items-center justify-center gap-1">
              @{user.username}
              {flag && <span className="text-lg">{flag}</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
            <div className="bg-cream-light rounded-lg py-2 px-1">
              <div className="font-bold text-warm-brown">
                {user.totalPosts}
              </div>
              <div className="text-warm-gray text-[10px]">Ratings</div>
            </div>
            <div className="bg-cream-light rounded-lg py-2 px-1">
              <div className="font-bold text-warm-brown">
                {user.totalComments}
              </div>
              <div className="text-warm-gray text-[10px]">Comments</div>
            </div>
            <div className="bg-cream-light rounded-lg py-2 px-1">
              <div className="font-bold text-warm-brown">
                {user.postStreak}
              </div>
              <div className="text-warm-gray text-[10px]">Streak</div>
            </div>
            <div className="bg-cream-light rounded-lg py-2 px-1">
              <div className="font-bold text-warm-brown">
                {user.average ? user.average.toFixed(1) : "-"}
              </div>
              <div className="text-warm-gray text-[10px]">Avg</div>
            </div>
          </div>
        </div>
      </Link>

      {/* ===== Rating Section ===== */}
      {user.postedToday && todaysPostData ? (
        /* Today's rating display */
        <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-4">
          <h4 className="text-sm font-semibold text-warm-brown mb-2">
            Today&apos;s Rating
          </h4>
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className="text-lg"
                style={{
                  color:
                    s <= todaysPostData.rating
                      ? RATING_COLORS[todaysPostData.rating]
                      : "var(--color-warm-border)",
                }}
              >
                ★
              </span>
            ))}
          </div>
          {todaysPostData.body && (
            <p className="text-sm text-warm-brown-light mb-2">
              {todaysPostData.body}
            </p>
          )}
          <Link
            href={"/post/" + todaysPostData._id}
            className="text-xs text-forest hover:text-forest-hover"
          >
            View post →
          </Link>
        </div>
      ) : (
        /* Rating form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-4">
          <label className="block text-sm font-semibold text-warm-brown mb-3">
            How&apos;s your day?
          </label>

          {/* Face icons */}
          <div className="flex justify-between gap-1 mb-3">
            {FACE_ICONS.map((face) => (
              <button
                key={face.value}
                type="button"
                onClick={() => setRating(face.value)}
                className={
                  "flex-1 py-2 rounded-lg transition-all " +
                  (rating === face.value
                    ? "bg-cream-light ring-2 ring-forest scale-110"
                    : "hover:bg-cream-light hover:scale-105")
                }
                title={"Rating " + face.value}
              >
                <i
                  className={"fa-solid " + face.icon}
                  style={{
                    color: rating === face.value ? face.color : "#8B7E6F",
                    fontSize: "1.4rem",
                  }}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="text-center mb-2 text-sm font-medium text-forest">
              {rating}/5
            </div>
          )}

          {/* Body input */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a note about your day (optional)..."
            className="w-full px-3 py-2 text-sm border border-warm-border/40 rounded-lg mb-3 resize-none bg-cream-light text-warm-brown placeholder-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-forest/30"
            rows={3}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isPosting || rating === 0}
            className="w-full bg-forest hover:bg-forest-hover disabled:bg-cream-dark disabled:text-warm-gray text-cream-light font-medium py-2 rounded-lg transition-colors text-sm"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Success */}
          {posted && (
            <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-sm flex items-center justify-between">
              <span>Posted!</span>
              {newPostId && (
                <Link
                  href={"/post/" + newPostId}
                  className="font-medium text-xs hover:underline"
                >
                  View
                </Link>
              )}
            </div>
          )}
        </form>
      )}

      {/* ===== My Week Chart ===== */}
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
        <div className="p-1" style={{ pointerEvents: "none" }}>
          <iframe
            src={`${CHARTS_BASE}?id=3e56620a-ac24-464e-9793-3f5065281e6f&maxDataAge=3600&autoRefresh=true&theme=light&filter=${encodeURIComponent(`{'authorID':'${user._id}'}`)}`}
            width="100%"
            height={180}
            scrolling="no"
            style={{
              border: "none",
              borderRadius: "12px",
              display: "block",
              background: "transparent",
            }}
            title="My Week"
          />
        </div>
        <div className="px-3 pb-3">
          <Link
            href="/charts/me"
            className="text-xs text-forest hover:text-forest-hover"
          >
            View my charts →
          </Link>
        </div>
      </div>

      {/* ===== GCP Dot ===== */}
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-4">
        <h4 className="text-sm font-semibold text-warm-brown mb-1 flex items-center gap-2">
          <i className="fas fa-globe text-forest text-xs" />
          GCP Dot
        </h4>
        <p className="text-[11px] text-warm-gray mb-3 leading-relaxed">
          The Global Consciousness Project collects data from a global network
          of random number generators. The color of the dot reflects the
          current state of global coherence.
        </p>
        <div className="flex justify-center mb-3">
          <a
            href="https://global-mind.org/gcpdot/"
            target="_blank"
            rel="noopener noreferrer"
            title="View the Global Consciousness Project"
          >
            <div className="rounded-xl p-3 hover:shadow-card transition-shadow">
              <iframe
                src="https://global-mind.org/gcpdot/gcp.html"
                height="48"
                width="48"
                scrolling="no"
                style={{ border: "none", borderRadius: "8px", display: "block", pointerEvents: "none" }}
                title="GCP Dot"
              />
            </div>
          </a>
        </div>
        <a
          href="https://global-mind.org/gcpdot/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-forest hover:text-forest-hover"
        >
          Learn more →
        </a>
      </div>

      {/* ===== Footer ===== */}
      <div className="pt-2 pb-4">
        <nav className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-xs text-warm-gray">
          <Link href="/about" className="hover:text-forest">
            About
          </Link>
          <Link href="/terms" className="hover:text-forest">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-forest">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-forest">
            Contact
          </Link>
        </nav>
        <p className="text-center text-[10px] text-warm-gray/60 mt-2">
          © 2026 t&apos;day
        </p>
      </div>
    </div>
  );
}
