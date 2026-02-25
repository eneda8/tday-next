import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { getToday } from "@/lib/postHelpers";
import {
  ALL_SUMMARY,
  ALL_OVER_TIME,
  ALL_BREAKDOWNS,
  ALL_USER_COUNT,
} from "@/lib/chartIds";
import ChartEmbed from "@/components/charts/ChartEmbed";
import ChartNav from "@/components/charts/ChartNav";
import ChartFilters from "@/components/charts/ChartFilters";
import CollapsibleSection from "@/components/charts/CollapsibleSection";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AllChartsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const params = await searchParams;
  const today = getToday();

  // Full filter (date + demographics) — for breakdowns
  const dbQuery: Record<string, string> = {};
  if (params.date) {
    // Convert YYYY-MM-DD input to "Feb 23, 2026" format
    const d = new Date(params.date + "T00:00:00Z");
    dbQuery.date = d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (params.country) dbQuery.authorCountry = params.country;
  if (params.ageGroup) dbQuery.authorAgeGroup = params.ageGroup;
  if (params.gender) dbQuery.authorGender = params.gender;

  // Demographics-only filter (no date) — for summary/over-time charts
  const demoFilter: Record<string, string> = {};
  if (params.country) demoFilter.authorCountry = params.country;
  if (params.ageGroup) demoFilter.authorAgeGroup = params.ageGroup;
  if (params.gender) demoFilter.authorGender = params.gender;

  // User count charts use user-level fields
  const userFilter: Record<string, string> = {};
  if (params.country) userFilter["country.name"] = params.country;
  if (params.ageGroup) userFilter.ageGroup = params.ageGroup;
  if (params.gender) userFilter.gender = params.gender;

  // "Today's Rating" summary chart needs today's date + gender/country/ageGroup
  const todaySummaryFilter: Record<string, string> = { date: today };
  if (params.gender) todaySummaryFilter.authorGender = user.gender || "";
  if (params.country) todaySummaryFilter.authorCountry = params.country;
  if (params.ageGroup) todaySummaryFilter.authorAgeGroup = params.ageGroup;

  // Total user count
  const userCount = await User.countDocuments();

  const filtersApplied =
    params.country || params.ageGroup || params.gender || params.date;
  const demoApplied = params.country || params.ageGroup || params.gender;

  function describe(
    gender?: string,
    ageGroup?: string,
    country?: string,
    date?: string
  ): string {
    const parts: string[] = [];
    if (gender) parts.push(gender === "male" ? "Males" : "Females");
    if (ageGroup) parts.push(ageGroup);
    const who = parts.length ? parts.join(", ") : "All ratings";
    const where = country ? ` in ${country}` : "";
    const when = date ? ` on ${date}` : "";
    return `${who}${where}${when}`;
  }

  // Summary charts: first one uses todaySummaryFilter, rest use demoFilter
  const summaryFilters = [
    todaySummaryFilter,
    ...Array(ALL_SUMMARY.length - 1).fill(
      Object.keys(demoFilter).length > 0 ? demoFilter : undefined
    ),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-warm-brown mb-1">All Charts</h1>

      {/* Nav */}
      <div className="mb-4">
        <ChartNav current="all" />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ChartFilters basePath="/charts/all" showDatePicker />
      </div>

      {/* Summary */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
        Summary
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {ALL_SUMMARY.map((chart, i) => (
          <div key={chart.id}>
            <ChartEmbed
              chartId={chart.id}
              height={chart.height}
              maxDataAge={chart.maxDataAge}
              filter={summaryFilters[i]}
            />
            {i === 0 && filtersApplied && (
              <p className="text-xs text-warm-gray italic mt-1">
                {describe(params.gender, params.ageGroup, params.country, dbQuery.date)}
              </p>
            )}
            {i > 0 && demoApplied && (
              <p className="text-xs text-warm-gray italic mt-1">
                {describe(params.gender, params.ageGroup, params.country)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Average Over Time */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
        Average Rating Over Time
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {ALL_OVER_TIME.map((chart) => (
          <div key={chart.id}>
            <ChartEmbed
              chartId={chart.id}
              height={chart.height}
              maxDataAge={chart.maxDataAge}
              filter={
                Object.keys(demoFilter).length > 0 ? demoFilter : undefined
              }
            />
            {demoApplied && (
              <p className="text-xs text-warm-gray italic mt-1">
                {describe(params.gender, params.ageGroup, params.country)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
        Average Rating by Country, Region, Gender &amp; Age Group
      </h2>
      {/* Country map — full width */}
      <div className="mb-4">
        <ChartEmbed
          chartId={ALL_BREAKDOWNS[0].id}
          height={ALL_BREAKDOWNS[0].height}
          maxDataAge={ALL_BREAKDOWNS[0].maxDataAge}
          filter={Object.keys(dbQuery).length > 0 ? dbQuery : undefined}
        />
        {filtersApplied && (
          <p className="text-xs text-warm-gray italic mt-1">
            {describe(params.gender, params.ageGroup, params.country, dbQuery.date)}
          </p>
        )}
      </div>
      {/* Region, Gender, Age — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {ALL_BREAKDOWNS.slice(1).map((chart) => (
          <div key={chart.id}>
            <ChartEmbed
              chartId={chart.id}
              height={chart.height}
              maxDataAge={chart.maxDataAge}
              filter={Object.keys(dbQuery).length > 0 ? dbQuery : undefined}
            />
            {filtersApplied && (
              <p className="text-xs text-warm-gray italic mt-1">
                {describe(params.gender, params.ageGroup, params.country, dbQuery.date)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* User Count — collapsible */}
      <CollapsibleSection
        label={`Show/Hide User Count Charts (${userCount} users total)`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {ALL_USER_COUNT.map((chart) => (
            <div key={chart.id}>
              <ChartEmbed
                chartId={chart.id}
                height={chart.height}
                maxDataAge={chart.maxDataAge}
                filter={
                  Object.keys(userFilter).length > 0 ? userFilter : undefined
                }
              />
              {demoApplied && (
                <p className="text-xs text-warm-gray italic mt-1">
                  {describe(params.gender, params.ageGroup, params.country)}
                </p>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
