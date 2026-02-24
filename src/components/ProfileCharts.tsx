"use client";

const CHART_BASE = "https://charts.mongodb.com/charts-todai-fevei/embed/charts";

const CHARTS = [
  { id: "3e56620a-ac24-464e-9793-3f5065281e6f", label: "My Week" },
  { id: "bf813e4f-506b-46e3-a5b6-b2f61d8608da", label: "Avg by Day" },
  { id: "6a242e47-3cd5-4e76-bf01-b84e09f79fc7", label: "My Month" },
  { id: "660cd833-bf1c-443f-9ee2-103ee7d4cb98", label: "My Year" },
];

interface ProfileChartsProps {
  chartFilter: string;
}

export default function ProfileCharts({ chartFilter }: ProfileChartsProps) {
  return (
    <div>
      {/* Heading */}
      <div className="flex items-center gap-1.5 mb-4 py-2.5 text-sm font-medium text-forest">
        <i className="fas fa-chart-bar text-xs" />
        My Charts
      </div>

      <div className="space-y-3">
        {CHARTS.map((chart) => (
          <div
            key={chart.id}
            className="bg-white rounded-xl border border-warm-border/30 shadow-card overflow-hidden"
          >
            <iframe
              style={{
                background: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
              }}
              width="100%"
              height="260"
              src={`${CHART_BASE}?id=${chart.id}&filter=${chartFilter}&maxDataAge=300&theme=light&autoRefresh=true`}
            />
          </div>
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
