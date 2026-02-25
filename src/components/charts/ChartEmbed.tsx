import { CHARTS_BASE_URL } from "@/lib/chartIds";

interface ChartEmbedProps {
  chartId: string;
  height?: number;
  maxDataAge?: number;
  filter?: Record<string, string>;
}

export default function ChartEmbed({
  chartId,
  height = 260,
  maxDataAge = 60,
  filter,
}: ChartEmbedProps) {
  const filterParam = filter
    ? `&filter=${encodeURIComponent(JSON.stringify(filter))}`
    : "";

  const src = `${CHARTS_BASE_URL}?id=${chartId}&maxDataAge=${maxDataAge}&autoRefresh=true&theme=light${filterParam}`;

  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
      <div className="p-1" style={{ pointerEvents: "none" }}>
        <iframe
          src={src}
          width="100%"
          height={height}
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
  );
}
