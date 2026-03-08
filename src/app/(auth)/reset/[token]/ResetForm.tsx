"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/password-reset";

interface ResetFormProps {
  token: string;
}

export default function ResetForm({ token }: ResetFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    const result = await resetPassword(token, password, confirm);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setSuccess(true);
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
          {success ? (
            <div className="text-center">
              <i className="fas fa-check-circle text-3xl text-forest mb-4 block" />
              <h1 className="text-lg font-semibold text-warm-brown mb-2">
                Password reset!
              </h1>
              <p className="text-sm text-warm-gray mb-6">
                Your password has been changed successfully. You can now log in
                with your new password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-hover text-cream-light font-medium rounded-xl transition-colors text-sm"
              >
                Log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-warm-brown mb-1 text-center">
                Set new password
              </h1>
              <p className="text-sm text-warm-gray mb-6 text-center">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-warm-border/40 bg-cream-light/50 px-4 py-2.5 text-sm text-warm-brown focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full rounded-xl border border-warm-border/40 bg-cream-light/50 px-4 py-2.5 text-sm text-warm-brown focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
                    placeholder="Confirm your password"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-forest py-2.5 text-sm font-medium text-cream-light hover:bg-forest-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? "Resetting..." : "Reset password"}
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
