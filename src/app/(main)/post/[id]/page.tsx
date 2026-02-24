import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import PostComments from "@/components/PostComments";
import { redirect } from "next/navigation";
import Link from "next/link";
import { countryNameToEmoji } from "@/lib/utils";

const RATING_COLORS: Record<number, string> = {
  1: "#E74C3C",
  2: "#E67E22",
  3: "#F1C40F",
  4: "#27AE60",
  5: "#2ECC71",
};

const RATING_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Not good",
  3: "Average",
  4: "Very good",
  5: "Amazing",
};

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dw3o86f8j/image/upload/v1634179812/t%27day/avatars/defaultAvatar2_qyqc9t.png";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  // Fetch the post with author info
  const post = await Post.findById(id)
    .populate("author", "username avatar country bio")
    .lean();

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <i className="fas fa-search text-4xl text-warm-border mb-4 block" />
        <h1 className="text-xl font-bold text-warm-brown mb-2">
          Post not found
        </h1>
        <p className="text-warm-gray mb-6">
          This post may have been deleted or doesn&apos;t exist.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-cream-light text-sm rounded-lg hover:bg-forest-hover transition-colors"
        >
          <i className="fas fa-arrow-left text-xs" /> Back to home
        </Link>
      </div>
    );
  }

  // Fetch comments with author info
  const rawComments = await Comment.find({ post: id })
    .sort({ createdAt: 1 })
    .populate("author", "username avatar country")
    .lean();

  const currentUser = await User.findById(session.user.id)
    .select("username avatar bookmarks")
    .lean();

  if (!currentUser) redirect("/login");

  const userId = currentUser._id.toString();
  const author = post.author as any;

  // Is this post bookmarked by the current user?
  const isBookmarked = (currentUser.bookmarks || []).some(
    (b: any) => b.toString() === id
  );

  // Serialize
  const ratingColor = RATING_COLORS[post.rating] || RATING_COLORS[3];
  const ratingLabel = RATING_LABELS[post.rating] || "";
  const flag = countryNameToEmoji(post.authorCountry || author?.country?.name || "");
  const isOwn = author?._id?.toString() === userId;

  const avatarUrl = author?.avatar?.path
    ? author.avatar.path.includes("/upload")
      ? author.avatar.path.replace("/upload", "/upload/w_80,h_80,c_fill")
      : author.avatar.path
    : DEFAULT_AVATAR;

  const serializedComments = rawComments.map((c: any) => {
    const cAuthor = c.author as any;
    const cAvatar = cAuthor?.avatar?.path
      ? cAuthor.avatar.path.includes("/upload")
        ? cAuthor.avatar.path.replace("/upload", "/upload/w_40,h_40,c_fill")
        : cAuthor.avatar.path
      : DEFAULT_AVATAR;

    return {
      _id: String(c._id),
      body: String(c.body || ""),
      authorId: String(cAuthor?._id || ""),
      authorUsername: String(cAuthor?.username || "anonymous"),
      authorAvatar: cAvatar,
      authorCountry: String(cAuthor?.country?.name || ""),
      createdAt: c.createdAt
        ? new Date(c.createdAt).toISOString()
        : new Date().toISOString(),
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back link */}
      <Link
        href="/home"
        className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-forest transition-colors mb-4"
      >
        <i className="fas fa-arrow-left text-xs" /> Back to home
      </Link>

      {/* Post card */}
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
        {/* Author header */}
        <div className="p-5 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-cream-dark">
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-warm-brown">
                  {isOwn ? author?.username : "Anonymous"}
                </span>
                {flag && (
                  <span className="text-lg" title={post.authorCountry || ""}>
                    {flag}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-warm-gray">
                  {(() => {
                    // Try createdAt, fall back to ObjectId timestamp
                    let d: Date | null = null;
                    if (post.createdAt) {
                      const parsed = new Date(post.createdAt);
                      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) d = parsed;
                    }
                    if (!d && id && id.length >= 8) {
                      const ts = parseInt(id.substring(0, 8), 16) * 1000;
                      const parsed = new Date(ts);
                      if (!isNaN(parsed.getTime())) d = parsed;
                    }
                    if (d) {
                      const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                      const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).toLowerCase();
                      return `${date}, ${time}`;
                    }
                    return post.date;
                  })()}
                </span>
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
                {post.edited && (
                  <>
                    <span className="text-warm-border">·</span>
                    <span className="text-[11px] text-warm-gray italic">
                      edited
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rating display */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className="text-lg"
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
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: ratingColor }}
            >
              {ratingLabel}
            </span>
          </div>

          {/* Body text */}
          {post.body && (
            <p className="text-[15px] leading-relaxed text-warm-brown-light whitespace-pre-line">
              {post.body}
            </p>
          )}
        </div>

        {/* Post image */}
        {post.image?.path && (
          <div className="overflow-hidden">
            <img
              src={post.image.path.replace("/upload", "/upload/w_700,c_fill")}
              alt="Post image"
              className="w-full object-cover"
              style={{ maxHeight: "400px" }}
            />
          </div>
        )}

        {/* Stats bar */}
        <div className="px-5 py-3 border-t border-warm-border/20 flex items-center gap-4 text-xs text-warm-gray">
          <span className="flex items-center gap-1.5">
            <i className="far fa-comment" />
            {serializedComments.length}{" "}
            {serializedComments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Comments section */}
        <PostComments
          postId={id}
          comments={serializedComments}
          currentUserId={userId}
          currentUserAvatar={
            currentUser.avatar?.path
              ? currentUser.avatar.path.includes("/upload")
                ? currentUser.avatar.path.replace(
                    "/upload",
                    "/upload/w_40,h_40,c_fill"
                  )
                : currentUser.avatar.path
              : DEFAULT_AVATAR
          }
          currentUsername={String(currentUser.username || "")}
          isBookmarked={isBookmarked}
        />
      </div>
    </div>
  );
}
