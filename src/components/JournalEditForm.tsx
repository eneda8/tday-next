"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateJournal } from "@/app/actions/journals";

interface JournalEditFormProps {
  journal: {
    _id: string;
    title: string;
    body: string;
  };
}

export default function JournalEditForm({ journal }: JournalEditFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(journal.title);
  const [body, setBody] = useState(journal.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    textareaRef.current?.focus();
    // Move cursor to end
    if (textareaRef.current) {
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSaving(true);
    setError("");

    try {
      const result = await updateJournal(journal._id, {
        title: title.trim(),
        body: body.trim(),
      });

      if (result.success) {
        router.push("/write/" + journal._id);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Something went wrong.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream-light/50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-warm-gray font-mono">
            Editing journal entry
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
            {/* Title */}
            <div className="border-b border-warm-border/10 px-6 py-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full text-lg font-medium text-warm-brown placeholder-warm-gray/40 bg-transparent focus:outline-none"
              />
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[60vh] text-sm text-warm-brown leading-relaxed font-mono placeholder-warm-gray/40 bg-transparent resize-none focus:outline-none"
                required
              />
            </div>

            {/* Footer */}
            <div className="border-t border-warm-border/20 px-6 py-3 flex items-center justify-between">
              <Link
                href={"/write/" + journal._id}
                className="text-sm text-warm-gray hover:text-warm-brown transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !body.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-forest hover:bg-forest-hover disabled:bg-cream-dark disabled:text-warm-gray text-cream-light font-medium rounded-xl transition-colors text-sm"
              >
                {saving ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin text-xs" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check text-xs" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
