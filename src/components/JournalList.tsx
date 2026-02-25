"use client";

import Link from "next/link";

interface SerializedJournal {
  _id: string;
  date: string;
  title: string;
  body: string;
  edited: boolean;
  createdAt: string;
}

interface JournalListProps {
  journals: SerializedJournal[];
}

export default function JournalList({ journals }: JournalListProps) {
  return (
    <div>
      {/* New Entry button */}
      <div className="flex justify-center mb-8">
        <Link
          href="/write"
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-forest hover:bg-forest-hover text-cream-light font-medium rounded-xl shadow-card hover:shadow-card-hover transition-all text-sm btn-lift"
        >
          <i className="fas fa-pen-to-square" />
          New Entry
        </Link>
      </div>

      {/* Journal entries */}
      {journals.length > 0 ? (
        <div className="space-y-4">
          {journals.map((journal) => {
            // Truncate body to ~3 lines worth of text
            const preview =
              journal.body.length > 200
                ? journal.body.slice(0, 200).trimEnd() + "..."
                : journal.body;

            const dateDisplay = journal.createdAt
              ? formatDate(journal.createdAt)
              : journal.date;

            return (
              <Link
                key={journal._id}
                href={"/write/" + journal._id}
                className="block paper-card p-5 hover:shadow-card-hover transition-all group"
              >
                {/* Date line */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-warm-gray font-mono tracking-wide">
                    {dateDisplay}
                  </span>
                  {journal.edited && (
                    <span className="text-[10px] text-warm-gray/50 italic">
                      edited
                    </span>
                  )}
                </div>

                {/* Title */}
                {journal.title && (
                  <h2 className="text-base font-semibold text-warm-brown mb-1.5 group-hover:text-forest transition-colors">
                    {journal.title}
                  </h2>
                )}

                {/* Body preview */}
                <p
                  className="text-sm text-warm-brown/70 leading-relaxed font-mono"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {preview}
                </p>

                {/* Read more indicator */}
                <div className="mt-3 text-xs text-forest/60 group-hover:text-forest transition-colors">
                  Read more <i className="fas fa-arrow-right text-[9px] ml-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="paper-card p-10 text-center">
          <i className="fas fa-feather-alt text-3xl text-warm-border/60 mb-4 block" />
          <p className="text-warm-gray mb-1">Your journal is empty.</p>
          <p className="text-sm text-warm-gray/60 mb-5">
            Start writing — your thoughts are always private and encrypted.
          </p>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-hover text-cream-light font-medium rounded-xl transition-colors text-sm"
          >
            <i className="fas fa-pen-to-square text-xs" />
            Write your first entry
          </Link>
        </div>
      )}
    </div>
  );
}

function formatDate(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoStr;
  }
}
