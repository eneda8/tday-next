"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createJournal } from "@/app/actions/journals";

export default function WriteForm() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDiscard, setShowDiscard] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Autofocus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Update char count
  useEffect(() => {
    setCharCount(body.length);
  }, [body]);

  // Format today's date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSaving(true);
    setError("");

    try {
      const result = await createJournal({
        title: title.trim() || undefined,
        body: body.trim(),
      });

      if (result.success && result.journalId) {
        router.push("/write/" + result.journalId);
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

  const handleDiscard = () => {
    setTitle("");
    setBody("");
    setShowDiscard(false);
    setError("");
    textareaRef.current?.focus();
  };

  const hasContent = title.trim() || body.trim();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream-light/50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-warm-gray font-mono">
            Write to your heart&apos;s content.
          </p>
          <p className="text-xs text-warm-gray/70 font-mono mt-1">
            <i className="fas fa-lock text-[10px] mr-1" />
            Journal entries are 100% private and encrypted.
          </p>
        </div>

        {/* Writing area */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
            {/* Date bar */}
            <div className="border-b border-warm-border/20 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-warm-gray font-mono">
                {today}
              </span>
              <span className="text-xs text-warm-gray/60 font-mono">
                {time}
              </span>
            </div>

            {/* Title input */}
            <div className="border-b border-warm-border/10 px-6 py-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full text-lg font-medium text-warm-brown placeholder-warm-gray/40 bg-transparent focus:outline-none"
              />
            </div>

            {/* Body textarea */}
            <div className="px-6 py-4">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start writing..."
                className="w-full min-h-[60vh] text-sm text-warm-brown leading-relaxed font-mono placeholder-warm-gray/40 bg-transparent resize-none focus:outline-none"
                required
              />
            </div>

            {/* Footer bar */}
            <div className="border-t border-warm-border/20 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Discard button */}
                {hasContent && (
                  <button
                    type="button"
                    onClick={() => setShowDiscard(true)}
                    className="text-xs text-red-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash-alt mr-1" />
                    Discard
                  </button>
                )}

                {/* Char count */}
                <span className="text-[11px] text-warm-gray/50 font-mono">
                  {charCount > 0 ? charCount.toLocaleString() + " chars" : ""}
                </span>
              </div>

              {/* Submit button */}
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
                    <i className="fas fa-paper-plane text-xs" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </form>

        {/* Discard confirmation modal */}
        {showDiscard && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowDiscard(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
                <h3 className="font-semibold text-warm-brown mb-2">
                  Discard this entry?
                </h3>
                <p className="text-sm text-warm-gray mb-4">
                  Your writing will be lost. This can&apos;t be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowDiscard(false)}
                    className="px-4 py-2 text-sm text-warm-gray rounded-lg hover:bg-cream-light transition-colors"
                  >
                    Keep writing
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Discard
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
