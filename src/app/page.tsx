import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="paper-bg min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12 sm:px-6">

        {/* ========================
            HERO — Logo + tagline + CTA
            ======================== */}
        <section className="text-center">
          {/* Logo — t'day with blinking cursor aligned to baseline */}
          <h1 className="mb-4 flex items-end justify-center text-5xl sm:text-6xl md:text-7xl">
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

          {/* Tagline */}
          <p className="mx-auto mb-8 max-w-md text-lg text-warm-brown-light sm:text-xl">
            The world&apos;s first collective online journal.
            <br />
            <span className="text-warm-gray">
              Rate your day. See how the world feels.
            </span>
          </p>

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-3">
            {session ? (
              <Link
                href="/home"
                className="btn-lift rounded-lg bg-forest px-6 py-2.5 text-sm font-medium text-cream-light shadow-card hover:bg-forest-hover"
              >
                Go to Home
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-lift rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-warm-brown shadow-card hover:bg-gold-hover"
                >
                  Start Rating
                </Link>
                <Link
                  href="/login"
                  className="btn-lift rounded-lg bg-forest px-6 py-2.5 text-sm font-medium text-cream-light shadow-card hover:bg-forest-hover"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* ========================
            PREVIEW — What the app looks like
            ======================== */}
        <section className="mt-16 w-full sm:mt-20">
          <div className="paper-card px-6 py-6 sm:px-8">
            {/* Mini header */}
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-warm-gray">
              <i className="fas fa-globe-americas text-forest" />
              Today&apos;s Global Mood
            </div>

            {/* Mockup: rating bars */}
            <div className="space-y-3">
              {[
                { stars: 5, label: "Amazing", pct: 28, color: "#2ECC71" },
                { stars: 4, label: "Good", pct: 35, color: "#27AE60" },
                { stars: 3, label: "Okay", pct: 22, color: "#F1C40F" },
                { stars: 2, label: "Bad", pct: 10, color: "#E67E22" },
                { stars: 1, label: "Awful", pct: 5, color: "#E74C3C" },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-right text-sm text-warm-gray">
                    {"★".repeat(row.stars)}{"☆".repeat(5 - row.stars)}
                  </span>
                  <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-full bg-cream-dark/50">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${row.pct}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs text-warm-gray">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>

            {/* Sample country moods */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-warm-border/30 pt-4 text-sm text-warm-gray">
              <span>🇺🇸 4.2</span>
              <span className="text-warm-border">·</span>
              <span>🇬🇧 3.8</span>
              <span className="text-warm-border">·</span>
              <span>🇩🇪 4.0</span>
              <span className="text-warm-border">·</span>
              <span>🇯🇵 3.5</span>
              <span className="text-warm-border">·</span>
              <span>🇧🇷 4.5</span>
              <span className="text-warm-border">·</span>
              <span>🇦🇱 4.8</span>
              <span className="text-warm-border">·</span>
              <span className="italic text-forest">+ 42 countries</span>
            </div>

            {/* CTA */}
            <div className="mt-4 text-center">
              <Link
                href={session ? "/charts" : "/register"}
                className="text-sm font-medium text-forest hover:text-forest-hover"
              >
                Explore global analytics →
              </Link>
            </div>
          </div>
        </section>

        {/* ========================
            FEATURES — Three tiny pills, not cards
            ======================== */}
        <section className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-warm-gray">
          <span className="rounded-full border border-warm-border/40 bg-white px-4 py-2 shadow-card">
            <i className="fas fa-star mr-1 text-gold-star" />
            Rate 1–5 daily
          </span>
          <span className="rounded-full border border-warm-border/40 bg-white px-4 py-2 shadow-card">
            <i className="fas fa-chart-line mr-1 text-forest" />
            Track your mood
          </span>
          <span className="rounded-full border border-warm-border/40 bg-white px-4 py-2 shadow-card">
            <i className="fas fa-lock mr-1 text-warm-brown-light" />
            100% anonymous
          </span>
        </section>

        {/* ========================
            FOOTER
            ======================== */}
        <footer className="mt-auto w-full pt-12 text-center text-xs text-warm-gray">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/about" className="hover:text-forest">About</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-forest">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-forest">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-forest">Contact</Link>
          </div>
          <p className="mt-2">
            © 2026 t&apos;day — made with{" "}
            <i className="fas fa-heart text-red-500" /> by{" "}
            <a
              href="https://github.com/eneda8"
              className="text-forest hover:text-forest-light"
            >
              eneda
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
