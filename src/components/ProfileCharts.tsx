"use client";

import ChartEmbed from "@/components/charts/ChartEmbed";

const CHARTS = [
  { id: "3e56620a-ac24-464e-9793-3f5065281e6f", label: "My Week" },
  { id: "bf813e4f-506b-46e3-a5b6-b2f61d8608da", label: "Avg by Day" },
  { id: "6a242e47-3cd5-4e76-bf01-b84e09f79fc7", label: "My Month" },
  { id: "660cd833-bf1c-443f-9ee2-103ee7d4cb98", label: "My Year" },
];

interface ProfileChartsProps {
  /** The user's MongoDB _id string, used to filter charts to their data. */
  userId: string;
}

export default function ProfileCharts({ userId }: ProfileChartsProps) {
  const filter = { authorID: userId };

  return (
    <div>
      {/* Heading */}
      <div className="flex items-center gap-1.5 mb-4 py-2.5 text-sm font-medium text-forest">
        <i className="fas fa-chart-bar text-xs" />
        My Charts
      </div>

      <div className="space-y-3">
        {CHARTS.map((chart) => (
          <ChartEmbed
            key={chart.id}
            chartId={chart.id}
            height={260}
            maxDataAge={300}
            filter={filter}
          />
        ))}
        <a
          href="/charts/me"
          className="block text-center text-xs text-forest hover:text-forest-hover transition-colors py-2"
        >
          View all my charts →
        </a>
      </div>
    </div>
  );
}
