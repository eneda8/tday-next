"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/app/actions/verify";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setError("");

    const result = await resendVerificationEmail(email);

    if (result.error) {
      setError(result.error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  if (status === "sent") {
    return (
      <p className="text-sm text-forest">
        <i className="fas fa-check-circle mr-1" />
        Verification email sent! Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleResend} className="space-y-3">
      <p className="text-xs text-warm-gray">
        Didn&apos;t receive it? Enter your email to resend.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        className="w-full rounded-xl border border-warm-border/40 bg-cream-light/50 px-4 py-2.5 text-sm text-warm-brown focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-forest py-2.5 text-sm font-medium text-cream-light hover:bg-forest-hover transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Resend verification email"}
      </button>
    </form>
  );
}
