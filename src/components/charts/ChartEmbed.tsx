"use client";

import { useEffect, useRef, useState } from "react";
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import { CHARTS_BASE_URL } from "@/lib/chartIds";

const sdk = new ChartsEmbedSDK({ baseUrl: CHARTS_BASE_URL });

interface ChartEmbedProps {
  chartId: string;
  height?: number;
  maxDataAge?: number;
  filter?: Record<string, unknown>;
  theme?: "light" | "dark";
  /** If true, the card wrapper is omitted (bare chart). */
  bare?: boolean;
}

export default function ChartEmbed({
  chartId,
  height = 260,
  maxDataAge = 60,
  filter,
  theme = "light",
  bare = false,
}: ChartEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ReturnType<typeof sdk.createChart> | null>(
    null
  );
  const renderedRef = useRef(false);
  const [loading, setLoading] = useState(true);

  // Create & render the chart on mount (or when chartId changes)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clean up any previous chart
    el.innerHTML = "";
    renderedRef.current = false;
    setLoading(true);

    const chart = sdk.createChart({
      chartId,
      height: `${height}px`,
      width: "100%",
      theme,
      autoRefresh: true,
      maxDataAge,
      filter: filter && Object.keys(filter).length > 0 ? filter : undefined,
    });

    chartInstanceRef.current = chart;

    chart
      .render(el)
      .then(() => {
        renderedRef.current = true;
        setLoading(false);
      })
      .catch((err) => {
        console.error("Chart render error:", err);
        setLoading(false);
      });

    return () => {
      chartInstanceRef.current = null;
      renderedRef.current = false;
      if (el) el.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  // Dynamically update filter without full re-render
  useEffect(() => {
    if (!renderedRef.current || !chartInstanceRef.current) return;
    chartInstanceRef.current
      .setFilter(filter && Object.keys(filter).length > 0 ? filter : {})
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)]);

  // Dynamically update theme (for future dark mode)
  useEffect(() => {
    if (!renderedRef.current || !chartInstanceRef.current) return;
    chartInstanceRef.current.setTheme(theme).catch(console.error);
  }, [theme]);

  const inner = (
    <div
      ref={containerRef}
      style={{ pointerEvents: "none", minHeight: height }}
      className={loading ? "animate-pulse bg-cream-light rounded-xl" : ""}
    />
  );

  if (bare) return inner;

  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
      <div className="p-1">{inner}</div>
    </div>
  );
}
