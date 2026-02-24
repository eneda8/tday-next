import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import SearchFilters from "@/components/SearchFilters";
import SearchResults from "@/components/SearchResults";
import { redirect } from "next/navigation";
import { getToday } from "@/lib/postHelpers";

const RESULTS_PER_PAGE = 30;

/**
 * Serialize a MongoDB post document for client components.
 * (Same pattern as home page — all plain primitives)
 */
function serializePost(post: any) {
  let image: { path: string } | undefined;
  if (post.image?.path) {
    image = { path: String(post.image.path) };
  }

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

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // ===== Auth =====
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const userId = user._id.toString();

  // ===== Parse search params =====
  const params = await searchParams;
  const searchText = params.text ? String(params.text).trim() : "";
  const dateParam = params.date ? String(params.date) : "";
  const country = params.country ? String(params.country) : "";
  const ratingFilter = params.rating
    ? Array.isArray(params.rating)
      ? params.rating.map(Number)
      : [Number(params.rating)]
    : [];
  const ageGroup = params.ageGroup ? String(params.ageGroup) : "";
  const gender = params.gender ? String(params.gender) : "";
  const hasImage = params.image === "true";
  const page = params.page ? Math.max(1, Number(params.page)) : 1;

  // ===== Build query =====
  let posts: any[] = [];
  let totalFound = 0;

  if (searchText) {
    const conditions: any[] = [];

    // Text search — case-insensitive regex on body field
    // Escape special regex characters in user input
    const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.push({ body: { $regex: escapedText, $options: "i" } });

    // Date filter — convert YYYY-MM-DD to our "MMM D, YYYY" format
    if (dateParam) {
      const dateObj = new Date(dateParam + "T12:00:00");
      const formatted = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      conditions.push({ date: formatted });
    }

    // Other filters
    if (country) conditions.push({ authorCountry: country });
    if (ratingFilter.length > 0) conditions.push({ rating: { $in: ratingFilter } });
    if (ageGroup) conditions.push({ authorAgeGroup: ageGroup });
    if (gender) conditions.push({ authorGender: gender });
    if (hasImage) conditions.push({ "image.path": { $exists: true, $ne: "" } });

    const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

    try {
      // Get total count
      totalFound = await Post.countDocuments(query);

      // Fetch paginated results with user lookup
      const rawPosts = await Post.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * RESULTS_PER_PAGE },
        { $limit: RESULTS_PER_PAGE },
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
      console.error("Search error:", err);
    }
  }

  // ===== Get all countries for filter dropdown =====
  let countries: { name: string }[] = [];
  try {
    const distinct = await Post.distinct("authorCountry");
    countries = distinct
      .filter(Boolean)
      .sort()
      .map((name: string) => ({ name }));
  } catch (err) {
    console.error("Error fetching countries:", err);
  }

  // ===== Serialize =====
  const serializedPosts = posts.map(serializePost);
  const totalPages = Math.ceil(totalFound / RESULTS_PER_PAGE);

  // ===== Render =====
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex gap-6">
        {/* ===== Left: Search filters ===== */}
        <div className="w-72 flex-shrink-0 hidden md:block">
          <div className="sticky top-20">
            <h1 className="text-xl font-bold text-warm-brown mb-4">
              <i className="fas fa-search text-forest mr-2" />
              Search
            </h1>
            <SearchFilters countries={countries} />
          </div>
        </div>

        {/* ===== Center: Results ===== */}
        <div className="flex-1 min-w-0">
          {/* Mobile search (shown above results on small screens) */}
          <div className="md:hidden mb-4">
            <h1 className="text-xl font-bold text-warm-brown mb-4">
              <i className="fas fa-search text-forest mr-2" />
              Search
            </h1>
            <SearchFilters countries={countries} />
          </div>

          <SearchResults
            posts={serializedPosts}
            currentUserId={userId}
            searchText={searchText}
            totalFound={totalFound}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
