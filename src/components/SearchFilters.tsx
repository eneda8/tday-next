"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFiltersProps {
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

export default function SearchFilters({ countries }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [text, setText] = useState(searchParams.get("text") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [ratings, setRatings] = useState<number[]>(() => {
    const r = searchParams.getAll("rating");
    return r.map(Number).filter((n) => n >= 1 && n <= 5);
  });
  const [ageGroup, setAgeGroup] = useState(
    searchParams.get("ageGroup") || ""
  );
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [hasImage, setHasImage] = useState(
    searchParams.get("image") === "true"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleRating = (r: number) => {
    setRatings((prev) =>
      prev.includes(r) ? prev.filter((v) => v !== r) : [...prev, r]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const params = new URLSearchParams();
    params.set("text", text.trim());
    if (date) params.set("date", date);
    if (country) params.set("country", country);
    ratings.forEach((r) => params.append("rating", String(r)));
    if (ageGroup) params.set("ageGroup", ageGroup);
    if (gender) params.set("gender", gender);
    if (hasImage) params.set("image", "true");

    router.push("/search?" + params.toString());
  };

  const clearFilters = () => {
    setText("");
    setDate("");
    setCountry("");
    setRatings([]);
    setAgeGroup("");
    setGender("");
    setHasImage(false);
    router.push("/search");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray text-sm" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search ratings..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-warm-border/40 rounded-xl text-sm text-warm-brown placeholder-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-forest/30"
          required
        />
      </div>

      {/* Filter toggle */}
      <button
        type="button"
        onClick={() => setFiltersOpen(!filtersOpen)}
        className="flex items-center gap-2 text-xs font-medium text-warm-gray hover:text-warm-brown transition-colors"
      >
        <i
          className={
            "fas fa-chevron-right text-[10px] transition-transform " +
            (filtersOpen ? "rotate-90" : "")
          }
        />
        <i className="fas fa-sliders-h text-forest" />
        Filters
        {(date || country || ratings.length > 0 || ageGroup || gender || hasImage) && (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[9px] text-white">
            {[date, country, ratings.length > 0, ageGroup, gender, hasImage].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Collapsible filters */}
      {filtersOpen && (
        <div className="space-y-3 bg-white rounded-xl border border-warm-border/30 p-3">
          {/* Date */}
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1">
              <i className="far fa-calendar-alt text-forest mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-warm-border/40 rounded-lg bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1">
              <i className="fas fa-globe text-forest mr-1" />
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-warm-border/40 rounded-lg bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1">
              <i className="far fa-star text-forest mr-1" />
              Rating
            </label>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 cursor-pointer text-sm text-warm-brown"
                >
                  <input
                    type="checkbox"
                    checked={ratings.includes(r)}
                    onChange={() => toggleRating(r)}
                    className="rounded border-warm-border/40 text-forest focus:ring-forest/30"
                  />
                  <span className="text-gold">{"★".repeat(r)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1">
              <i className="fas fa-birthday-cake text-forest mr-1" />
              Age Group
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-warm-border/40 rounded-lg bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            >
              <option value="">All Ages</option>
              {AGE_GROUPS.map((ag) => (
                <option key={ag.value} value={ag.value}>
                  {ag.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1">
              <i className="fas fa-venus-mars text-forest mr-1" />
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-warm-border/40 rounded-lg bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Image */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-warm-brown">
            <input
              type="checkbox"
              checked={hasImage}
              onChange={(e) => setHasImage(e.target.checked)}
              className="rounded border-warm-border/40 text-forest focus:ring-forest/30"
            />
            <i className="fas fa-image text-forest text-xs" />
            Has image
          </label>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-forest hover:bg-forest-hover text-cream-light font-medium py-2 rounded-xl transition-colors text-sm"
        >
          <i className="fas fa-search mr-1.5" />
          Search
        </button>
        {(text || date || country || ratings.length > 0 || ageGroup || gender || hasImage) && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-2 border border-warm-border/40 rounded-xl text-sm text-warm-gray hover:bg-cream-light transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
