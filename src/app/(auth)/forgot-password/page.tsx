"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/password-reset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    const result = await requestPasswordReset(email);

    if (result.error) {
      setError(result.error);
      setSending(false);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center paper-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-logo text-4xl text-gold hover:text-gold-hover">
            t&apos;day
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8">
          {submitted ? (
            <div className="text-center">
              <i className="fas fa-envelope text-3xl text-forest mb-4 block" />
              <h1 className="text-lg font-semibold text-warm-brown mb-2">
                Check your email
              </h1>
              <p className="text-sm text-warm-gray mb-6">
                If an account exists with that email, we&apos;ll send password
                reset instructions shortly.
              </p>
              <Link
                href="/login"
                className="text-sm text-forest hover:text-forest-hover"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-warm-brown mb-1 text-center">
                Reset your password
              </h1>
              <p className="text-sm text-warm-gray mb-6 text-center">
                Enter the email address associated with your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-warm-border/40 bg-cream-light/50 px-4 py-2.5 text-sm text-warm-brown focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-forest py-2.5 text-sm font-medium text-cream-light hover:bg-forest-hover transition-colors disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="text-sm text-warm-gray hover:text-forest transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
