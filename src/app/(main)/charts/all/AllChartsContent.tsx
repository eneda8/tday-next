"use client";

import { useState, useMemo } from "react";
import {
  ALL_SUMMARY,
  ALL_OVER_TIME,
  ALL_BREAKDOWNS,
  ALL_USER_COUNT,
} from "@/lib/chartIds";
import ChartEmbed from "@/components/charts/ChartEmbed";
import ChartNav from "@/components/charts/ChartNav";
import ChartFilters, {
  type FilterState,
} from "@/components/charts/ChartFilters";
import CollapsibleSection from "@/components/charts/CollapsibleSection";

interface AllChartsContentProps {
  today: string;
  userGender: string;
  userCount: number;
}

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

export default function AllChartsContent({
  today,
  userGender,
  userCount,
}: AllChartsContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    ageGroup: "",
    gender: "",
    date: "",
  });

  const {
    dbQuery,
    demoFilter,
    userFilter,
    todaySummaryFilter,
    formattedDate,
    filtersApplied,
    demoApplied,
  } = useMemo(() => {
    // Full filter (date + demographics) — for breakdowns
    const full: Record<string, string> = {};
    let fmtDate = "";
    if (filters.date) {
      const d = new Date(filters.date + "T00:00:00Z");
      fmtDate = d.toLocaleDateString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      full.date = fmtDate;
    }
    if (filters.country) full.authorCountry = filters.country;
    if (filters.ageGroup) full.authorAgeGroup = filters.ageGroup;
    if (filters.gender) full.authorGender = filters.gender;

    // Demographics-only filter (no date) — for summary/over-time charts
    const demo: Record<string, string> = {};
    if (filters.country) demo.authorCountry = filters.country;
    if (filters.ageGroup) demo.authorAgeGroup = filters.ageGroup;
    if (filters.gender) demo.authorGender = filters.gender;

    // User count charts use user-level fields
    const uf: Record<string, string> = {};
    if (filters.country) uf["country.name"] = filters.country;
    if (filters.ageGroup) uf.ageGroup = filters.ageGroup;
    if (filters.gender) uf.gender = filters.gender;

    // "Today's Rating" summary chart
    const todayF: Record<string, string> = { date: today };
    if (filters.gender) todayF.authorGender = userGender;
    if (filters.country) todayF.authorCountry = filters.country;
    if (filters.ageGroup) todayF.authorAgeGroup = filters.ageGroup;

    return {
      dbQuery: full,
      demoFilter: demo,
      userFilter: uf,
      todaySummaryFilter: todayF,
      formattedDate: fmtDate,
      filtersApplied:
        filters.country || filters.ageGroup || filters.gender || filters.date,
      demoApplied: filters.country || filters.ageGroup || filters.gender,
    };
  }, [today, userGender, filters]);

  // Summary charts: first one uses todaySummaryFilter, rest use demoFilter
  const summaryFilters = useMemo(() => {
    const hasDemo = Object.keys(demoFilter).length > 0;
    return [
      todaySummaryFilter,
      ...Array(ALL_SUMMARY.length - 1).fill(hasDemo ? demoFilter : undefined),
    ];
  }, [todaySummaryFilter, demoFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-warm-brown mb-1">All Charts</h1>

      {/* Nav */}
      <div className="mb-4">
        <ChartNav current="all" />
      </div>

      {/* Filters — live updates */}
      <div className="mb-6">
        <ChartFilters showDatePicker onChange={setFilters} />
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
                {describe(
                  filters.gender,
                  filters.ageGroup,
                  filters.country,
                  formattedDate
                )}
              </p>
            )}
            {i > 0 && demoApplied && (
              <p className="text-xs text-warm-gray italic mt-1">
                {describe(filters.gender, filters.ageGroup, filters.country)}
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
                {describe(filters.gender, filters.ageGroup, filters.country)}
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
            {describe(
              filters.gender,
              filters.ageGroup,
              filters.country,
              formattedDate
            )}
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
                {describe(
                  filters.gender,
                  filters.ageGroup,
                  filters.country,
                  formattedDate
                )}
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
                  {describe(filters.gender, filters.ageGroup, filters.country)}
                </p>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
