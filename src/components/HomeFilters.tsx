"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface HomeFiltersProps {
  countries: { name: string }[];
}

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

const RATING_OPTIONS = [
  { value: "1", label: "\u2605" },
  { value: "2", label: "\u2605\u2605" },
  { value: "3", label: "\u2605\u2605\u2605" },
  { value: "4", label: "\u2605\u2605\u2605\u2605" },
  { value: "5", label: "\u2605\u2605\u2605\u2605\u2605" },
];

export default function HomeFilters({ countries }: HomeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [rating, setRating] = useState<string[]>(
    searchParams.getAll("rating")
  );
  const [ageGroup, setAgeGroup] = useState(
    searchParams.get("ageGroup") || ""
  );
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [hasImage, setHasImage] = useState(
    searchParams.get("image") === "true"
  );

  const hasActiveFilters =
    country || rating.length > 0 || ageGroup || gender || hasImage;

  const toggleRating = (r: string) => {
    setRating((prev) =>
      prev.includes(r) ? prev.filter((v) => v !== r) : [...prev, r]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    rating.forEach((r) => params.append("rating", r));
    if (ageGroup) params.set("ageGroup", ageGroup);
    if (gender) params.set("gender", gender);
    if (hasImage) params.set("image", "true");

    const qs = params.toString();
    router.push("/home" + (qs ? "?" + qs : ""));
    setOpen(false);
  };

  const clearFilters = () => {
    setCountry("");
    setRating([]);
    setAgeGroup("");
    setGender("");
    setHasImage(false);
    router.push("/home");
    setOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
      {/* Toggle button */}
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

      {/* Filter panel */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-warm-border/20">
          {/* Country */}
          <div className="pt-3">
            <label className="block text-xs font-medium text-warm-gray mb-1">
              <i className="fas fa-globe-americas text-forest mr-1" />
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full text-sm border border-warm-border/40 rounded-lg px-2 py-1.5 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating — checkboxes with star counts */}
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-1.5">
              <i className="far fa-star text-forest mr-1" />
              Rating
            </label>
            <div className="space-y-1">
              {RATING_OPTIONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-cream-light/50 rounded px-1 py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={rating.includes(r.value)}
                    onChange={() => toggleRating(r.value)}
                    className="rounded border-warm-border/40 text-forest focus:ring-forest/30"
                  />
                  <span className="text-gold-star">{r.label}</span>
                </label>
              ))}
            </div>
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
              <option value="">All ages</option>
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
              <option value="">All genders</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Has image */}
          <label className="flex items-center gap-2 text-sm text-warm-brown cursor-pointer">
            <input
              type="checkbox"
              checked={hasImage}
              onChange={(e) => setHasImage(e.target.checked)}
              className="rounded border-warm-border/40 text-forest focus:ring-forest/30"
            />
            <i className="fas fa-file-image text-forest text-xs" />
            Includes image
          </label>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={applyFilters}
              className="flex-1 bg-forest text-cream-light text-sm font-medium py-2 rounded-lg hover:bg-forest-hover transition-colors"
            >
              Filter
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
