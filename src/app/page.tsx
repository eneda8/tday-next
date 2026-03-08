import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="paper-bg min-h-[100dvh] sm:min-h-screen">
      <main className="mx-auto flex min-h-[100dvh] flex-col items-center justify-around gap-6 px-4 py-10 sm:min-h-screen sm:max-w-3xl sm:justify-center sm:gap-10 sm:px-6 sm:py-12">

        {/* HERO */}
        <section className="pt-10 text-center">
          <h1 className="mb-2 sm:mb-4 inline-flex items-stretch justify-center text-4xl sm:text-6xl md:text-7xl" style={{ lineHeight: "1" }}>
            <span className="font-logo font-semibold text-gold">
              t&apos;day
            </span>
            <span
              className="blinking-cursor ml-1.5 rounded-sm bg-forest self-stretch"
              style={{ width: "3px" }}
            />
          </h1>
          <p className="mx-auto mb-4 sm:mb-8 max-w-md text-base sm:text-xl text-warm-brown-light">
            The world&apos;s first collective online journal.
            <br />
            <span className="text-warm-gray">
              Rate your day. See how the world feels.
            </span>
          </p>
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

        {/* GLOBAL MOOD CARD */}
        <section className="w-full">
          <div className="paper-card px-4 py-4 sm:px-8 sm:py-6">
            <div className="mb-2 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-warm-gray">
              <i className="fas fa-globe-americas text-forest" />
              Today&apos;s Global Mood
            </div>
            <div className="space-y-1.5 sm:space-y-3">
              {[
                { stars: 5, pct: 28, color: "#2ECC71" },
                { stars: 4, pct: 35, color: "#27AE60" },
                { stars: 3, pct: 22, color: "#F1C40F" },
                { stars: 2, pct: 10, color: "#E67E22" },
                { stars: 1, pct: 5, color: "#E74C3C" },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-16 sm:w-20 shrink-0 text-right text-xs sm:text-sm text-warm-gray">
                    {"★".repeat(row.stars)}{"☆".repeat(5 - row.stars)}
                  </span>
                  <div className="h-4 sm:h-5 min-w-0 flex-1 overflow-hidden rounded-full bg-cream-dark/50">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                  <span className="w-8 sm:w-10 shrink-0 text-right text-[10px] sm:text-xs text-warm-gray">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 sm:mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-t border-warm-border/30 pt-3 sm:pt-4 text-xs sm:text-sm text-warm-gray">
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
            <div className="mt-3 sm:mt-4 text-center">
              <Link
                href={session ? "/charts" : "/register"}
                className="text-xs sm:text-sm font-medium text-forest hover:text-forest-hover"
              >
                Explore global analytics →
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURE PILLS */}
        <section className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-warm-gray">
          <span className="rounded-full border border-warm-border/40 bg-white px-3 py-1.5 sm:px-4 sm:py-2 shadow-card">
            <i className="fas fa-star mr-1 text-gold-star" />
            Rate 1–5 daily
          </span>
          <span className="rounded-full border border-warm-border/40 bg-white px-3 py-1.5 sm:px-4 sm:py-2 shadow-card">
            <i className="fas fa-chart-line mr-1 text-forest" />
            Track your mood
          </span>
          <span className="rounded-full border border-warm-border/40 bg-white px-3 py-1.5 sm:px-4 sm:py-2 shadow-card">
            <i className="fas fa-lock mr-1 text-warm-brown-light" />
            100% anonymous
          </span>
        </section>

        {/* FOOTER */}
        <footer className="w-full text-center text-[10px] sm:text-xs text-warm-gray">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/about" className="hover:text-forest">About</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-forest">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-forest">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-forest">Contact</Link>
          </div>
          <p className="mt-1 sm:mt-2">
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
