import Link from "next/link";
import { auth } from "@/lib/auth";
import { Sun, BookOpen, BarChart3, Users } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center text-center">
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-accent-light px-4 py-2">
            <Sun className="mr-2 h-5 w-5 text-accent-dark" />
            <span className="text-sm font-semibold text-forest">
              Welcome to t'day
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight text-forest sm:text-6xl">
            How was your day?
          </h1>

          <p className="mb-12 max-w-2xl text-xl text-warm-gray">
            Share your daily mood, track your wellbeing, and connect with a global community. Understand your patterns, celebrate your wins, and grow every day.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {session ? (
              <Link
                href="/home"
                className="inline-flex items-center justify-center rounded-lg bg-forest px-8 py-4 text-lg font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-card-hover"
              >
                Go to Home
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-forest px-8 py-4 text-lg font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-card-hover"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-forest bg-cream px-8 py-4 text-lg font-semibold text-forest transition-all hover:bg-cream-dark"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="grid gap-8 py-20 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1: Daily Mood Tracking */}
          <div className="rounded-lg bg-white p-8 shadow-card transition-all hover:shadow-card-hover">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light">
              <Sun className="h-6 w-6 text-accent-dark" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-forest">
              Daily Mood Tracking
            </h3>
            <p className="text-warm-gray">
              Log your daily mood and feelings with a simple, intuitive interface. Rate your day from 1 to 5 and add notes.
            </p>
          </div>

          {/* Feature 2: Private Journals */}
          <div className="rounded-lg bg-white p-8 shadow-card transition-all hover:shadow-card-hover">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light">
              <BookOpen className="h-6 w-6 text-accent-dark" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-forest">
              Private Journals
            </h3>
            <p className="text-warm-gray">
              Write detailed journal entries that are completely private. Only you can access your personal reflections.
            </p>
          </div>

          {/* Feature 3: Community Insights */}
          <div className="rounded-lg bg-white p-8 shadow-card transition-all hover:shadow-card-hover">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light">
              <Users className="h-6 w-6 text-accent-dark" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-forest">
              Community Insights
            </h3>
            <p className="text-warm-gray">
              Discover trends and insights from our global community. Connect with others on their wellbeing journey.
            </p>
          </div>

          {/* Feature 4: Personal Analytics */}
          <div className="rounded-lg bg-white p-8 shadow-card transition-all hover:shadow-card-hover">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light">
              <BarChart3 className="h-6 w-6 text-accent-dark" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-forest">
              Personal Analytics
            </h3>
            <p className="text-warm-gray">
              Visualize your mood patterns over time. Understand what influences your wellbeing with detailed charts.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
