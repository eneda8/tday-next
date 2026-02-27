import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExploreContent from "./ExploreContent";

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <ExploreContent />;
}
