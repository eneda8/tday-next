import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import { redirect } from "next/navigation";
import { getToday } from "@/lib/postHelpers";
import {
  TODAY_SUMMARY,
  TODAY_BREAKDOWNS,
  TODAY_SAMPLE_SIZE,
} from "@/lib/chartIds";
import ChartEmbed from "@/components/charts/ChartEmbed";
import ChartNav from "@/components/charts/ChartNav";
import ChartFilters from "@/components/charts/ChartFilters";
import CollapsibleSection from "@/components/charts/CollapsibleSection";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function TodaysChartsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const params = await searchParams;
  const today = getToday();

  // Build the base filter — always scoped to today
  const dbQuery: Record<string, string> = { date: today };
  if (params.country) dbQuery.authorCountry = params.country;
  if (params.ageGroup) dbQuery.authorAgeGroup = params.ageGroup;
  if (params.gender) dbQuery.authorGender = params.gender;

  // User-specific filters for the "your country" / "your gender" / "your age group" charts
  const escapedCountry = user.country?.name || "";
  const userGender = user.gender || "";
  const userAgeGroup = user.ageGroup || "";

  // Per-user summary chart filters
  const countryFilter: Record<string, string> = {
    date: today,
    authorCountry: escapedCountry,
    ...(params.gender && { authorGender: params.gender }),
    ...(params.ageGroup && { authorAgeGroup: params.ageGroup }),
  };
  const genderFilter: Record<string, string> = {
    date: today,
    authorGender: userGender,
    ...(params.country && { authorCountry: params.country }),
    ...(params.ageGroup && { authorAgeGroup: params.ageGroup }),
  };
  const ageGroupFilter: Record<string, string> = {
    date: today,
    authorAgeGroup: userAgeGroup,
    ...(params.country && { authorCountry: params.country }),
    ...(params.gender && { authorGender: params.gender }),
  };

  // Summary chart filters: [global, country, gender, ageGroup]
  const summaryFilters = [dbQuery, countryFilter, genderFilter, ageGroupFilter];

  // Count today's posts
  const count = await Post.countDocuments({ date: today });

  const filtersApplied = params.country || params.ageGroup || params.gender;

  /**
   * Build a readable description from a set of demographic parts.
   * e.g. ("female", "Millennials", "Albania") → "Females, Millennials in Albania"
   */
  function describe(
    gender?: string,
    ageGroup?: string,
    country?: string
  ): string {
    const parts: string[] = [];
    if (gender) parts.push(gender === "male" ? "Males" : "Females");
    if (ageGroup) parts.push(ageGroup);
    const who = parts.length ? parts.join(", ") : "All ratings";
    return country ? `${who} in ${country}` : who;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-xl font-bold text-warm-brown">
          Today&apos;s Charts
        </h1>
      </div>

      {/* Nav */}
      <div className="mb-4">
        <ChartNav current="today" />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ChartFilters basePath="/charts" />
      </div>

      {/* Summary */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-3">
        Summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {TODAY_SUMMARY.map((chart, i) => (
          <div key={chart.id}>
            <ChartEmbed
              chartId={chart.id}
              height={chart.height}
              maxDataAge={chart.maxDataAge}
              filter={summaryFilters[i]}
            />
            {i === 0 && (
              <p className="text-xs text-warm-gray mt-1">
                {filtersApplied
                  ? describe(params.gender, params.ageGroup, params.country)
                  : "All ratings today"}
              </p>
            )}
            {i === 1 && (
              <p className="text-xs text-warm-gray mt-1">
                {describe(params.gender, params.ageGroup, escapedCountry)}
              </p>
            )}
            {i === 2 && (
              <p className="text-xs text-warm-gray mt-1">
                {describe(userGender, params.ageGroup, params.country)}
              </p>
            )}
            {i === 3 && (
              <p className="text-xs text-warm-gray mt-1">
                {describe(params.gender, userAgeGroup, params.country)}
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
          chartId={TODAY_BREAKDOWNS[0].id}
          height={TODAY_BREAKDOWNS[0].height}
          maxDataAge={TODAY_BREAKDOWNS[0].maxDataAge}
          filter={dbQuery}
        />
        {filtersApplied && (
          <p className="text-xs text-warm-gray italic mt-1">
            {describe(params.gender, params.ageGroup, params.country)}
          </p>
        )}
      </div>
      {/* Region, Gender, Age — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {TODAY_BREAKDOWNS.slice(1).map((chart) => (
          <div key={chart.id}>
            <ChartEmbed
              chartId={chart.id}
              height={chart.height}
              maxDataAge={chart.maxDataAge}
              filter={dbQuery}
            />
            {filtersApplied && (
              <p className="text-xs text-warm-gray italic mt-1">
                {describe(params.gender, params.ageGroup, params.country)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Sample Size — collapsible */}
      <CollapsibleSection label={`Show/Hide Sample Size Charts (${count} ratings today)`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {TODAY_SAMPLE_SIZE.map((chart) => (
            <div key={chart.id}>
              <ChartEmbed
                chartId={chart.id}
                height={chart.height}
                maxDataAge={chart.maxDataAge}
                filter={dbQuery}
              />
              {filtersApplied && (
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
