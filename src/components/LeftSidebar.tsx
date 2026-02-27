"use client";

import Link from "next/link";
import ChartEmbed from "@/components/charts/ChartEmbed";

interface LeftSidebarProps {
  today: string; // e.g. "Feb 23, 2026"
}

const SIDEBAR_CHARTS = [
  { id: "dab42b0e-905e-459c-951b-6a8dde5b28ed", height: 260, maxDataAge: 10 },
  { id: "3d402d54-0338-46ff-ae2f-400d23fbed7a", height: 260, maxDataAge: 60 },
  { id: "6cefcd4d-caef-4025-9446-9ddbf2c3a6e9", height: 260, maxDataAge: 60 },
];

export default function LeftSidebar({ today }: LeftSidebarProps) {
  const dateFilter = { date: today };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
        <i className="fas fa-chart-bar mr-1.5 text-forest" />
        Today&apos;s Snapshot
      </h3>

      {/* Chart cards */}
      {SIDEBAR_CHARTS.map((chart) => (
        <ChartEmbed
          key={chart.id}
          chartId={chart.id}
          height={chart.height}
          maxDataAge={chart.maxDataAge}
          filter={dateFilter}
        />
      ))}

      {/* View all link */}
      <Link
        href="/charts"
        className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-warm-border/30 shadow-card px-4 py-3 text-sm font-medium text-forest hover:bg-cream-light transition-colors"
      >
        <i className="fas fa-chart-line text-xs" />
        View all charts
        <i className="fas fa-arrow-right text-[10px]" />
      </Link>
    </div>
  );
}
