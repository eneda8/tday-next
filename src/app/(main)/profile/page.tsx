import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import ProfileCharts from "@/components/ProfileCharts";
import { redirect } from "next/navigation";
import {
  checkAndResetPostedToday,
  checkAndResetStreak,
} from "@/lib/postHelpers";

/**
 * Serialize a post for client components.
 */
function serializePost(post: any, authorInfo?: any) {
  let image: { path: string } | undefined;
  if (post.image?.path) {
    image = { path: String(post.image.path) };
  }

  const commentCount = Array.isArray(post.comments)
    ? post.comments.length
    : 0;

  const avatarStr = authorInfo?.avatar
    ? typeof authorInfo.avatar === "string"
      ? authorInfo.avatar
      : authorInfo.avatar?.path || ""
    : post.authorInfo?.avatar?.path
      ? String(post.authorInfo.avatar.path)
      : "";

  return {
    _id: String(post._id || ""),
    date: String(post.date || ""),
    rating: Number(post.rating) || 3,
    body: post.body ? String(post.body) : undefined,
    image,
    authorUsername: String(
      post.authorUsername || authorInfo?.username || post.authorInfo?.username || "anonymous"
    ),
    authorCountry: String(post.authorCountry || authorInfo?.country || ""),
    authorGender: String(post.authorGender || ""),
    authorAgeGroup: String(post.authorAgeGroup || ""),
    authorID: String(post.authorID || post.author || ""),
    authorAvatar: String(post.authorAvatar || avatarStr),
    comments: commentCount,
    edited: Boolean(post.edited),
    createdAt: post.createdAt
      ? typeof post.createdAt === "string"
        ? post.createdAt
        : new Date(post.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  await checkAndResetPostedToday(session.user.id);
  await checkAndResetStreak(session.user.id);

  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const userId = user._id.toString();

  // ===== Fetch user's posts =====
  let posts: any[] = [];
  try {
    if (user.posts && user.posts.length > 0) {
      posts = await Post.find({ _id: { $in: user.posts } })
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (err) {
    console.error("Error fetching posts:", err);
  }

  // ===== Fetch ALL comments by this user (including orphaned) =====
  let comments: any[] = [];
  try {
    const rawComments = await Comment.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("post", "date rating")
      .lean();

    // Keep ALL comments — orphaned ones just won't have post info
    comments = rawComments;
  } catch (err) {
    console.error("Error fetching comments:", err);
  }

  // ===== Fetch bookmarked posts =====
  let bookmarks: any[] = [];
  try {
    if (user.bookmarks && user.bookmarks.length > 0) {
      // Reverse so most-recently-bookmarked is first
      const bookmarkIds = [...user.bookmarks].reverse();
      const rawBookmarks = await Post.aggregate([
        { $match: { _id: { $in: bookmarkIds } } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true },
        },
      ]).exec();

      // Aggregate doesn't preserve order — reorder to match bookmarkIds
      const byId = new Map(rawBookmarks.map((p: any) => [p._id.toString(), p]));
      bookmarks = bookmarkIds
        .map((id: any) => byId.get(id.toString()))
        .filter(Boolean);
    }
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
  }

  // ===== Serialize =====
  const userInfo = {
    avatar: String(user.avatar?.path || ""),
    username: user.username,
    country: String(user.country?.name || ""),
  };

  const serializedPosts = posts.map((p) => serializePost(p, userInfo));

  const serializedComments = comments.map((c: any) => ({
    _id: String(c._id),
    body: String(c.body || ""),
    postId: c.post ? String(c.post._id) : "",
    postDate: c.post ? String(c.post.date || "") : "",
    postRating: c.post ? Number(c.post.rating || 3) : 0,
    postDeleted: !c.post, // flag for orphaned comments
    authorUsername: String(user.username || ""),
    authorAvatar: String(user.avatar?.path || ""),
    createdAt: c.createdAt
      ? new Date(c.createdAt).toISOString()
      : new Date().toISOString(),
  }));

  const serializedBookmarks = bookmarks.map((p) => serializePost(p));

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const profileUser = {
    username: String(user.username || ""),
    avatar: String(user.avatar?.path || ""),
    country: String(user.country?.name || ""),
    coverColor: String(user.coverColor || "#343a40"),
    coverPhoto: String(user.coverPhoto?.path || ""),
    coverPhotoPosition: user.coverPhoto?.position ? `${user.coverPhoto.position}` : undefined,
    bio: String(user.bio || ""),
    totalPosts: Number(user.posts?.length || 0),
    totalComments: Number(comments.length || 0),
    totalBookmarks: Number(user.bookmarks?.length || 0),
    postStreak: Number(user.postStreak || 0),
    average: Number(user.average || 0),
    memberSince,
    isOwnProfile: true,
  };

  // ===== Render: header full-width, then 2-column (tabs left, charts right) =====
  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Header — full width */}
      <ProfileHeader user={profileUser} />

      {/* Content: tabs + right sidebar charts */}
      <div className="flex gap-6">
        {/* Main column: tabs */}
        <div className="min-w-0 w-full lg:w-[55%] lg:shrink-0">
          <ProfileTabs
            currentUserId={userId}
            posts={serializedPosts}
            comments={serializedComments}
            bookmarks={serializedBookmarks}
            defaultTab={tab as "ratings" | "comments" | "bookmarks" | undefined}
          />
        </div>

        {/* Right sidebar: charts — takes remaining space */}
        <div className="hidden lg:block flex-1 min-w-0">
          <ProfileCharts userId={userId} />
        </div>
      </div>
    </div>
  );
}
