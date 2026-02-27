"use client";

import { useState, useMemo } from "react";
import {
  TODAY_SUMMARY,
  TODAY_BREAKDOWNS,
  TODAY_SAMPLE_SIZE,
} from "@/lib/chartIds";
import ChartEmbed from "@/components/charts/ChartEmbed";
import ChartNav from "@/components/charts/ChartNav";
import ChartFilters, {
  type FilterState,
} from "@/components/charts/ChartFilters";
import CollapsibleSection from "@/components/charts/CollapsibleSection";

interface TodaysChartsContentProps {
  today: string;
  userCountry: string;
  userGender: string;
  userAgeGroup: string;
  postCount: number;
}

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

export default function TodaysChartsContent({
  today,
  userCountry,
  userGender,
  userAgeGroup,
  postCount,
}: TodaysChartsContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    ageGroup: "",
    gender: "",
    date: "",
  });

  const filtersApplied = filters.country || filters.ageGroup || filters.gender;

  // Build filter objects — recomputed when filters change
  const { dbQuery, summaryFilters } = useMemo(() => {
    const base: Record<string, string> = { date: today };
    if (filters.country) base.authorCountry = filters.country;
    if (filters.ageGroup) base.authorAgeGroup = filters.ageGroup;
    if (filters.gender) base.authorGender = filters.gender;

    const countryF: Record<string, string> = {
      date: today,
      authorCountry: userCountry,
      ...(filters.gender && { authorGender: filters.gender }),
      ...(filters.ageGroup && { authorAgeGroup: filters.ageGroup }),
    };
    const genderF: Record<string, string> = {
      date: today,
      authorGender: userGender,
      ...(filters.country && { authorCountry: filters.country }),
      ...(filters.ageGroup && { authorAgeGroup: filters.ageGroup }),
    };
    const ageGroupF: Record<string, string> = {
      date: today,
      authorAgeGroup: userAgeGroup,
      ...(filters.country && { authorCountry: filters.country }),
      ...(filters.gender && { authorGender: filters.gender }),
    };

    return {
      dbQuery: base,
      summaryFilters: [base, countryF, genderF, ageGroupF],
    };
  }, [today, userCountry, userGender, userAgeGroup, filters]);

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

      {/* Filters — live updates */}
      <div className="mb-6">
        <ChartFilters onChange={setFilters} />
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
                  ? describe(
                      filters.gender,
                      filters.ageGroup,
                      filters.country
                    )
                  : "All ratings today"}
              </p>
            )}
            {i === 1 && (
              <p className="text-xs text-warm-gray mt-1">
                {describe(filters.gender, filters.ageGroup, userCountry)}
              </p>
            )}
            {i === 2 && (
              <p className="text-xs text-warm-gray mt-1">
                {describe(userGender, filters.ageGroup, filters.country)}
              </p>
            )}
            {i === 3 && (
              <p className="text-xs text-warm-gray mt-1">
                {describe(filters.gender, userAgeGroup, filters.country)}
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
            {describe(filters.gender, filters.ageGroup, filters.country)}
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
                {describe(filters.gender, filters.ageGroup, filters.country)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Sample Size — collapsible */}
      <CollapsibleSection
        label={`Show/Hide Sample Size Charts (${postCount} ratings today)`}
      >
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
