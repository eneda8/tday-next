"use client";

import { useState } from "react";

const SUBJECTS = [
  "Account Question",
  "Technical Support",
  "Feedback",
  "Business Inquiry",
  "Privacy Question",
  "Other",
];

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });
      if (res.ok) {
        setStatus("sent");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-6">
        <h1 className="text-lg font-bold text-warm-brown">
          Contact <span className="text-forest">t&apos;day</span>
        </h1>
        <p className="text-xs text-warm-gray mt-0.5 mb-5">
          We&apos;d love to hear from you!
        </p>

        {status === "sent" ? (
          <div className="bg-forest/10 text-forest text-sm px-4 py-3 rounded-lg">
            <i className="fas fa-check-circle mr-2" />
            Message sent! We&apos;ll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-warm-gray mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@email.com"
                required
                className="w-full text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-gray mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
              >
                <option value="">Select an option</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-gray mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                className="w-full text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none"
              />
            </div>

            {status === "error" && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
                Something went wrong. Try emailing us at info@tday.co.
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-forest text-cream-light text-sm font-medium py-2.5 rounded-lg hover:bg-forest-hover transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
