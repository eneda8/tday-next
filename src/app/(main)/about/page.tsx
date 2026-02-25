import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-6 lg:p-8">
        <h1 className="text-xl font-bold text-warm-brown mb-1">
          About <span className="text-forest">t&apos;day</span>
        </h1>
        <p className="text-xs text-warm-gray mb-6">The world&apos;s first collective online journal</p>

        <div className="space-y-5 text-sm text-warm-brown leading-relaxed">
          <section>
            <h2 className="font-semibold text-base mb-2">How&apos;s your day?</h2>
            <p>
              Every day, t&apos;day asks one simple question: how&apos;s your day? Rate your day
              from 1 to 5, add a note if you&apos;d like, and see how everyone else is doing. No
              likes, no followers, no endless scrolling &mdash; just a daily check-in with yourself
              and the world.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">A wider perspective</h2>
            <p>
              See how people across different countries, age groups, and genders are feeling today.
              t&apos;day gives you a window into the collective mood of the world, helping you feel
              connected to something bigger than yourself.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">Today, quantified</h2>
            <p>
              Track your mood over time with personal charts and statistics. See your averages,
              streaks, and patterns. Compare your experience with global trends across interactive
              charts and breakdowns.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">No addiction by design</h2>
            <p>
              t&apos;day is intentionally minimal. One post per day. No infinite feed, no
              algorithmic manipulation, no dopamine loops. We believe technology should serve your
              well-being, not exploit it.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">Your private journal</h2>
            <p>
              Write encrypted journal entries that only you can read. Your journals are protected
              with field-level encryption &mdash; not even we can access them.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-5 border-t border-warm-border/20 text-xs text-warm-gray">
          <p>
            Made with <i className="fas fa-heart text-red-400" /> by{" "}
            <a
              href="https://github.com/eneda8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest hover:text-forest-hover"
            >
              eneda
            </a>
          </p>
          <p className="mt-1">Contact: info@tday.co</p>
          <div className="flex gap-3 mt-3">
            <Link href="/terms" className="text-forest hover:text-forest-hover">Terms</Link>
            <Link href="/privacy" className="text-forest hover:text-forest-hover">Privacy</Link>
            <Link href="/cookies" className="text-forest hover:text-forest-hover">Cookies</Link>
            <Link href="/contact" className="text-forest hover:text-forest-hover">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
