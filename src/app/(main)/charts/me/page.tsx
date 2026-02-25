import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { getToday } from "@/lib/postHelpers";
import { MY_SUMMARY, MY_GRAPHS } from "@/lib/chartIds";
import ChartEmbed from "@/components/charts/ChartEmbed";
import ChartNav from "@/components/charts/ChartNav";

export default async function MyChartsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const userId = user._id.toString();
  const today = getToday();

  const userFilter = { authorID: userId };
  // "My Day" chart also needs today's date
  const dayFilter = { authorID: userId, date: today };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-warm-brown mb-1">
        @{user.username}&apos;s Charts
      </h1>

      {/* Nav */}
      <div className="mb-6">
        <ChartNav current="me" />
      </div>

      {/* Summary — 5 number charts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {MY_SUMMARY.map((chart, i) => (
          <ChartEmbed
            key={chart.id}
            chartId={chart.id}
            height={chart.height}
            maxDataAge={chart.maxDataAge}
            filter={i === 0 ? dayFilter : userFilter}
          />
        ))}
      </div>

      {/* Bar graphs — 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MY_GRAPHS.map((chart) => (
          <ChartEmbed
            key={chart.id}
            chartId={chart.id}
            height={chart.height}
            maxDataAge={chart.maxDataAge}
            filter={userFilter}
          />
        ))}
      </div>
    </div>
  );
}
