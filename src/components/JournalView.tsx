"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteJournal } from "@/app/actions/journals";

interface JournalViewProps {
  journal: {
    _id: string;
    date: string;
    title: string;
    body: string;
    edited: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default function JournalView({ journal }: JournalViewProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createdDate = journal.createdAt
    ? new Date(journal.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : journal.date;

  const createdTime = journal.createdAt
    ? new Date(journal.createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const editedDate = journal.updatedAt
    ? new Date(journal.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " at " +
      new Date(journal.updatedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteJournal(journal._id);
      if (result.success) {
        router.push("/journal");
      } else {
        setDeleting(false);
        setShowDelete(false);
      }
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream-light/50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/journal"
            className="text-sm text-warm-gray hover:text-forest transition-colors"
          >
            <i className="fas fa-arrow-left mr-1.5" />
            Back to journals
          </Link>
        </div>

        {/* Journal card */}
        <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
          {/* Header */}
          <div className="border-b border-warm-border/20 px-6 py-4 text-center">
            {journal.title && (
              <h1 className="text-lg font-semibold text-warm-brown mb-1">
                {journal.title}
              </h1>
            )}
            <p className="text-xs text-warm-gray font-mono">{createdDate}</p>
            {createdTime && (
              <p className="text-[11px] text-warm-gray/60 font-mono">
                {createdTime}
              </p>
            )}
            {journal.edited && editedDate && (
              <p className="text-[11px] text-warm-gray/50 font-mono mt-1">
                Edited: {editedDate}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <div
              className="text-sm text-warm-brown leading-relaxed font-mono"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {journal.body}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-warm-border/20 px-6 py-3 flex items-center gap-3">
            <Link
              href={"/write/" + journal._id + "/edit"}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold/20 text-gold-hover rounded-xl text-sm font-medium hover:bg-gold/30 transition-colors"
            >
              <i className="fas fa-pen text-xs" />
              Edit
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <i className="fas fa-trash-alt text-xs" />
              Delete
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDelete && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowDelete(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
                <h3 className="font-semibold text-warm-brown mb-2">
                  Delete this journal entry?
                </h3>
                <p className="text-sm text-warm-gray mb-4">
                  This action cannot be undone. Your entry will be permanently
                  removed.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowDelete(false)}
                    className="px-4 py-2 text-sm text-warm-gray rounded-lg hover:bg-cream-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-colors"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
