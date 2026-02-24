"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "@/components/PostCard";

interface SearchResultsProps {
  posts: any[];
  currentUserId: string;
  searchText: string;
  totalFound: number;
  page: number;
  totalPages: number;
}

// Highlight colors — each unique word gets a different pastel color
const HIGHLIGHT_COLORS = [
  "#fff176", // yellow
  "#a0ffff", // cyan
  "#a5d6a7", // green
  "#f48fb1", // pink
  "#ce93d8", // purple
];

export default function SearchResults({
  posts,
  currentUserId,
  searchText,
  totalFound,
  page,
  totalPages,
}: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState(true);

  // Apply highlighting on mount and when searchText changes
  const applyHighlighting = useCallback(() => {
    if (!containerRef.current || !searchText.trim()) return;

    // Split search text into individual words
    const words = searchText
      .trim()
      .replace(/[^\w'-]+/g, " ")
      .split(" ")
      .filter(Boolean);

    if (words.length === 0) return;

    // Remove existing highlights first
    removeHighlighting();

    const wordColors: Record<string, string> = {};
    let colorIdx = 0;

    words.forEach((word) => {
      const lower = word.toLowerCase();
      if (!wordColors[lower]) {
        wordColors[lower] = HIGHLIGHT_COLORS[colorIdx % HIGHLIGHT_COLORS.length];
        colorIdx++;
      }
    });

    // Build regex from all words
    const pattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const regex = new RegExp(`\\b(${pattern})\\b`, "gi");

    // Walk the DOM and highlight text nodes
    const walk = (node: Node) => {
      if (!node) return;
      const tagName = (node as Element).tagName;
      if (tagName && /^(MARK|SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(tagName)) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (!text) return;

        const match = regex.exec(text);
        regex.lastIndex = 0; // Reset regex state

        if (match) {
          const mark = document.createElement("mark");
          mark.style.backgroundColor = wordColors[match[0].toLowerCase()] || HIGHLIGHT_COLORS[0];
          mark.style.color = "#1a1a1a";
          mark.style.padding = "1px 2px";
          mark.style.borderRadius = "3px";
          mark.textContent = match[0];

          const after = (node as Text).splitText(match.index);
          after.nodeValue = after.nodeValue!.substring(match[0].length);
          node.parentNode!.insertBefore(mark, after);

          // Continue walking from the remaining text
          walk(after);
        }
      } else if (node.hasChildNodes()) {
        // Copy to array since we modify the DOM during traversal
        const children = Array.from(node.childNodes);
        children.forEach(walk);
      }
    };

    walk(containerRef.current);
  }, [searchText]);

  const removeHighlighting = () => {
    if (!containerRef.current) return;
    const marks = containerRef.current.getElementsByTagName("mark");
    while (marks.length > 0) {
      const el = marks[0];
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    }
  };

  useEffect(() => {
    if (highlighted && searchText) {
      // Small delay to let React render the posts first
      const timer = setTimeout(applyHighlighting, 100);
      return () => clearTimeout(timer);
    }
  }, [highlighted, searchText, posts, applyHighlighting]);

  const toggleHighlighting = () => {
    if (highlighted) {
      removeHighlighting();
      setHighlighted(false);
    } else {
      setHighlighted(true);
      // applyHighlighting will be called by useEffect
    }
  };

  // Build pagination URLs
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(p));
    return "/search?" + params.toString();
  };

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-warm-brown">Results</h2>
          <p className="text-xs text-warm-gray">
            {totalFound} rating{totalFound !== 1 ? "s" : ""} found
            {searchText && (
              <span>
                {" "}for &ldquo;<span className="text-warm-brown font-medium">{searchText}</span>&rdquo;
              </span>
            )}
          </p>
        </div>
        {searchText && posts.length > 0 && (
          <button
            onClick={toggleHighlighting}
            className="text-xs text-forest hover:text-forest-hover transition-colors"
          >
            {highlighted ? (
              <>
                <i className="fas fa-eraser mr-1" />
                Clear highlighting
              </>
            ) : (
              <>
                <i className="fas fa-highlighter mr-1" />
                Highlight matches
              </>
            )}
          </button>
        )}
      </div>

      {/* Pagination top */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
      )}

      {/* Results */}
      <div ref={containerRef} className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} currentUserId={currentUserId} />
          ))
        ) : searchText ? (
          <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8 text-center">
            <i className="fas fa-search text-3xl text-warm-border mb-3 block" />
            <p className="text-warm-gray">
              No ratings match your search. Try different keywords or filters.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8 text-center">
            <i className="fas fa-search text-3xl text-warm-border mb-3 block" />
            <p className="text-warm-gray">
              Search for ratings by keyword. Try &ldquo;grateful&rdquo;, &ldquo;sunshine&rdquo;, or &ldquo;coffee&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* Pagination bottom */}
      {totalPages > 1 && posts.length > 0 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
        </div>
      )}
    </div>
  );
}

/* ===== Pagination component ===== */
function Pagination({
  page,
  totalPages,
  buildPageUrl,
}: {
  page: number;
  totalPages: number;
  buildPageUrl: (p: number) => string;
}) {
  // Show current page and a window around it
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1 mb-4">
      {page > 1 && (
        <a
          href={buildPageUrl(page - 1)}
          className="px-2.5 py-1.5 rounded-lg text-xs text-warm-gray hover:bg-cream-light transition-colors"
        >
          <i className="fas fa-chevron-left" />
        </a>
      )}
      {start > 1 && (
        <>
          <a
            href={buildPageUrl(1)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-warm-gray hover:bg-cream-light transition-colors"
          >
            1
          </a>
          {start > 2 && <span className="text-xs text-warm-gray">...</span>}
        </>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={buildPageUrl(p)}
          className={
            "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors " +
            (p === page
              ? "bg-forest text-white"
              : "text-warm-gray hover:bg-cream-light")
          }
        >
          {p}
        </a>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-xs text-warm-gray">...</span>}
          <a
            href={buildPageUrl(totalPages)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-warm-gray hover:bg-cream-light transition-colors"
          >
            {totalPages}
          </a>
        </>
      )}
      {page < totalPages && (
        <a
          href={buildPageUrl(page + 1)}
          className="px-2.5 py-1.5 rounded-lg text-xs text-warm-gray hover:bg-cream-light transition-colors"
        >
          <i className="fas fa-chevron-right" />
        </a>
      )}
    </nav>
  );
}
