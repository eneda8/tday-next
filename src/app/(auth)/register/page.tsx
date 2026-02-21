"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { countries, AGE_GROUPS, GENDERS } from "@/lib/countries";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 fields
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [countryCode, setCountryCode] = useState("");

  // Step 3 fields
  const [timezone, setTimezone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Password requirements check
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Get timezones
  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      // Fallback for older browsers
      return ["UTC"];
    }
  }, []);

  // Detect client timezone on first render
  useState(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected && !timezone) {
      setTimezone(detected);
    }
  });

  function canAdvanceStep1(): boolean {
    return (
      username.length >= 3 &&
      /^[a-zA-Z0-9_]{3,16}$/.test(username) &&
      email.includes("@") &&
      isPasswordValid
    );
  }

  function canAdvanceStep2(): boolean {
    return ageGroup !== "" && gender !== "" && countryCode !== "";
  }

  function handleNext() {
    setError("");
    if (step === 1 && canAdvanceStep1()) {
      setStep(2);
    } else if (step === 2 && canAdvanceStep2()) {
      setStep(3);
    }
  }

  function handleBack() {
    setError("");
    if (step > 1) setStep(step - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) {
      setError("You must accept the Terms of Service");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Map country code to name
      const country = countries.find((c) => c.code === countryCode);
      const countryName = country?.name || "";

      // Detect client timezone
      const clientTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const result = await registerUser({
        username,
        email,
        password,
        ageGroup,
        gender,
        countryName,
        countryCode,
        defaultTimezone: timezone,
        timezone: clientTimezone,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push("/login");
      } else {
        router.push("/home");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
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
            Create your account
          </p>
        </div>

        {/* Step indicator dots */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                s === step
                  ? "scale-125 bg-forest"
                  : s < step
                    ? "bg-forest/40"
                    : "bg-warm-border/40"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <i className="fas fa-exclamation-circle mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ========================
              STEP 1: Account Info
              ======================== */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-brown">
                Account Details
              </h2>

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
                  placeholder="3-16 characters, letters/numbers/underscore"
                  className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown placeholder-warm-gray/60 outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
                />
                {username.length > 0 && !/^[a-zA-Z0-9_]{3,16}$/.test(username) && (
                  <p className="mt-1 text-xs text-red-500">
                    3-16 characters, alphanumeric and underscore only
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-warm-brown"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
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
                  autoComplete="new-password"
                  placeholder="8-20 characters"
                  className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown placeholder-warm-gray/60 outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
                />

                {/* Live password requirements */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {[
                      { key: "length" as const, label: "8-20 characters" },
                      { key: "uppercase" as const, label: "One uppercase letter" },
                      { key: "number" as const, label: "One number" },
                      { key: "special" as const, label: "One special character" },
                    ].map((req) => (
                      <div
                        key={req.key}
                        className={`flex items-center gap-2 text-xs ${
                          passwordChecks[req.key]
                            ? "text-green-600"
                            : "text-warm-gray"
                        }`}
                      >
                        <i
                          className={`fas ${
                            passwordChecks[req.key]
                              ? "fa-check-circle"
                              : "fa-circle"
                          } text-[10px]`}
                        />
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvanceStep1()}
                className="btn-lift w-full rounded-lg bg-forest py-2.5 text-sm font-medium text-cream-light shadow-card transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* ========================
              STEP 2: Demographics
              ======================== */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-brown">
                About You
              </h2>

              {/* Age Group */}
              <div>
                <label
                  htmlFor="ageGroup"
                  className="mb-1 block text-sm font-medium text-warm-brown"
                >
                  Age Group
                </label>
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  required
                  className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
                >
                  <option value="">Select your generation</option>
                  {AGE_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="mb-1 block text-sm font-medium text-warm-brown"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="mb-1 block text-sm font-medium text-warm-brown"
                >
                  Country
                </label>
                <select
                  id="country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  required
                  className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
                >
                  <option value="">Select your country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 rounded-lg border border-warm-border/40 bg-cream py-2.5 text-sm font-medium text-warm-brown transition hover:bg-cream-dark/50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canAdvanceStep2()}
                  className="btn-lift flex-1 rounded-lg bg-forest py-2.5 text-sm font-medium text-cream-light shadow-card transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ========================
              STEP 3: Timezone & Terms
              ======================== */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-brown">
                Final Step
              </h2>

              {/* Timezone */}
              <div>
                <label
                  htmlFor="timezone"
                  className="mb-1 block text-sm font-medium text-warm-brown"
                >
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                  className="w-full rounded-lg border border-warm-border/60 bg-cream-light px-4 py-2.5 text-sm text-warm-brown outline-none transition focus:border-forest focus:ring-1 focus:ring-forest"
                >
                  <option value="">Select timezone</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Terms checkbox */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-warm-border/30 bg-cream-light/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-warm-border accent-forest"
                />
                <span className="text-sm text-warm-brown">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-medium text-forest hover:text-forest-hover"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-medium text-forest hover:text-forest-hover"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 rounded-lg border border-warm-border/40 bg-cream py-2.5 text-sm font-medium text-warm-brown transition hover:bg-cream-dark/50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="btn-lift flex-1 rounded-lg bg-gold py-2.5 text-sm font-medium text-warm-brown shadow-card transition hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-spinner fa-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Login link */}
        <div className="mt-6 text-center text-sm text-warm-gray">
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-forest hover:text-forest-hover"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
