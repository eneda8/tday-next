"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { countries } from "@/lib/countries";

const AGE_GROUPS = [
  { value: "Greatest Generation", label: "Greatest Generation (1901-1927)" },
  { value: "Silent Generation", label: "Silent Generation (1928-1945)" },
  { value: "Baby Boomers", label: "Baby Boomers (1946-1964)" },
  { value: "Gen X", label: "Gen X (1965-1980)" },
  { value: "Millennials", label: "Millennials (1981-1996)" },
  { value: "Gen Z", label: "Gen Z (1997-2012)" },
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

interface ChartFiltersProps {
  basePath: string; // e.g. "/charts" or "/charts/all"
  showDatePicker?: boolean;
}

export default function ChartFilters({
  basePath,
  showDatePicker = false,
}: ChartFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(
    searchParams.has("country") ||
      searchParams.has("ageGroup") ||
      searchParams.has("gender") ||
      searchParams.has("date")
  );

  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [ageGroup, setAgeGroup] = useState(searchParams.get("ageGroup") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");

  const hasActiveFilters = country || ageGroup || gender || date;

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (ageGroup) params.set("ageGroup", ageGroup);
    if (gender) params.set("gender", gender);
    if (date) params.set("date", date);

    const qs = params.toString();
    router.push(basePath + (qs ? "?" + qs : ""));
  };

  const clearFilters = () => {
    setCountry("");
    setAgeGroup("");
    setGender("");
    setDate("");
    router.push(basePath);
  };

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-warm-brown hover:bg-cream-light/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <i className="fas fa-filter text-xs text-forest" />
          Filters
          {hasActiveFilters && (
            <span className="bg-forest text-cream-light text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </span>
        <i
          className={
            "fas fa-chevron-down text-xs text-warm-gray transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-warm-border/20">
          {/* Date (only on All Charts) */}
          {showDatePicker && (
            <div className="pt-3">
              <label className="block text-xs font-medium text-warm-gray mb-1">
                <i className="far fa-calendar-alt text-forest mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                max={todayISO}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm border border-warm-border/40 rounded-lg px-2 py-1.5 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>
          )}

          {/* Country */}
          <div className={showDatePicker ? "" : "pt-3"}>
            <label className="block text-xs font-medium text-warm-gray mb-1">
              <i className="fas fa-globe-americas text-forest mr-1" />
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full text-sm border border-warm-border/40 rounded-lg px-2 py-1.5 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            >
              <option value="">Global</option>
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Age Group */}
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-1">
              <i className="fas fa-birthday-cake text-forest mr-1" />
              Age Group
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full text-sm border border-warm-border/40 rounded-lg px-2 py-1.5 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            >
              <option value="">All Ages</option>
              {AGE_GROUPS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-1">
              <i className="fas fa-venus-mars text-forest mr-1" />
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-sm border border-warm-border/40 rounded-lg px-2 py-1.5 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            >
              <option value="">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={applyFilters}
              className="flex-1 bg-forest text-cream-light text-sm font-medium py-2 rounded-lg hover:bg-forest-hover transition-colors"
            >
              Filter charts
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 bg-cream-dark text-warm-brown text-sm rounded-lg hover:bg-warm-border/40 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
