"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { getToday } from "@/lib/postHelpers";

// ─── Types ──────────────────────────────────────────────────────────

export interface DataPoint {
  name: string;
  value: number;
  count: number;
}

export interface TrendPoint {
  date: string;
  avg: number;
  count: number;
}

export interface SummaryStats {
  globalAvg: number;
  totalRatings: number;
  totalUsers: number;
  todayAvg: number;
  todayCount: number;
}

// ─── Time range helpers ─────────────────────────────────────────────

function getDateRange(range: string): { start: Date; end: Date } | null {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (range) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "month": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "year": {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "all":
    default:
      return null; // no date filter
  }
}

// ─── Summary stats ──────────────────────────────────────────────────

export async function getSummaryStats(): Promise<SummaryStats> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await dbConnect();

  const today = getToday();

  const [globalAgg, todayAgg, totalUsers] = await Promise.all([
    Post.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Post.aggregate([
      { $match: { date: today } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    User.countDocuments(),
  ]);

  return {
    globalAvg: globalAgg[0]?.avg ?? 0,
    totalRatings: globalAgg[0]?.count ?? 0,
    totalUsers,
    todayAvg: todayAgg[0]?.avg ?? 0,
    todayCount: todayAgg[0]?.count ?? 0,
  };
}

// ─── Average by dimension ───────────────────────────────────────────

export async function getAverageByDimension(
  dimension: "country" | "gender" | "ageGroup",
  timeRange: string = "all"
): Promise<DataPoint[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await dbConnect();

  const fieldMap: Record<string, string> = {
    country: "$authorCountry",
    gender: "$authorGender",
    ageGroup: "$authorAgeGroup",
  };

  const dateRange = getDateRange(timeRange);
  const match: Record<string, unknown> = {};
  if (dateRange) {
    match.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $group: {
        _id: fieldMap[dimension],
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $match: { _id: { $ne: null, $ne: "" } } },
    { $sort: { avg: -1 as const } },
    { $limit: 20 },
  ];

  const results = await Post.aggregate(pipeline);

  return results.map((r) => ({
    name: r._id || "Unknown",
    value: Math.round(r.avg * 100) / 100,
    count: r.count,
  }));
}

// ─── Rating distribution ────────────────────────────────────────────

export async function getRatingDistribution(
  timeRange: string = "all"
): Promise<DataPoint[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await dbConnect();

  const dateRange = getDateRange(timeRange);
  const match: Record<string, unknown> = {};
  if (dateRange) {
    match.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 as const } },
  ];

  const results = await Post.aggregate(pipeline);
  const labels = ["", "Terrible", "Not good", "Average", "Very good", "Amazing"];

  // Ensure all 5 ratings appear
  return [1, 2, 3, 4, 5].map((r) => {
    const found = results.find((x) => x._id === r);
    return {
      name: `${r} — ${labels[r]}`,
      value: r,
      count: found?.count ?? 0,
    };
  });
}

// ─── Trend over time ────────────────────────────────────────────────

export async function getTrend(
  timeRange: string = "month",
  groupBy: "day" | "week" | "month" = "day"
): Promise<TrendPoint[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await dbConnect();

  const dateRange = getDateRange(timeRange === "all" ? "year" : timeRange);
  const match: Record<string, unknown> = {};
  if (dateRange) {
    match.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
  }

  // Date grouping expression
  const dateGroup =
    groupBy === "month"
      ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
      : groupBy === "week"
        ? { $dateToString: { format: "%Y-W%V", date: "$createdAt" } }
        : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    { $match: { createdAt: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: dateGroup,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 as const } },
  ];

  const results = await Post.aggregate(pipeline);

  return results.map((r) => ({
    date: r._id,
    avg: Math.round(r.avg * 100) / 100,
    count: r.count,
  }));
}

// ─── Personal stats ─────────────────────────────────────────────────

export async function getMyTrend(
  timeRange: string = "month"
): Promise<TrendPoint[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await dbConnect();

  const dateRange = getDateRange(timeRange === "all" ? "year" : timeRange);
  const match: Record<string, unknown> = { author: session.user.id };
  if (dateRange) {
    match.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
  }

  const pipeline = [
    { $match: match },
    { $match: { createdAt: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 as const } },
  ];

  const results = await Post.aggregate(pipeline);

  return results.map((r) => ({
    date: r._id,
    avg: Math.round(r.avg * 100) / 100,
    count: r.count,
  }));
}
