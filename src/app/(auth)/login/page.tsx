"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/home");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function fillDemo() {
    setUsername("demo");
    setPassword("Demo123!");
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username: "demo",
        password: "Demo123!",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/home");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="paper-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="paper-card w-full max-w-md px-6 py-8 sm:px-8">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link href="/">
            <h1 className="inline-flex items-end text-4xl">
              <span className="font-logo font-semibold text-gold">
                t&apos;day
              </span>
              <span
                className="blinking-cursor ml-1"
                style={{ fontSize: "0.8em", lineHeight: "1" }}
              >
                |
              </span>
            </h1>
          </Link>
          <p className="mt-2 text-sm text-warm-gray">
            Welcome back! Log in to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <i className="fas fa-exclamation-circle mr-2" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-warm-brown"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Your username"
              className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown placeholder-warm-gray/60 outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-warm-brown"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown placeholder-warm-gray/60 outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-lift w-full rounded-lg bg-forest py-2.5 text-sm font-medium text-cream-light shadow-card transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-spinner fa-spin" />
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Demo button */}
        <button
          type="button"
          onClick={fillDemo}
          className="mt-3 w-full rounded-lg border border-warm-border/40 bg-cream py-2.5 text-sm font-medium text-warm-brown transition hover:bg-cream-dark/50"
        >
          <i className="fas fa-play-circle mr-2 text-forest" />
          Try Demo Account
        </button>

        {/* Links */}
        <div className="mt-6 space-y-2 text-center text-sm text-warm-gray">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-forest hover:text-forest-hover"
            >
              Sign Up
            </Link>
          </p>
          <p>
            <Link
              href="/forgot-password"
              className="font-medium text-forest hover:text-forest-hover"
            >
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
