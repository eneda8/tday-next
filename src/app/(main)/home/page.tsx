import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import PostCard from "@/components/PostCard";
import HomeFilters from "@/components/HomeFilters";
import RightSidebar from "@/components/RightSidebar";
import LeftSidebar from "@/components/LeftSidebar";
import { redirect } from "next/navigation";
import {
  checkAndResetPostedToday,
  checkAndResetStreak,
  getToday,
} from "@/lib/postHelpers";

/**
 * Serialize a MongoDB post document for client components.
 */
function serializePost(post: any) {
  // Extract image as plain object (avoid passing Mongoose subdocs)
  let image: { path: string } | undefined;
  if (post.image?.path) {
    image = { path: String(post.image.path) };
  }

  // Comments are ObjectId refs from aggregate — just count them
  const commentCount = Array.isArray(post.comments)
    ? post.comments.length
    : 0;

  return {
    _id: String(post._id || ""),
    date: String(post.date || ""),
    rating: Number(post.rating) || 3,
    body: post.body ? String(post.body) : undefined,
    image,
    authorUsername: String(
      post.authorUsername || post.authorInfo?.username || "anonymous"
    ),
    authorCountry: String(post.authorCountry || ""),
    authorGender: String(post.authorGender || ""),
    authorAgeGroup: String(post.authorAgeGroup || ""),
    authorID: String(post.authorID || post.author || ""),
    authorAvatar: String(post.authorInfo?.avatar?.path || ""),
    comments: commentCount,
    edited: Boolean(post.edited),
    createdAt: post.createdAt
      ? typeof post.createdAt === "string"
        ? post.createdAt
        : new Date(post.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // ===== Auth =====
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const userId = user._id.toString();

  // ===== Middleware checks =====
  await checkAndResetPostedToday(userId);
  await checkAndResetStreak(userId);

  // Refetch user after middleware updates
  const freshUser = await User.findById(session.user.id).lean();
  if (!freshUser) redirect("/login");

  const today = getToday(); // "Feb 23, 2026"

  // ===== Parse filter params =====
  const params = await searchParams;
  const country = params.country ? String(params.country) : null;
  const ratingFilter = params.rating
    ? Array.isArray(params.rating)
      ? params.rating.map(Number)
      : [Number(params.rating)]
    : [];
  const ageGroup = params.ageGroup ? String(params.ageGroup) : null;
  const gender = params.gender ? String(params.gender) : null;
  const hasImage = params.image === "true";

  // ===== Build query =====
  const match: any = { date: today };
  if (country) match.authorCountry = country;
  if (ratingFilter.length > 0) match.rating = { $in: ratingFilter };
  if (ageGroup) match.authorAgeGroup = ageGroup;
  if (gender) match.authorGender = gender;
  if (hasImage) match["image.path"] = { $exists: true, $ne: "" };

  // ===== Fetch 10 random posts =====
  let posts: any[] = [];
  try {
    const rawPosts = await Post.aggregate([
      { $match: match },
      { $sample: { size: 10 } },
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

    posts = rawPosts;
  } catch (err) {
    console.error("Error fetching posts:", err);
  }

  // ===== Get countries for filter =====
  let countries: { name: string }[] = [];
  try {
    const distinct = await Post.distinct("authorCountry", { date: today });
    countries = distinct
      .filter(Boolean)
      .sort()
      .map((name: string) => ({ name }));
  } catch (err) {
    console.error("Error fetching countries:", err);
  }

  // ===== Today's post for sidebar =====
  const todaysPost = await Post.findOne({
    author: freshUser._id,
    date: today,
  }).lean();

  // ===== User bookmarks as a set of string IDs for quick lookup =====
  const userBookmarkIds = new Set(
    (freshUser.bookmarks || []).map((b: any) => b.toString())
  );

  // ===== Current user avatar for inline comments =====
  const currentUserAvatar = freshUser.avatar?.path
    ? freshUser.avatar.path.includes("/upload")
      ? freshUser.avatar.path.replace("/upload", "/upload/w_40,h_40,c_fill")
      : String(freshUser.avatar.path)
    : "";

  // ===== Serialize =====
  const serializedPosts = posts.map(serializePost);

  const todaysPostData = todaysPost
    ? {
        _id: String((todaysPost as any)._id || ""),
        rating: Number((todaysPost as any).rating) || 3,
        body: (todaysPost as any).body ? String((todaysPost as any).body) : undefined,
      }
    : null;

  const sidebarUser = {
    _id: String(userId),
    username: String(freshUser.username || ""),
    avatar: String(freshUser.avatar?.path || ""),
    country: String(freshUser.country?.name || ""),
    coverColor: String(freshUser.coverColor || "#343a40"),
    coverPhoto: String(freshUser.coverPhoto?.path || ""),
    coverPhotoPosition: freshUser.coverPhoto?.position ? `${freshUser.coverPhoto.position}` : undefined,
    postedToday: Boolean(freshUser.postedToday),
    todaysPost: String(freshUser.todaysPost || ""),
    totalPosts: Number(freshUser.posts?.length || 0),
    totalComments: Number(freshUser.comments?.length || 0),
    postStreak: Number(freshUser.postStreak || 0),
    average: Number(freshUser.average || 0),
  };

  // ===== Render — 3-column layout =====
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex gap-6">
        {/* ===== Left Sidebar — Charts (desktop) ===== */}
        <div className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <LeftSidebar today={today} />
          </div>
        </div>

        {/* ===== Main Feed ===== */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-warm-brown">
              Today&apos;s Ratings
            </h1>
            {serializedPosts.length > 0 && (
              <a
                href="/home"
                className="btn-lift inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-cream-light text-sm font-medium shadow-card hover:bg-forest-hover"
              >
                <i className="fas fa-random" />
                Refresh
              </a>
            )}
          </div>

          {/* Filters */}
          <div className="mb-4">
            <HomeFilters countries={countries} />
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {serializedPosts.length > 0 ? (
              serializedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={userId}
                  currentUserAvatar={currentUserAvatar}
                  isBookmarked={userBookmarkIds.has(post._id)}
                  todayOnly
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8 text-center">
                <i className="fas fa-globe-americas text-3xl text-warm-border mb-3 block" />
                <p className="text-warm-gray">
                  No ratings found for today. Be the first!
                </p>
              </div>
            )}
          </div>

          {/* Bottom refresh */}
          {serializedPosts.length > 0 && (
            <div className="mt-6 text-center">
              <a
                href="/home"
                className="btn-lift inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-cream-light text-sm font-medium shadow-card hover:bg-forest-hover"
              >
                <i className="fas fa-random" />
                Refresh for 10 more
              </a>
            </div>
          )}
        </div>

        {/* ===== Right Sidebar (desktop) ===== */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20">
            <RightSidebar
              user={sidebarUser}
              todaysPostData={todaysPostData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
