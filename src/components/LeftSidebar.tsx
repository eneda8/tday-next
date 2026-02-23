"use client";

import Link from "next/link";

interface LeftSidebarProps {
  today: string; // e.g. "Feb 23, 2026"
}

const CHARTS_BASE =
  "https://charts.mongodb.com/charts-todai-fevei/embed/charts";

export default function LeftSidebar({ today }: LeftSidebarProps) {
  // Encode the date filter for MongoDB Charts
  const dateFilter = encodeURIComponent(`{'date':'${today}'}`);

  const charts = [
    {
      id: "dab42b0e-905e-459c-951b-6a8dde5b28ed",
      height: 180,
      maxDataAge: 10,
    },
    {
      id: "3d402d54-0338-46ff-ae2f-400d23fbed7a",
      height: 200,
      maxDataAge: 60,
    },
    {
      id: "6cefcd4d-caef-4025-9446-9ddbf2c3a6e9",
      height: 200,
      maxDataAge: 60,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
        <i className="fas fa-chart-bar mr-1.5 text-forest" />
        Today&apos;s Snapshot
      </h3>

      {/* Chart cards — no extra titles, let the chart speak */}
      {charts.map((chart) => (
        <div
          key={chart.id}
          className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden"
        >
          <div className="p-1" style={{ pointerEvents: "none" }}>
            <iframe
              src={`${CHARTS_BASE}?id=${chart.id}&maxDataAge=${chart.maxDataAge}&autoRefresh=true&theme=light&filter=${dateFilter}`}
              width="100%"
              height={chart.height}
              scrolling="no"
              style={{
                border: "none",
                borderRadius: "12px",
                display: "block",
                background: "transparent",
              }}
              title="Chart"
            />
          </div>
        </div>
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
