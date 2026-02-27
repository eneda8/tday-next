"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartNav from "@/components/charts/ChartNav";
import {
  getSummaryStats,
  getAverageByDimension,
  getRatingDistribution,
  getTrend,
  getMyTrend,
  type DataPoint,
  type TrendPoint,
  type SummaryStats,
} from "@/app/actions/chartData";

// ─── Constants ──────────────────────────────────────────────────────

const TIME_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

const VIEWS = [
  { value: "trend", label: "Trend Over Time", icon: "fa-chart-line" },
  { value: "breakdown", label: "By Category", icon: "fa-chart-bar" },
  { value: "distribution", label: "Rating Distribution", icon: "fa-chart-pie" },
  { value: "personal", label: "My Ratings", icon: "fa-user" },
];

const DIMENSIONS = [
  { value: "country", label: "Country" },
  { value: "gender", label: "Gender" },
  { value: "ageGroup", label: "Age Group" },
];

const CHART_TYPES = [
  { value: "bar", label: "Bar", icon: "fa-chart-bar" },
  { value: "line", label: "Line", icon: "fa-chart-line" },
  { value: "pie", label: "Pie", icon: "fa-chart-pie" },
];

const COLORS = [
  "#2D5F3F",
  "#4A8C6A",
  "#6BB38C",
  "#E67E22",
  "#F1C40F",
  "#E74C3C",
  "#3498DB",
  "#9B59B6",
  "#1ABC9C",
  "#E91E63",
  "#FF9800",
  "#00BCD4",
  "#8BC34A",
  "#795548",
  "#607D8B",
  "#FF5722",
  "#673AB7",
  "#009688",
  "#CDDC39",
  "#FFC107",
];

const RATING_COLORS: Record<number, string> = {
  1: "#E74C3C",
  2: "#E67E22",
  3: "#F1C40F",
  4: "#27AE60",
  5: "#2ECC71",
};

// ─── Component ──────────────────────────────────────────────────────

export default function ExploreContent() {
  const [view, setView] = useState("trend");
  const [timeRange, setTimeRange] = useState("month");
  const [dimension, setDimension] = useState<"country" | "gender" | "ageGroup">(
    "country"
  );
  const [chartType, setChartType] = useState("bar");

  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [data, setData] = useState<DataPoint[] | TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch summary stats on mount
  useEffect(() => {
    getSummaryStats().then(setStats).catch(console.error);
  }, []);

  // Fetch chart data when controls change
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      switch (view) {
        case "trend": {
          const groupBy =
            timeRange === "year" || timeRange === "all" ? "month" : "day";
          const result = await getTrend(timeRange, groupBy);
          setData(result);
          break;
        }
        case "breakdown": {
          const result = await getAverageByDimension(dimension, timeRange);
          setData(result);
          break;
        }
        case "distribution": {
          const result = await getRatingDistribution(timeRange);
          setData(result);
          break;
        }
        case "personal": {
          const result = await getMyTrend(timeRange);
          setData(result);
          break;
        }
      }
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    } finally {
      setLoading(false);
    }
  }, [view, timeRange, dimension]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Pill button helper ───────────────────────────────────────────

  const pill = (
    active: boolean,
    onClick: () => void,
    label: string,
    icon?: string
  ) => (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 " +
        (active
          ? "bg-forest text-cream-light shadow-sm"
          : "bg-cream-light text-warm-brown hover:bg-cream-dark")
      }
    >
      {icon && <i className={"fas " + icon + " text-xs"} />}
      {label}
    </button>
  );

  // ─── Render charts ────────────────────────────────────────────────

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-warm-gray text-sm animate-pulse">
            Loading chart data...
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-chart-bar text-3xl text-warm-border mb-3" />
            <p className="text-warm-gray text-sm">
              No data available for this selection.
            </p>
          </div>
        </div>
      );
    }

    if (view === "trend" || view === "personal") {
      const trendData = data as TrendPoint[];
      return (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8B7E6F", fontSize: 11 }}
              tickFormatter={(v) => {
                if (v.includes("W")) return v; // week format
                const parts = v.split("-");
                if (parts.length === 2) return v; // month format
                return `${parts[1]}/${parts[2]}`; // day: MM/DD
              }}
            />
            <YAxis
              domain={[0, 5]}
              tick={{ fill: "#8B7E6F", fontSize: 11 }}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip
              contentStyle={{
                background: "#FFF",
                border: "1px solid #E8E0D4",
                borderRadius: "12px",
                fontSize: "13px",
              }}
              formatter={(value: number) => [value.toFixed(2), "Avg Rating"]}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#2D5F3F"
              strokeWidth={2.5}
              dot={{ fill: "#2D5F3F", r: 3 }}
              activeDot={{ r: 6, fill: "#4A8C6A" }}
              name="Avg Rating"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (view === "distribution") {
      const distData = data as DataPoint[];
      if (chartType === "pie") {
        return (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={distData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                label={({ name, count }) => `${name}: ${count}`}
                labelLine={{ stroke: "#8B7E6F" }}
              >
                {distData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={RATING_COLORS[entry.value] || "#8B7E6F"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#FFF",
                  border: "1px solid #E8E0D4",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      return (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={distData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#8B7E6F", fontSize: 11 }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: "#8B7E6F", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#FFF",
                border: "1px solid #E8E0D4",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="count" name="Ratings" radius={[6, 6, 0, 0]}>
              {distData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={RATING_COLORS[entry.value] || "#8B7E6F"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // breakdown view
    const breakdownData = data as DataPoint[];

    if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Pie
              data={breakdownData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={140}
              label={({ name, value }) =>
                `${name}: ${(value as number).toFixed(2)}`
              }
              labelLine={{ stroke: "#8B7E6F" }}
            >
              {breakdownData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#FFF",
                border: "1px solid #E8E0D4",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={breakdownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#8B7E6F", fontSize: 11 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 5]}
              tick={{ fill: "#8B7E6F", fontSize: 11 }}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip
              contentStyle={{
                background: "#FFF",
                border: "1px solid #E8E0D4",
                borderRadius: "12px",
                fontSize: "13px",
              }}
              formatter={(value: number) => [value.toFixed(2), "Avg Rating"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2D5F3F"
              strokeWidth={2.5}
              dot={{ fill: "#2D5F3F", r: 4 }}
              name="Avg Rating"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // bar (default)
    return (
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={breakdownData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
          <XAxis
            type="number"
            domain={[0, 5]}
            tick={{ fill: "#8B7E6F", fontSize: 11 }}
            ticks={[1, 2, 3, 4, 5]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#8B7E6F", fontSize: 11 }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              background: "#FFF",
              border: "1px solid #E8E0D4",
              borderRadius: "12px",
              fontSize: "13px",
            }}
            formatter={(value: number, _: string, props: { payload: DataPoint }) => [
              `${value.toFixed(2)} (${props.payload.count} ratings)`,
              "Avg Rating",
            ]}
          />
          <Bar dataKey="value" name="Avg Rating" radius={[0, 6, 6, 0]}>
            {breakdownData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ─── Layout ───────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-warm-brown mb-1">Explore</h1>
      <p className="text-sm text-warm-gray mb-4">
        Build your own charts. Pick a view, time range, and see the data you
        care about.
      </p>

      {/* Nav */}
      <div className="mb-6">
        <ChartNav current="explore" />
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            {
              label: "Today's Avg",
              val: stats.todayAvg ? stats.todayAvg.toFixed(2) : "—",
              sub: `${stats.todayCount} ratings`,
            },
            {
              label: "All-Time Avg",
              val: stats.globalAvg ? stats.globalAvg.toFixed(2) : "—",
              sub: `${stats.totalRatings.toLocaleString()} ratings`,
            },
            {
              label: "Total Users",
              val: stats.totalUsers.toLocaleString(),
              sub: "registered",
            },
            {
              label: "Today's Ratings",
              val: stats.todayCount.toLocaleString(),
              sub: "posted today",
            },
            {
              label: "Total Ratings",
              val: stats.totalRatings.toLocaleString(),
              sub: "all time",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-3 text-center"
            >
              <div className="text-lg font-bold text-warm-brown">
                {card.val}
              </div>
              <div className="text-[10px] text-warm-gray">{card.label}</div>
              <div className="text-[10px] text-warm-gray/60">{card.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-4 mb-6 space-y-4">
        {/* View selector */}
        <div>
          <label className="block text-xs font-medium text-warm-gray mb-2">
            <i className="fas fa-eye text-forest mr-1" />
            View
          </label>
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((v) =>
              pill(view === v.value, () => setView(v.value), v.label, v.icon)
            )}
          </div>
        </div>

        {/* Time range */}
        <div>
          <label className="block text-xs font-medium text-warm-gray mb-2">
            <i className="far fa-clock text-forest mr-1" />
            Time Range
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((t) =>
              pill(timeRange === t.value, () => setTimeRange(t.value), t.label)
            )}
          </div>
        </div>

        {/* Dimension (only for breakdown view) */}
        {view === "breakdown" && (
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-2">
              <i className="fas fa-layer-group text-forest mr-1" />
              Group By
            </label>
            <div className="flex flex-wrap gap-2">
              {DIMENSIONS.map((d) =>
                pill(
                  dimension === d.value,
                  () =>
                    setDimension(
                      d.value as "country" | "gender" | "ageGroup"
                    ),
                  d.label
                )
              )}
            </div>
          </div>
        )}

        {/* Chart type (for breakdown & distribution) */}
        {(view === "breakdown" || view === "distribution") && (
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-2">
              <i className="fas fa-palette text-forest mr-1" />
              Chart Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CHART_TYPES.map((c) =>
                pill(
                  chartType === c.value,
                  () => setChartType(c.value),
                  c.label,
                  c.icon
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-warm-brown">
            {VIEWS.find((v) => v.value === view)?.label}
            <span className="text-warm-gray font-normal ml-2">
              {TIME_RANGES.find((t) => t.value === timeRange)?.label}
              {view === "breakdown" &&
                ` · ${DIMENSIONS.find((d) => d.value === dimension)?.label}`}
            </span>
          </h2>
          {!loading && data.length > 0 && (
            <span className="text-xs text-warm-gray">
              {data.length} data points
            </span>
          )}
        </div>
        {renderChart()}
      </div>
    </div>
  );
}
